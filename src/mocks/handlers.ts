import { http, HttpResponse, delay } from "msw";
import mockDataRaw from "./mock-data.json";
import type {
  CreatePurchaseOrderPayload,
  GoodsReceipt,
  GoodsReceiptLine,
  Lot,
  MockData,
  PurchaseOrder,
  PurchaseOrderLine,
  ReceiveGoodsPayload,
} from "../types";
import { add, money, mul, qty, gte, sum } from "../utilties/money";

const mockData = mockDataRaw as unknown as MockData;

const TENANT_ID = mockData.tenant?.id ?? "t-andijan-001";
const rand = () => Math.random().toString(36).slice(2, 8);
const pad = (n: number) => String(n).padStart(4, "0");

export const handlers = [
  // ─── Tenant ───────────────────────────────────────────────
  http.get("/api/tenant", async () => {
    await delay(300);
    return HttpResponse.json(mockData.tenant);
  }),

  // ─── Users ────────────────────────────────────────────────
  http.get("/api/users", () => {
    return HttpResponse.json(mockData.users);
  }),

  http.get("/api/users/:id", ({ params }) => {
    const user = mockData.users.find((u) => u.id === params.id);
    return user
      ? HttpResponse.json(user)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Warehouses ───────────────────────────────────────────
  http.get("/api/warehouses", () => {
    return HttpResponse.json(mockData.warehouses);
  }),

  http.get("/api/warehouses/:id", ({ params }) => {
    const warehouse = mockData.warehouses.find((w) => w.id === params.id);
    return warehouse
      ? HttpResponse.json(warehouse)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Products ─────────────────────────────────────────────
  http.get("/api/products", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    let products = mockData.products;
    if (type) products = products.filter((p) => p.type === type);
    if (category) products = products.filter((p) => p.category === category);
    return HttpResponse.json(products);
  }),

  http.get("/api/products/:id", ({ params }) => {
    const product = mockData.products.find((p) => p.id === params.id);
    return product
      ? HttpResponse.json(product)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Suppliers ────────────────────────────────────────────
  http.get("/api/suppliers", () => {
    return HttpResponse.json(mockData.suppliers);
  }),

  http.get("/api/suppliers/:id", ({ params }) => {
    const supplier = mockData.suppliers.find((s) => s.id === params.id);
    return supplier
      ? HttpResponse.json(supplier)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Customers ────────────────────────────────────────────
  http.get("/api/customers", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    let customers = mockData.customers;
    if (type) customers = customers.filter((c) => c.type === type);
    return HttpResponse.json(customers);
  }),

  http.get("/api/customers/:id", ({ params }) => {
    const customer = mockData.customers.find((c) => c.id === params.id);
    return customer
      ? HttpResponse.json(customer)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Price Lists ──────────────────────────────────────────
  http.get("/api/price-lists", () => {
    return HttpResponse.json(mockData.priceLists);
  }),

  http.get("/api/price-lists/:id", ({ params }) => {
    const priceList = mockData.priceLists.find((pl) => pl.id === params.id);
    if (!priceList) return new HttpResponse(null, { status: 404 });
    const items = mockData.priceListItems.filter(
      (item) => item.priceListId === params.id,
    );
    return HttpResponse.json({ ...priceList, items });
  }),

  http.get("/api/price-list-items", ({ request }) => {
    const url = new URL(request.url);
    const priceListId = url.searchParams.get("priceListId");
    const productId = url.searchParams.get("productId");
    let items = mockData.priceListItems;
    if (priceListId) items = items.filter((i) => i.priceListId === priceListId);
    if (productId) items = items.filter((i) => i.productId === productId);
    return HttpResponse.json(items);
  }),

  // ─── Purchase Orders ──────────────────────────────────────
  http.get("/api/purchase-orders", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const supplierId = url.searchParams.get("supplierId");
    let orders = mockData.purchaseOrders;
    if (status) orders = orders.filter((o) => o.status === status);
    if (supplierId) orders = orders.filter((o) => o.supplierId === supplierId);
    return HttpResponse.json(orders);
  }),

  http.get("/api/purchase-orders/:id", ({ params }) => {
    const order = mockData.purchaseOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    const lines = mockData.purchaseOrderLines.filter(
      (l) => l.purchaseOrderId === params.id,
    );
    return HttpResponse.json({ ...order, lines });
  }),

  http.get("/api/purchase-order-lines", ({ request }) => {
    const url = new URL(request.url);
    const purchaseOrderId = url.searchParams.get("purchaseOrderId");
    let lines = mockData.purchaseOrderLines;
    if (purchaseOrderId)
      lines = lines.filter((l) => l.purchaseOrderId === purchaseOrderId);
    return HttpResponse.json(lines);
  }),

  // ─── Goods Receipts ───────────────────────────────────────
  http.get("/api/goods-receipts", ({ request }) => {
    const url = new URL(request.url);
    const purchaseOrderId = url.searchParams.get("purchaseOrderId");
    let receipts = mockData.goodsReceipts;
    if (purchaseOrderId)
      receipts = receipts.filter((r) => r.purchaseOrderId === purchaseOrderId);
    return HttpResponse.json(receipts);
  }),

  http.get("/api/goods-receipts/:id", ({ params }) => {
    const receipt = mockData.goodsReceipts.find((r) => r.id === params.id);
    if (!receipt) return new HttpResponse(null, { status: 404 });
    const lines = mockData.goodsReceiptLines.filter(
      (l) => l.goodsReceiptId === params.id,
    );
    return HttpResponse.json({ ...receipt, lines });
  }),

  // ─── Lots ─────────────────────────────────────────────────
  http.get("/api/lots", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const productId = url.searchParams.get("productId");
    const warehouseId = url.searchParams.get("warehouseId");
    const source = url.searchParams.get("source");
    let lots = mockData.lots;
    if (status) lots = lots.filter((l) => l.status === status);
    if (productId) lots = lots.filter((l) => l.productId === productId);
    if (warehouseId) lots = lots.filter((l) => l.warehouseId === warehouseId);
    if (source) lots = lots.filter((l) => l.source === source);
    return HttpResponse.json(lots);
  }),

  http.get("/api/lots/:id", ({ params }) => {
    const lot = mockData.lots.find((l) => l.id === params.id);
    return lot
      ? HttpResponse.json(lot)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Stock Movements ──────────────────────────────────────
  http.get("/api/stock-movements", ({ request }) => {
    const url = new URL(request.url);
    const lotId = url.searchParams.get("lotId");
    const warehouseId = url.searchParams.get("warehouseId");
    const type = url.searchParams.get("type");
    let movements = mockData.stockMovements;
    if (lotId) movements = movements.filter((m) => m.lotId === lotId);
    if (warehouseId)
      movements = movements.filter((m) => m.warehouseId === warehouseId);
    if (type) movements = movements.filter((m) => m.type === type);
    return HttpResponse.json(movements);
  }),

  // ─── Recipes ──────────────────────────────────────────────
  http.get("/api/recipes", () => {
    return HttpResponse.json(mockData.recipes);
  }),

  http.get("/api/recipes/:id", ({ params }) => {
    const recipe = mockData.recipes.find((r) => r.id === params.id);
    if (!recipe) return new HttpResponse(null, { status: 404 });
    const ingredients = mockData.recipeIngredients.filter(
      (i) => i.recipeId === params.id,
    );
    return HttpResponse.json({ ...recipe, ingredients });
  }),

  // ─── Production Orders ────────────────────────────────────
  http.get("/api/production-orders", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const recipeId = url.searchParams.get("recipeId");
    let orders = mockData.productionOrders;
    if (status) orders = orders.filter((o) => o.status === status);
    if (recipeId) orders = orders.filter((o) => o.recipeId === recipeId);
    return HttpResponse.json(orders);
  }),

  http.get("/api/production-orders/:id", ({ params }) => {
    const order = mockData.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    const inputs = mockData.productionOrderInputs.filter(
      (i) => i.productionOrderId === params.id,
    );
    return HttpResponse.json({ ...order, inputs });
  }),

  // ─── Sales Orders ─────────────────────────────────────────
  http.get("/api/sales-orders", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const customerId = url.searchParams.get("customerId");
    let orders = mockData.salesOrders;
    if (status) orders = orders.filter((o) => o.status === status);
    if (customerId) orders = orders.filter((o) => o.customerId === customerId);
    return HttpResponse.json(orders);
  }),

  http.get("/api/sales-orders/:id", ({ params }) => {
    const order = mockData.salesOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    const lines = mockData.salesOrderLines.filter(
      (l) => l.salesOrderId === params.id,
    );
    return HttpResponse.json({ ...order, lines });
  }),

  http.get("/api/sales-order-lines", ({ request }) => {
    const url = new URL(request.url);
    const salesOrderId = url.searchParams.get("salesOrderId");
    let lines = mockData.salesOrderLines;
    if (salesOrderId)
      lines = lines.filter((l) => l.salesOrderId === salesOrderId);
    return HttpResponse.json(lines);
  }),

  // ─── Invoices ─────────────────────────────────────────────
  http.get("/api/invoices", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const customerId = url.searchParams.get("customerId");
    let invoices = mockData.invoices;
    if (status) invoices = invoices.filter((i) => i.status === status);
    if (customerId)
      invoices = invoices.filter((i) => i.customerId === customerId);
    return HttpResponse.json(invoices);
  }),

  http.get("/api/invoices/:id", ({ params }) => {
    const invoice = mockData.invoices.find((i) => i.id === params.id);
    return invoice
      ? HttpResponse.json(invoice)
      : new HttpResponse(null, { status: 404 });
  }),

  // ─── Payments ─────────────────────────────────────────────
  http.get("/api/payments", ({ request }) => {
    const url = new URL(request.url);
    const invoiceId = url.searchParams.get("invoiceId");
    let payments = mockData.payments;
    if (invoiceId) payments = payments.filter((p) => p.invoiceId === invoiceId);
    return HttpResponse.json(payments);
  }),

  // ─── Create Purchase Order (stateful) ─────────────────────
  // Must precede the generic POST so it wins for /api/purchase-orders.
  http.post("/api/purchase-orders", async ({ request }) => {
    const body = (await request.json()) as CreatePurchaseOrderPayload;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const year = today.slice(0, 4);
    const poId = `po-new-${rand()}`;
    const poNumber = `PO-${year}-${pad(mockData.purchaseOrders.length + 1)}`;

    const lineTotals: string[] = [];
    body.lines.forEach((l, i) => {
      const lineTotal = money(mul(qty(l.orderedQuantity), money(l.unitPrice)));
      lineTotals.push(lineTotal);
      const line: PurchaseOrderLine = {
        id: `pol-${poId}-${i + 1}`,
        tenantId: TENANT_ID,
        purchaseOrderId: poId,
        productId: l.productId,
        orderedQuantity: qty(l.orderedQuantity),
        receivedQuantity: "0.000",
        uom: l.uom,
        unitPrice: money(l.unitPrice),
        lineTotal,
      };
      mockData.purchaseOrderLines.push(line);
    });

    const order: PurchaseOrder = {
      id: poId,
      tenantId: TENANT_ID,
      poNumber,
      supplierId: body.supplierId,
      warehouseId: body.warehouseId,
      status: "DRAFT",
      currency: body.currency,
      orderDate: today,
      expectedDate: body.expectedDate,
      totalAmount: money(sum(lineTotals)),
      notes: body.notes ?? null,
      createdBy: "u-001",
      createdAt: now,
      updatedAt: now,
    };
    mockData.purchaseOrders.unshift(order);
    console.log("[MSW] POST /purchase-orders (created)", order.id);
    return HttpResponse.json(order, { status: 201 });
  }),

  // ─── Receive Goods against a PO (stateful) ────────────────
  http.post("/api/purchase-orders/:id/receive", async ({ params, request }) => {
    const order = mockData.purchaseOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as ReceiveGoodsPayload;
    const now = new Date().toISOString();
    const grId = `gr-new-${rand()}`;
    const receiptNumber = `GR-${now.slice(0, 4)}-${pad(
      mockData.goodsReceipts.length + 1,
    )}`;

    const receipt: GoodsReceipt = {
      id: grId,
      tenantId: TENANT_ID,
      receiptNumber,
      purchaseOrderId: order.id,
      warehouseId: body.warehouseId,
      receivedAt: now,
      receivedBy: "u-001",
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    mockData.goodsReceipts.push(receipt);

    const receiptLines: GoodsReceiptLine[] = [];
    body.lines.forEach((line, i) => {
      const lotId = `lot-new-${rand()}`;
      const lot: Lot = {
        id: lotId,
        tenantId: TENANT_ID,
        lotNumber: `LOT-${now.slice(0, 10)}-${rand()}`,
        productId: line.productId,
        warehouseId: body.warehouseId,
        status: "AVAILABLE",
        initialQuantity: qty(line.quantity),
        currentQuantity: qty(line.quantity),
        uom: line.uom,
        unitCost: money(line.unitCost),
        currency: order.currency,
        productionDate: line.productionDate,
        expiryDate: line.expiryDate,
        receivedAt: now,
        source: "PURCHASE",
        purchaseOrderLineId: line.purchaseOrderLineId,
        productionOrderId: null,
        parentLotIds: [],
        supplierLotRef: line.supplierLotRef,
        notes: null,
        createdAt: now,
        updatedAt: now,
      };
      mockData.lots.unshift(lot);

      const grLine: GoodsReceiptLine = {
        id: `grl-${grId}-${i + 1}`,
        tenantId: TENANT_ID,
        goodsReceiptId: grId,
        purchaseOrderLineId: line.purchaseOrderLineId,
        productId: line.productId,
        quantity: qty(line.quantity),
        uom: line.uom,
        unitCost: money(line.unitCost),
        supplierLotRef: line.supplierLotRef,
        productionDate: line.productionDate,
        expiryDate: line.expiryDate,
        lotId,
      };
      receiptLines.push(grLine);
      mockData.goodsReceiptLines.push(grLine);

      const poLine = mockData.purchaseOrderLines.find(
        (l) => l.id === line.purchaseOrderLineId,
      );
      if (poLine) {
        poLine.receivedQuantity = qty(
          add(poLine.receivedQuantity, line.quantity),
        );
      }
    });

    // PO status transition based on ALL of its lines.
    const poLines = mockData.purchaseOrderLines.filter(
      (l) => l.purchaseOrderId === order.id,
    );
    const allFull = poLines.every((l) =>
      gte(l.receivedQuantity, l.orderedQuantity),
    );
    order.status = allFull ? "RECEIVED" : "PARTIALLY_RECEIVED";
    order.updatedAt = now;

    console.log("[MSW] POST /purchase-orders/:id/receive", order.id, order.status);
    return HttpResponse.json(
      { ...receipt, lines: receiptLines },
      { status: 201 },
    );
  }),

  // ─── Generic DELETE (mockData-backed collections) ─────────
  // Stateful collections (sales-orders, recipes, production-orders) have their
  // own DELETE handlers spread earlier in browser.ts and win the match; this
  // only ever services the read-only mockData collections below.
  http.delete("/api/:collection/:id", ({ params }) => {
    const { collection, id } = params as { collection: string; id: string };
    const keyMap: Record<string, keyof MockData> = {
      products: "products",
      lots: "lots",
      warehouses: "warehouses",
      customers: "customers",
      suppliers: "suppliers",
      "purchase-orders": "purchaseOrders",
    };
    const key = keyMap[collection];
    if (!key) return new HttpResponse(null, { status: 404 });

    const arr = mockData[key] as Array<{ id: string }>;
    const idx = arr.findIndex((r) => r.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    arr.splice(idx, 1);

    // Clean child rows to avoid orphans.
    if (collection === "purchase-orders") {
      mockData.purchaseOrderLines = mockData.purchaseOrderLines.filter(
        (l) => l.purchaseOrderId !== id,
      );
    }
    console.log(`[MSW] DELETE /${collection}/${id}`);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Generic POST ─────────────────────────────────────────
  http.post("/api/:collection", async ({ params, request }) => {
    const body = await request.json();
    console.log(`[MSW] POST /${params.collection}`, body);
    return HttpResponse.json(
      {
        ...(body as object),
        id: `new-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // ─── Generic PATCH ────────────────────────────────────────
  http.patch("/api/:collection/:id", async ({ params, request }) => {
    const body = await request.json();
    console.log(`[MSW] PATCH /${params.collection}/${params.id}`, body);
    return HttpResponse.json({
      ...(body as object),
      id: params.id,
      updatedAt: new Date().toISOString(),
    });
  }),
];
