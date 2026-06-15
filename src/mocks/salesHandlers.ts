import { http, HttpResponse, delay } from "msw";
import Decimal from "decimal.js";
import mockDataRaw from "./mock-data.json";
import type {
  Customer,
  Lot,
  MockData,
  PriceList,
  PriceListItem,
  Product,
  SalesOrder,
  SalesOrderLine,
  StockMovement,
} from "../types";
import type {
  ConfirmSalesOrderPayload,
  CreateSalesOrderPayload,
  DeliverSalesOrderPayload,
} from "../types/sales";

// ─────────────────────────────────────────────────────────────
// Self-contained, stateful mock backend for the SALES-ORDER spine.
//
// Spread BEFORE the read-only handlers in browser.ts so these routes win
// (first match wins in MSW). Lives in the /sales-orders/* and
// /inventory/availability namespaces. It deep-clones seed.lots into its own
// store, independent of productionHandlers' clone — the two features keep
// separate views of inventory, which is fine for a demo mock.
// ─────────────────────────────────────────────────────────────

const seed = mockDataRaw as unknown as MockData;
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

interface Store {
  customers: Customer[];
  priceLists: PriceList[];
  priceListItems: PriceListItem[];
  salesOrders: SalesOrder[];
  salesOrderLines: SalesOrderLine[];
  lots: Lot[];
  stockMovements: StockMovement[];
  products: Product[];
}

const store: Store = {
  customers: clone(seed.customers),
  priceLists: clone(seed.priceLists),
  priceListItems: clone(seed.priceListItems),
  salesOrders: clone(seed.salesOrders),
  salesOrderLines: clone(seed.salesOrderLines),
  lots: clone(seed.lots),
  stockMovements: clone(seed.stockMovements),
  products: clone(seed.products),
};

const TENANT = seed.tenant.id;
const CURRENCY = seed.tenant.defaultCurrency;
const ACTING_USER = "u-004"; // the sales user from the seed
const TAX_RATE = new Decimal("0.12"); // 12% UZS

const D = (v: Decimal.Value | null | undefined) => new Decimal(v || 0);
const money = (v: Decimal.Value) => D(v).toFixed(2);
const qty = (v: Decimal.Value) => D(v).toFixed(3);
const now = () => new Date().toISOString();
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

// ─── Reservation-aware availability (the trap) ────────────────
// Reserved = Σ allocatedLots.quantity across lines of CONFIRMED or PICKED
// orders. DELIVERED already decremented currentQuantity (exclude it, else
// double-count). DRAFT carries no allocations.
const reservedForLot = (lotId: string): Decimal =>
  store.salesOrderLines.reduce((acc, line) => {
    const o = store.salesOrders.find((s) => s.id === line.salesOrderId);
    if (!o || (o.status !== "CONFIRMED" && o.status !== "PICKED")) return acc;
    return line.allocatedLots
      .filter((a) => a.lotId === lotId)
      .reduce((a, al) => a.plus(D(al.quantity)), acc);
  }, new Decimal(0));

const availableOfLot = (lot: Lot): Decimal =>
  Decimal.max(D(lot.currentQuantity).minus(reservedForLot(lot.id)), 0);

const onHandForProduct = (productId: string): Decimal =>
  store.lots
    .filter((l) => l.productId === productId && l.status !== "SOLD_OUT")
    .reduce((acc, l) => acc.plus(D(l.currentQuantity)), new Decimal(0));

const reservedForProduct = (productId: string): Decimal =>
  store.lots
    .filter((l) => l.productId === productId)
    .reduce((acc, l) => acc.plus(reservedForLot(l.id)), new Decimal(0));

const hydrateOrder = (order: SalesOrder) => ({
  ...order,
  lines: store.salesOrderLines.filter((l) => l.salesOrderId === order.id),
});

