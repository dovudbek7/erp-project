import { http, HttpResponse, delay } from "msw";
import Decimal from "decimal.js";
import mockDataRaw from "./mock-data.json";
import type { MockData, Lot } from "../types";

// ─────────────────────────────────────────────────────────────
// Read-only reporting endpoints, computed from the seed data.
//
// Lives in its own handler array (spread before the generic handlers in
// browser.ts) under the /reports/* namespace, so it never collides with
// the lots / production / sales work. Reports are aggregate snapshots —
// they read the static seed, which is fine for the dashboards.
// ─────────────────────────────────────────────────────────────

const data = mockDataRaw as unknown as MockData;

const D = (v: string | number | null | undefined) => new Decimal(v || 0);
const money = (v: Decimal | string | number) => D(v as never).toFixed(2);
const qty = (v: Decimal | string | number) => D(v as never).toFixed(3);

// The seed's "today" — use the anchor date so the windows line up with data.
const ANCHOR = new Date(data._meta.anchorDate);
const anchorMs = ANCHOR.getTime();
const dayKey = (iso: string) => iso.slice(0, 10);
const daysBetween = (a: number, b: number) =>
  Math.floor((a - b) / (1000 * 60 * 60 * 24));

const productsById = new Map(data.products.map((p) => [p.id, p]));
const recipesById = new Map(data.recipes.map((r) => [r.id, r]));
const lotsById = new Map(data.lots.map((l) => [l.id, l]));

// On-hand = lots still carrying quantity and not sold out.
const onHandLots = data.lots.filter(
  (l) => l.status !== "SOLD_OUT" && D(l.currentQuantity).greaterThan(0),
);

const lotValue = (l: Lot) => D(l.currentQuantity).times(D(l.unitCost));

