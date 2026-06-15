import { http, HttpResponse, delay } from "msw";
import Decimal from "decimal.js";
import mockDataRaw from "./mock-data.json";
import type {
  MockData,
  Lot,
  StockMovement,
  ProductionOrder,
  ProductionOrderInput,
  Recipe,
  RecipeIngredient,
  ConsumedLot,
  Product,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Self-contained, stateful mock backend for PRODUCTION + RECIPES.
//
// Lives in its own handler array (spread BEFORE the generic handlers
// in browser.ts) so it shadows the read-only production/recipe routes
// in handlers.ts without touching that file. Everything stays inside
// the /production-orders/* and /recipes/* namespaces — it never
// touches the lots or purchase-order routes, so it can't collide with
// the receiving-goods work happening in parallel.
// ─────────────────────────────────────────────────────────────

const seed = mockDataRaw as unknown as MockData;

// Deep clone so mutations never bleed into the imported JSON module.
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

interface Store {
  productionOrders: ProductionOrder[];
  productionOrderInputs: ProductionOrderInput[];
  recipes: Recipe[];
  recipeIngredients: RecipeIngredient[];
  lots: Lot[];
  stockMovements: StockMovement[];
  products: Product[];
}

const store: Store = {
  productionOrders: clone(seed.productionOrders),
  productionOrderInputs: clone(seed.productionOrderInputs),
  recipes: clone(seed.recipes),
  recipeIngredients: clone(seed.recipeIngredients),
  lots: clone(seed.lots),
  stockMovements: clone(seed.stockMovements),
  products: clone(seed.products),
};

const TENANT = seed.tenant.id;
const CURRENCY = seed.tenant.defaultCurrency;
// The production manager from the seed — stands in for the logged-in user.
const ACTING_USER = "u-002";

// Categories whose actual mass counts toward the yield denominator.
// Spices / salt / packaging are seasoning, not mass input.
const MEAT_CATEGORIES = new Set(["Beef", "Pork", "Lamb"]);

const D = (v: string | number | null | undefined) => new Decimal(v || 0);
const money = (v: Decimal | string | number) => D(v as never).toFixed(2);
const qty = (v: Decimal | string | number) => D(v as never).toFixed(3);

const now = () => new Date().toISOString();
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const productOf = (id: string) => store.products.find((p) => p.id === id);

// Enrich an order with everything the detail screen needs.
function hydrateOrder(order: ProductionOrder) {
  const inputs = store.productionOrderInputs.filter(
    (i) => i.productionOrderId === order.id,
  );
  const recipe = store.recipes.find((r) => r.id === order.recipeId) || null;
  const ingredients = recipe
    ? store.recipeIngredients.filter((i) => i.recipeId === recipe.id)
    : [];
  const outputLot = order.outputLotId
    ? store.lots.find((l) => l.id === order.outputLotId) || null
    : null;
  const movements = store.stockMovements.filter(
    (m) => m.referenceType === "PRODUCTION_ORDER" && m.referenceId === order.id,
  );
  return {
    ...order,
    inputs,
    recipe: recipe ? { ...recipe, ingredients } : null,
    outputLot,
    movements,
  };
}

export const productionHandlers = [
  // ─── Recipes ──────────────────────────────────────────────
  http.get("/api/recipes", () => HttpResponse.json(store.recipes)),

  http.get("/api/recipes/:id", ({ params }) => {
    const recipe = store.recipes.find((r) => r.id === params.id);
    if (!recipe) return new HttpResponse(null, { status: 404 });
    const ingredients = store.recipeIngredients.filter(
      (i) => i.recipeId === recipe.id,
    );
    return HttpResponse.json({ ...recipe, ingredients });
  }),

  http.post("/api/recipes", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const ingredients = (body.ingredients as RecipeIngredient[]) || [];
    const recipeId = rid("rcp");
    const recipe: Recipe = {
      id: recipeId,
      tenantId: TENANT,
      code: String(body.code ?? ""),
      name: String(body.name ?? ""),
      outputProductId: String(body.outputProductId ?? ""),
      outputQuantity: Number(body.outputQuantity ?? 0),
      outputUom: String(body.outputUom ?? "KG"),
      expectedYieldPercent: Number(body.expectedYieldPercent ?? 0),
      version: 1,
      isActive: true,
      notes: (body.notes as string) ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    store.recipes.unshift(recipe);
    ingredients.forEach((ing) => {
      store.recipeIngredients.push({
        id: rid("ing"),
        tenantId: TENANT,
        recipeId,
        productId: ing.productId,
        quantity: qty(ing.quantity),
        uom: ing.uom || "KG",
        isOptional: !!ing.isOptional,
        notes: ing.notes ?? null,
      });
    });
    return HttpResponse.json({ ...recipe, ingredients }, { status: 201 });
  }),

  // Editing a published recipe creates a NEW version (don't mutate the
  // published one); the old version is deactivated.
  http.post("/api/recipes/:id/new-version", async ({ params, request }) => {
    await delay(200);
    const prev = store.recipes.find((r) => r.id === params.id);
    if (!prev) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const ingredients = (body.ingredients as RecipeIngredient[]) || [];
    prev.isActive = false;
    prev.updatedAt = now();
    const recipeId = rid("rcp");
    const recipe: Recipe = {
      id: recipeId,
      tenantId: TENANT,
      code: String(body.code ?? prev.code),
      name: String(body.name ?? prev.name),
      outputProductId: String(body.outputProductId ?? prev.outputProductId),
      outputQuantity: Number(body.outputQuantity ?? prev.outputQuantity),
      outputUom: String(body.outputUom ?? prev.outputUom),
      expectedYieldPercent: Number(
        body.expectedYieldPercent ?? prev.expectedYieldPercent,
      ),
      version: prev.version + 1,
      isActive: true,
      notes: (body.notes as string) ?? prev.notes,
      createdAt: now(),
      updatedAt: now(),
    };
    store.recipes.unshift(recipe);
    ingredients.forEach((ing) => {
      store.recipeIngredients.push({
        id: rid("ing"),
        tenantId: TENANT,
        recipeId,
        productId: ing.productId,
        quantity: qty(ing.quantity),
        uom: ing.uom || "KG",
        isOptional: !!ing.isOptional,
        notes: ing.notes ?? null,
      });
    });
    return HttpResponse.json({ ...recipe, ingredients }, { status: 201 });
  }),

  // ─── Production orders — suggest lots (FEFO) ──────────────
  // Must be registered before "/:id" so the extra path segment matches here.
  http.get(
    "/api/production-orders/:id/suggest-lots",
    ({ request }) => {
      const url = new URL(request.url);
      const productId = url.searchParams.get("productId") || "";
      const needed = D(url.searchParams.get("quantity") || 0);

      // Available stock for this product, first-expiry-first-out.
      const candidates = store.lots
        .filter(
          (l) =>
            l.productId === productId &&
            l.status === "AVAILABLE" &&
            D(l.currentQuantity).greaterThan(0),
        )
        .sort((a, b) => (a.expiryDate < b.expiryDate ? -1 : 1));

      let remaining = needed;
      const suggestions = candidates.map((l) => {
        const take = Decimal.min(D(l.currentQuantity), Decimal.max(remaining, 0));
        remaining = remaining.minus(take);
        return {
          lotId: l.id,
          lotNumber: l.lotNumber,
          availableQuantity: qty(l.currentQuantity),
          expiryDate: l.expiryDate,
          unitCost: money(l.unitCost),
          warehouseId: l.warehouseId,
          suggestedQuantity: qty(take),
        };
      });

      return HttpResponse.json({
        productId,
        requestedQuantity: qty(needed),
        shortfall: qty(Decimal.max(remaining, 0)),
        suggestions,
      });
    },
  ),

  // ─── Production orders — list ─────────────────────────────
  http.get("/api/production-orders", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const recipeId = url.searchParams.get("recipeId");
    let orders = [...store.productionOrders];
    if (status) orders = orders.filter((o) => o.status === status);
    if (recipeId) orders = orders.filter((o) => o.recipeId === recipeId);
    return HttpResponse.json(orders);
  }),

  // ─── Production orders — detail ───────────────────────────
  http.get("/api/production-orders/:id", ({ params }) => {
    const order = store.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Create a production order ────────────────────────────
  // Inputs are exploded from the recipe ingredients, scaled to the
  // planned output vs the recipe's nominal output.
  http.post("/api/production-orders", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as Record<string, unknown>;
    const recipe = store.recipes.find((r) => r.id === body.recipeId);
    if (!recipe) return new HttpResponse(null, { status: 422 });

    const plannedOutput = D(body.plannedOutputQuantity as string);
    const scale = recipe.outputQuantity
      ? plannedOutput.div(recipe.outputQuantity)
      : new Decimal(1);

    const orderId = rid("prd");
    const seq = String(store.productionOrders.length + 1).padStart(4, "0");
    const order: ProductionOrder = {
      id: orderId,
      tenantId: TENANT,
      orderNumber: `PRD-2026-${seq}`,
      recipeId: recipe.id,
      recipeVersion: recipe.version,
      warehouseId: String(body.warehouseId ?? "wh-002"),
      status: "DRAFT",
      plannedOutputQuantity: qty(plannedOutput),
      plannedOutputUom: recipe.outputUom,
      actualOutputQuantity: null,
      outputLotId: null,
      scheduledFor: String(body.scheduledFor ?? now()),
      startedAt: null,
      completedAt: null,
      totalInputCost: null,
      unitOutputCost: null,
      yieldPercent: null,
      createdBy: ACTING_USER,
      completedBy: null,
      notes: (body.notes as string) ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    store.productionOrders.unshift(order);

    const ingredients = store.recipeIngredients.filter(
      (i) => i.recipeId === recipe.id,
    );
    ingredients.forEach((ing) => {
      store.productionOrderInputs.push({
        id: rid("poi"),
        tenantId: TENANT,
        productionOrderId: orderId,
        productId: ing.productId,
        plannedQuantity: qty(D(ing.quantity).times(scale)),
        plannedUom: ing.uom,
        actualQuantity: null,
        consumedLots: [],
        notes: null,
      });
    });

    return HttpResponse.json(hydrateOrder(order), { status: 201 });
  }),

  // ─── Start production: DRAFT → IN_PROGRESS ────────────────
  http.post("/api/production-orders/:id/start", async ({ params }) => {
    await delay(200);
    const order = store.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    if (order.status !== "DRAFT")
      return HttpResponse.json(
        { message: "Only DRAFT orders can be started" },
        { status: 409 },
      );
    order.status = "IN_PROGRESS";
    order.startedAt = now();
    order.updatedAt = now();
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Edit a DRAFT order (planned output / notes) ──────────
  // Changing planned output rescales the exploded inputs from the recipe.
  http.patch("/api/production-orders/:id", async ({ params, request }) => {
    const order = store.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;

    if (body.notes !== undefined) order.notes = (body.notes as string) ?? null;

    if (body.plannedOutputQuantity !== undefined) {
      if (order.status !== "DRAFT")
        return HttpResponse.json(
          { message: "Planned output can only change while DRAFT" },
          { status: 409 },
        );
      const recipe = store.recipes.find((r) => r.id === order.recipeId);
      const planned = D(body.plannedOutputQuantity as string);
      order.plannedOutputQuantity = qty(planned);
      if (recipe && recipe.outputQuantity) {
        const scale = planned.div(recipe.outputQuantity);
        const ingredients = store.recipeIngredients.filter(
          (i) => i.recipeId === recipe.id,
        );
        const inputs = store.productionOrderInputs.filter(
          (i) => i.productionOrderId === order.id,
        );
        inputs.forEach((input) => {
          const ing = ingredients.find((g) => g.productId === input.productId);
          if (ing)
            input.plannedQuantity = qty(D(ing.quantity).times(scale));
        });
      }
    }

    order.updatedAt = now();
    return HttpResponse.json(hydrateOrder(order));
  }),

  // ─── Delete an order (any status — bulk delete from the grid) ─
  http.delete("/api/production-orders/:id", ({ params }) => {
    const order = store.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    store.productionOrders = store.productionOrders.filter(
      (o) => o.id !== order.id,
    );
    store.productionOrderInputs = store.productionOrderInputs.filter(
      (i) => i.productionOrderId !== order.id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Delete a recipe ──────────────────────────────────────
  http.delete("/api/recipes/:id", ({ params }) => {
    const idx = store.recipes.findIndex((r) => r.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    store.recipes.splice(idx, 1);
    store.recipeIngredients = store.recipeIngredients.filter(
      (i) => i.recipeId !== params.id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Auto-save a single input row ─────────────────────────
  http.patch(
    "/api/production-orders/:id/inputs/:inputId",
    async ({ params, request }) => {
      const body = (await request.json()) as Partial<ProductionOrderInput>;
      const input = store.productionOrderInputs.find(
        (i) =>
          i.id === params.inputId && i.productionOrderId === params.id,
      );
      if (!input) return new HttpResponse(null, { status: 404 });
      if (body.actualQuantity !== undefined)
        input.actualQuantity =
          body.actualQuantity === null ? null : qty(body.actualQuantity);
      if (body.consumedLots !== undefined)
        input.consumedLots = (body.consumedLots as ConsumedLot[]).map((cl) => ({
          lotId: cl.lotId,
          quantity: qty(cl.quantity),
          unitCost: money(cl.unitCost),
        }));
      if (body.notes !== undefined) input.notes = body.notes ?? null;
      return HttpResponse.json(input);
    },
  ),

  // ─── Complete production: IN_PROGRESS → COMPLETED ─────────
  http.post("/api/production-orders/:id/complete", async ({ params, request }) => {
    await delay(350);
    const order = store.productionOrders.find((o) => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    if (order.status !== "IN_PROGRESS")
      return HttpResponse.json(
        { message: "Only IN_PROGRESS orders can be completed" },
        { status: 409 },
      );

    const body = (await request.json()) as Record<string, unknown>;
    const recipe = store.recipes.find((r) => r.id === order.recipeId);
    const actualOutput = D(body.actualOutputQuantity as string);
    const inputs = store.productionOrderInputs.filter(
      (i) => i.productionOrderId === order.id,
    );

    // Total input cost = Σ over every consumed lot of (qty × unitCost).
    let totalInputCost = new Decimal(0);
    let meatActual = new Decimal(0);
    const stamp = now();

    inputs.forEach((input) => {
      const product = productOf(input.productId);
      if (product && MEAT_CATEGORIES.has(product.category))
        meatActual = meatActual.plus(D(input.actualQuantity));

      input.consumedLots.forEach((cl) => {
        const lineCost = D(cl.quantity).times(D(cl.unitCost));
        totalInputCost = totalInputCost.plus(lineCost);

        // Draw down the source lot + record a PRODUCTION_INPUT movement.
        const lot = store.lots.find((l) => l.id === cl.lotId);
        if (lot) {
          const left = D(lot.currentQuantity).minus(D(cl.quantity));
          lot.currentQuantity = qty(Decimal.max(left, 0));
          if (Decimal.max(left, 0).isZero()) lot.status = "SOLD_OUT";
          lot.updatedAt = stamp;
        }
        store.stockMovements.unshift({
          id: rid("mov"),
          tenantId: TENANT,
          type: "PRODUCTION_INPUT",
          lotId: cl.lotId,
          warehouseId: order.warehouseId,
          quantity: qty(D(cl.quantity).negated()),
          uom: input.plannedUom,
          unitCost: money(cl.unitCost),
          totalCost: money(lineCost),
          referenceType: "PRODUCTION_ORDER",
          referenceId: order.id,
          reasonCode: null,
          notes: null,
          performedBy: ACTING_USER,
          performedAt: stamp,
          createdAt: stamp,
        });
      });
    });

    const unitOutputCost = actualOutput.greaterThan(0)
      ? totalInputCost.div(actualOutput)
      : new Decimal(0);
    // Yield = actual output / actual MEAT input mass (seasoning excluded).
    const yieldPercent = meatActual.greaterThan(0)
      ? actualOutput.div(meatActual).times(100)
      : new Decimal(0);

    // Create the finished-goods output lot.
    const outputLotId = rid("lot-fg");
    const outputProductId = recipe?.outputProductId ?? "";
    const outputLot: Lot = {
      id: outputLotId,
      tenantId: TENANT,
      lotNumber: String(body.outputLotNumber ?? rid("FG")),
      productId: outputProductId,
      warehouseId: String(body.outputWarehouseId ?? order.warehouseId),
      status: "AVAILABLE",
      initialQuantity: qty(actualOutput),
      currentQuantity: qty(actualOutput),
      uom: order.plannedOutputUom,
      unitCost: money(unitOutputCost),
      currency: CURRENCY,
      productionDate: stamp.slice(0, 10),
      expiryDate: String(body.expiryDate ?? ""),
      receivedAt: null,
      source: "PRODUCTION",
      purchaseOrderLineId: null,
      productionOrderId: order.id,
      parentLotIds: Array.from(
        new Set(
          inputs.flatMap((i) => i.consumedLots.map((cl) => cl.lotId)),
        ),
      ),
      supplierLotRef: null,
      notes: (body.notes as string) ?? null,
      createdAt: stamp,
      updatedAt: stamp,
    };
    store.lots.unshift(outputLot);

    store.stockMovements.unshift({
      id: rid("mov"),
      tenantId: TENANT,
      type: "PRODUCTION_OUTPUT",
      lotId: outputLotId,
      warehouseId: outputLot.warehouseId,
      quantity: qty(actualOutput),
      uom: outputLot.uom,
      unitCost: money(unitOutputCost),
      totalCost: money(totalInputCost),
      referenceType: "PRODUCTION_ORDER",
      referenceId: order.id,
      reasonCode: null,
      notes: null,
      performedBy: ACTING_USER,
      performedAt: stamp,
      createdAt: stamp,
    });

    order.status = "COMPLETED";
    order.actualOutputQuantity = qty(actualOutput);
    order.outputLotId = outputLotId;
    order.completedAt = stamp;
    order.completedBy = ACTING_USER;
    order.totalInputCost = money(totalInputCost);
    order.unitOutputCost = money(unitOutputCost);
    order.yieldPercent = yieldPercent.toFixed(2);
    if (body.notes) order.notes = body.notes as string;
    order.updatedAt = stamp;

    return HttpResponse.json(hydrateOrder(order));
  }),
];