export const salesHandlers = [
  // ─── Inventory availability ─────────────────────────────
  http.get("/api/inventory/availability", ({ request }) => {
    const productId = new URL(request.url).searchParams.get("productId") || "";
    const onHand = onHandForProduct(productId);
    const reserved = reservedForProduct(productId);
    return HttpResponse.json({
      productId,
      onHand: qty(onHand),
      reserved: qty(reserved),
      available: qty(Decimal.max(onHand.minus(reserved), 0)),
    });
  }),

  // ─── Suggest allocations (FEFO, reservation-aware) ──────
  // Registered before "/:id" so the extra path segment matches here.
  http.get("/api/sales-orders/:id/suggest-allocations", ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") || "";
    const lineId = url.searchParams.get("lineId") || undefined;
    const needed = D(url.searchParams.get("quantity") || 0);

    const candidates = store.lots
      .filter(
        (l) =>
          l.productId === productId &&
          l.status === "AVAILABLE" &&
          availableOfLot(l).greaterThan(0),
      )
      .sort((a, b) => (a.expiryDate < b.expiryDate ? -1 : 1));

    let remaining = needed;
    const suggestions = candidates.map((l) => {
      const avail = availableOfLot(l);
      const take = Decimal.min(avail, Decimal.max(remaining, 0));
      remaining = remaining.minus(take);
      return {
        lotId: l.id,
        lotNumber: l.lotNumber,
        availableQuantity: qty(avail),
        expiryDate: l.expiryDate,
        unitCost: money(l.unitCost),
        warehouseId: l.warehouseId,
        suggestedQuantity: qty(take),
      };
    });

    return HttpResponse.json({
      productId,
      lineId,
      requestedQuantity: qty(needed),
      shortfall: qty(Decimal.max(remaining, 0)),
      suggestions,
    });
  }),

  // ─── List + detail (shadow read-only routes) ────────────
  http.get("/api/sales-orders", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const customerId = url.searchParams.get("customerId");
    let orders = store.salesOrders;
    if (status) orders = orders.filter((o) => o.status === status);
    if (customerId) orders = orders.filter((o) => o.customerId === customerId);
    return HttpResponse.json(orders);
  }),

  http.get("/api/sales-orders/:id", ({ params }) => {
    const order = store.salesOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Create DRAFT order ─────────────────────────────────
  http.post("/api/sales-orders", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as CreateSalesOrderPayload;
    const stamp = now();
    const soId = rid("so");
    const orderNumber = `SO-2026-${String(store.salesOrders.length + 1).padStart(4, "0")}`;

    const lineTotals: Decimal[] = [];
    body.lines.forEach((l, i) => {
      const lineTotal = D(l.orderedQuantity).times(D(l.unitPrice));
      lineTotals.push(lineTotal);
      const line: SalesOrderLine = {
        id: `sol-${soId}-${i + 1}`,
        tenantId: TENANT,
        salesOrderId: soId,
        productId: l.productId,
        orderedQuantity: qty(l.orderedQuantity),
        uom: l.uom,
        unitPrice: money(l.unitPrice),
        lineTotal: money(lineTotal),
        allocatedLots: [],
      };
      store.salesOrderLines.push(line);
    });

    const subtotal = lineTotals.reduce((a, b) => a.plus(b), new Decimal(0));
    const taxAmount = subtotal.times(TAX_RATE);
    const order: SalesOrder = {
      id: soId,
      tenantId: TENANT,
      orderNumber,
      customerId: body.customerId,
      warehouseId: body.warehouseId,
      status: "DRAFT",
      currency: CURRENCY,
      orderDate: body.orderDate,
      promisedDate: body.promisedDate,
      subtotal: money(subtotal),
      taxAmount: money(taxAmount),
      totalAmount: money(subtotal.plus(taxAmount)),
      totalCogs: null,
      grossMargin: null,
      notes: body.notes ?? null,
      createdBy: ACTING_USER,
      createdAt: stamp,
      updatedAt: stamp,
    };
    store.salesOrders.unshift(order);
    return HttpResponse.json(hydrateOrder(order), { status: 201 });
  }),

  // ─── Confirm (reserve lots, no movement) ────────────────
  http.post("/api/sales-orders/:id/confirm", async ({ params, request }) => {
    await delay(250);
    const order = store.salesOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    if (order.status !== "DRAFT")
      return HttpResponse.json(
        { message: "Only DRAFT orders can be confirmed" },
        { status: 409 },
      );

    const body = (await request.json()) as ConfirmSalesOrderPayload;
    body.lines.forEach((bl) => {
      const line = store.salesOrderLines.find((l) => l.id === bl.lineId);
      if (!line) return;
      line.allocatedLots = bl.allocatedLots.map((a) => ({
        lotId: a.lotId,
        quantity: qty(a.quantity),
        unitCost: money(a.unitCost),
      }));
      // Mark allocated lots RESERVED (no decrement, no SALE movement).
      bl.allocatedLots.forEach((a) => {
        const lot = store.lots.find((l) => l.id === a.lotId);
        if (lot && lot.status === "AVAILABLE") lot.status = "RESERVED";
      });
    });

    order.status = "CONFIRMED";
    order.updatedAt = now();
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Pick ───────────────────────────────────────────────
  http.post("/api/sales-orders/:id/pick", async ({ params }) => {
    await delay(200);
    const order = store.salesOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    if (order.status !== "CONFIRMED")
      return HttpResponse.json(
        { message: "Only CONFIRMED orders can be picked" },
        { status: 409 },
      );
    order.status = "PICKED";
    order.updatedAt = now();
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Deliver (decrement lots, SALE movements, COGS/margin) ─
  http.post("/api/sales-orders/:id/deliver", async ({ params, request }) => {
    await delay(300);
    const order = store.salesOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    if (order.status !== "PICKED")
      return HttpResponse.json(
        { message: "Only PICKED orders can be delivered" },
        { status: 409 },
      );

    const body = (await request.json()) as DeliverSalesOrderPayload;
    const stamp = body.deliveredDate
      ? new Date(body.deliveredDate).toISOString()
      : now();
    const lines = store.salesOrderLines.filter(
      (l) => l.salesOrderId === order.id,
    );

    let totalCogs = new Decimal(0);
    lines.forEach((line) => {
      line.allocatedLots.forEach((a) => {
        const lineCost = D(a.quantity).times(D(a.unitCost));
        totalCogs = totalCogs.plus(lineCost);

        const lot = store.lots.find((l) => l.id === a.lotId);
        if (lot) {
          const left = Decimal.max(D(lot.currentQuantity).minus(D(a.quantity)), 0);
          lot.currentQuantity = qty(left);
          lot.status = left.isZero() ? "SOLD_OUT" : "AVAILABLE";
          lot.updatedAt = stamp;
        }
        store.stockMovements.unshift({
          id: rid("mov"),
          tenantId: TENANT,
          type: "SALE",
          lotId: a.lotId,
          warehouseId: order.warehouseId,
          quantity: qty(D(a.quantity).negated()),
          uom: line.uom,
          unitCost: money(a.unitCost),
          totalCost: money(lineCost),
          referenceType: "SALES_ORDER",
          referenceId: order.id,
          reasonCode: null,
          notes: null,
          performedBy: ACTING_USER,
          performedAt: stamp,
          createdAt: stamp,
        });
      });
    });

    order.status = "DELIVERED";
    order.totalCogs = money(totalCogs);
    order.grossMargin = money(D(order.subtotal).minus(totalCogs));
    if (body.notes) order.notes = body.notes;
    order.updatedAt = stamp;
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Delete order (any status, per product decision) ────
  http.delete("/api/sales-orders/:id", ({ params }) => {
    const idx = store.salesOrders.findIndex((o) => o.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    store.salesOrders.splice(idx, 1);
    store.salesOrderLines = store.salesOrderLines.filter(
      (l) => l.salesOrderId !== params.id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Customers (read-only, shadow) ──────────────────────
  http.get("/api/customers", ({ request }) => {
    const type = new URL(request.url).searchParams.get("type");
    let customers = store.customers;
    if (type) customers = customers.filter((c) => c.type === type);
    return HttpResponse.json(customers);
  }),

  http.get("/api/customers/:id", ({ params }) => {
    const customer = store.customers.find((c) => c.id === params.id);
    return customer
      ? HttpResponse.json(customer)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Price list with items (shadow) ─────────────────────
  http.get("/api/price-lists/:id", ({ params }) => {
    const priceList = store.priceLists.find((pl) => pl.id === params.id);
    if (!priceList) return new HttpResponse(null, { status: 404 });
    const items = store.priceListItems.filter(
      (i) => i.priceListId === params.id,
    );
    return HttpResponse.json({ ...priceList, items });
  }),
];