export const reportsHandlers = [
  // ─── Dashboard ────────────────────────────────────────────
  http.get("/api/reports/dashboard", async () => {
    await delay(300);

    const stockOnHandValue = onHandLots.reduce(
      (acc, l) => acc.plus(lotValue(l)),
      new Decimal(0),
    );

    // Lots expiring within 7 days of the anchor (not already expired-out).
    const expiringSoon = onHandLots
      .map((l) => ({
        lotId: l.id,
        lotNumber: l.lotNumber,
        productId: l.productId,
        productName: productsById.get(l.productId)?.name ?? l.productId,
        warehouseId: l.warehouseId,
        currentQuantity: qty(l.currentQuantity),
        uom: l.uom,
        expiryDate: l.expiryDate,
        daysToExpiry: daysBetween(new Date(l.expiryDate).getTime(), anchorMs),
        value: money(lotValue(l)),
      }))
      .filter((l) => l.daysToExpiry <= 7)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

    const activeProductionOrders = data.productionOrders.filter(
      (o) => o.status === "IN_PROGRESS" || o.status === "DRAFT",
    ).length;

    // Today's production output (PRODUCTION_OUTPUT movements on the anchor day).
    const todayKey = dayKey(data._meta.anchorDate);
    const todayProductionOutput = data.stockMovements
      .filter(
        (m) =>
          m.type === "PRODUCTION_OUTPUT" && dayKey(m.performedAt) === todayKey,
      )
      .reduce((acc, m) => acc.plus(D(m.quantity)), new Decimal(0));

    const outstandingAR = data.invoices
      .filter((i) => i.status !== "PAID")
      .reduce((acc, i) => acc.plus(D(i.outstandingAmount)), new Decimal(0));

    // Last 30 days of production output, bucketed by day (ending at anchor).
    const buckets = new Map<string, Decimal>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(anchorMs - i * 86400000);
      buckets.set(d.toISOString().slice(0, 10), new Decimal(0));
    }
    data.stockMovements
      .filter((m) => m.type === "PRODUCTION_OUTPUT")
      .forEach((m) => {
        const k = dayKey(m.performedAt);
        if (buckets.has(k)) buckets.set(k, buckets.get(k)!.plus(D(m.quantity)));
      });
    const productionOutput30d = Array.from(buckets.entries()).map(
      ([date, v]) => ({ date, quantity: Number(qty(v)) }),
    );

    return HttpResponse.json({
      stockOnHandValue: money(stockOnHandValue),
      lotsExpiringSoon: expiringSoon,
      activeProductionOrders,
      todayProductionOutput: qty(todayProductionOutput),
      outstandingAR: money(outstandingAR),
      currency: data._meta.currency,
      productionOutput30d,
    });
  }),

  // ─── Yield report ─────────────────────────────────────────
  http.get("/api/reports/yield", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const recipeId = url.searchParams.get("recipeId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    let orders = data.productionOrders.filter((o) => o.status === "COMPLETED");
    if (recipeId) orders = orders.filter((o) => o.recipeId === recipeId);
    if (from)
      orders = orders.filter(
        (o) => o.completedAt && o.completedAt >= from,
      );
    if (to)
      orders = orders.filter((o) => o.completedAt && o.completedAt <= `${to}T23:59:59`);

    // Group by recipe.
    const groups = new Map<
      string,
      {
        recipeId: string;
        recipeName: string;
        batches: number;
        plannedOutput: Decimal;
        actualOutput: Decimal;
        totalCost: Decimal;
        yields: number[];
      }
    >();
    orders.forEach((o) => {
      const g =
        groups.get(o.recipeId) ??
        {
          recipeId: o.recipeId,
          recipeName: recipesById.get(o.recipeId)?.name ?? o.recipeId,
          batches: 0,
          plannedOutput: new Decimal(0),
          actualOutput: new Decimal(0),
          totalCost: new Decimal(0),
          yields: [] as number[],
        };
      g.batches += 1;
      g.plannedOutput = g.plannedOutput.plus(D(o.plannedOutputQuantity));
      g.actualOutput = g.actualOutput.plus(D(o.actualOutputQuantity));
      g.totalCost = g.totalCost.plus(D(o.totalInputCost));
      if (o.yieldPercent) g.yields.push(Number(o.yieldPercent));
      groups.set(o.recipeId, g);
    });

    const rows = Array.from(groups.values()).map((g) => {
      const expected = recipesById.get(g.recipeId)?.expectedYieldPercent ?? 0;
      const avgYield = g.yields.length
        ? g.yields.reduce((a, b) => a + b, 0) / g.yields.length
        : 0;
      return {
        recipeId: g.recipeId,
        recipeName: g.recipeName,
        batches: g.batches,
        plannedOutput: qty(g.plannedOutput),
        actualOutput: qty(g.actualOutput),
        totalCost: money(g.totalCost),
        avgYieldPercent: new Decimal(avgYield).toFixed(2),
        expectedYieldPercent: expected,
        yieldVariance: new Decimal(avgYield - expected).toFixed(2),
      };
    });

    return HttpResponse.json({ rows, batchCount: orders.length });
  }),

  // ─── Inventory valuation ──────────────────────────────────
  http.get("/api/reports/inventory-valuation", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const warehouseId = url.searchParams.get("warehouseId");
    const productType = url.searchParams.get("productType");

    let lots = onHandLots;
    if (warehouseId) lots = lots.filter((l) => l.warehouseId === warehouseId);
    if (productType)
      lots = lots.filter(
        (l) => productsById.get(l.productId)?.type === productType,
      );

    // Group by warehouse → product type.
    const groups = new Map<
      string,
      {
        warehouseId: string;
        warehouseName: string;
        productType: string;
        lotCount: number;
        totalQuantity: Decimal;
        totalValue: Decimal;
      }
    >();
    lots.forEach((l) => {
      const type = productsById.get(l.productId)?.type ?? "UNKNOWN";
      const key = `${l.warehouseId}:${type}`;
      const wh = data.warehouses.find((w) => w.id === l.warehouseId);
      const g =
        groups.get(key) ??
        {
          warehouseId: l.warehouseId,
          warehouseName: wh?.name ?? l.warehouseId,
          productType: type,
          lotCount: 0,
          totalQuantity: new Decimal(0),
          totalValue: new Decimal(0),
        };
      g.lotCount += 1;
      g.totalQuantity = g.totalQuantity.plus(D(l.currentQuantity));
      g.totalValue = g.totalValue.plus(lotValue(l));
      groups.set(key, g);
    });

    const rows = Array.from(groups.values()).map((g) => ({
      warehouseId: g.warehouseId,
      warehouseName: g.warehouseName,
      productType: g.productType,
      lotCount: g.lotCount,
      totalQuantity: qty(g.totalQuantity),
      totalValue: money(g.totalValue),
    }));
    const grandTotal = rows.reduce(
      (acc, r) => acc.plus(D(r.totalValue)),
      new Decimal(0),
    );

    return HttpResponse.json({ rows, grandTotal: money(grandTotal) });
  }),

  // ─── Traceability tree ────────────────────────────────────
  // direction=backward → walk parentLotIds (what went INTO this lot).
  // direction=forward  → walk lots that list this lot as a parent
  //                      (where this lot ENDED UP).
  http.get("/api/reports/traceability", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const lotId = url.searchParams.get("lotId") || "";
    const direction = (url.searchParams.get("direction") || "backward") as
      | "backward"
      | "forward";

    const childrenOf = (id: string) =>
      data.lots.filter((l) => l.parentLotIds.includes(id));

    const nodeFor = (lot: Lot, depth: number): TraceNode => {
      const nextLots =
        direction === "backward"
          ? lot.parentLotIds
              .map((pid) => lotsById.get(pid))
              .filter((l): l is Lot => !!l)
          : childrenOf(lot.id);
      return {
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        productId: lot.productId,
        productName: productsById.get(lot.productId)?.name ?? lot.productId,
        warehouseId: lot.warehouseId,
        quantity: qty(lot.currentQuantity),
        uom: lot.uom,
        unitCost: money(lot.unitCost),
        expiryDate: lot.expiryDate,
        source: lot.source,
        status: lot.status,
        depth,
        // Guard against runaway depth on any accidental cycle in the data.
        children: depth < 8 ? nextLots.map((l) => nodeFor(l, depth + 1)) : [],
      };
    };

    const root = lotsById.get(lotId);
    if (!root) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ direction, root: nodeFor(root, 0) });
  }),
];

interface TraceNode {
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  warehouseId: string;
  quantity: string;
  uom: string;
  unitCost: string;
  expiryDate: string;
  source: string;
  status: string;
  depth: number;
  children: TraceNode[];
}
