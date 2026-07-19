// Adapters: backend snake_case → frontend camelCase types

import type {
  Product, Warehouse, Supplier, Customer, Lot, RecipeIngredient,
  PurchaseOrderLine,
  StockMovement, User,
} from "../types";
import type { RecipeWithIngredients, ProductionOrderWithDetail } from "../types/production";
import type { SalesOrderWithLines } from "../types/sales";
import type { PurchaseOrderWithLines } from "../types";

const s = String;
const now = () => new Date().toISOString();

// ── Product ──────────────────────────────────────────────────
export function adaptProduct(p: any): Product {
  return {
    id: s(p.id), tenantId: "1", sku: s(p.id),
    name: p.name,
    type: (p.type?.toUpperCase() as any) ?? "RAW_MATERIAL",
    uom: p.uom ?? "kg", shelfLifeDays: null,
    category: s(p.category_id ?? ""),
    barcode: null, isActive: true, notes: null,
    createdAt: p.created_at ?? now(), updatedAt: p.updated_at ?? now(),
  };
}

// ── User ─────────────────────────────────────────────────────
export function adaptUser(u: any): User {
  return {
    id: s(u.id), tenantId: "1",
    username: u.username ?? null, email: u.email ?? null, phone: u.phone ?? null,
    fullName: u.full_name ?? u.fullName ?? u.username ?? u.phone ?? "",
    role: u.role, permissions: u.permissions ?? [],
    isActive: u.is_active, lastLoginAt: "",
    createdAt: u.created_at ?? now(), updatedAt: u.created_at ?? now(),
  };
}

// ── Warehouse ─────────────────────────────────────────────────
export function adaptWarehouse(w: any): Warehouse {
  return {
    id: s(w.id), tenantId: "1",
    code: s(w.id), name: w.name,
    type: w.type ?? "production",
    isActive: true,
    createdAt: w.created_at ?? now(), updatedAt: w.updated_at ?? now(),
  };
}

// ── Supplier ──────────────────────────────────────────────────
export function adaptSupplier(s2: any): Supplier {
  return {
    id: s(s2.id), tenantId: "1", code: s(s2.id),
    name: s2.name, taxId: "", contactName: "",
    phone: "", email: "", address: "",
    paymentTermsDays: 30, isActive: true,
    createdAt: s2.created_at ?? now(), updatedAt: s2.updated_at ?? now(),
  };
}

// ── Customer ──────────────────────────────────────────────────
export function adaptCustomer(c: any): Customer {
  return {
    id: s(c.id), tenantId: "1", code: s(c.id),
    name: c.name,
    type: "WHOLESALE" as any,
    taxId: "", contactName: "",
    phone: c.phone ?? "", email: c.email ?? "",
    address: c.address ?? "",
    paymentTermsDays: 30, creditLimit: "0",
    priceListId: "1", isActive: true,
    createdAt: c.created_at ?? now(), updatedAt: c.updated_at ?? now(),
  };
}

// ── Lot ───────────────────────────────────────────────────────
function adaptLotStatus(v: string) {
  const map: Record<string, string> = { available: "AVAILABLE", sold_out: "SOLD_OUT", reserved: "RESERVED" };
  return (map[v] ?? "AVAILABLE") as any;
}

export function adaptLot(l: any): Lot {
  return {
    id: s(l.id), tenantId: "1",
    lotNumber: s(l.lot_number ?? l.id),
    productId: s(l.product_id), warehouseId: s(l.warehouse_id),
    status: adaptLotStatus(l.status),
    initialQuantity: s(l.initial_qty ?? 0),
    currentQuantity: s(l.current_qty ?? 0),
    uom: "kg", unitCost: s(l.unit_cost ?? 0),
    currency: l.currency ?? "UZS",
    productionDate: l.received_at ?? now(),
    expiryDate: l.expires_at ?? now(),
    receivedAt: l.received_at ?? null,
    source: (l.source?.toUpperCase() as any) ?? "PURCHASE",
    purchaseOrderLineId: null, productionOrderId: null,
    parentLotIds: [], supplierLotRef: null, notes: null,
    createdAt: l.created_at ?? now(), updatedAt: l.updated_at ?? now(),
  };
}

export function adaptStockMovement(m: any): StockMovement {
  return {
    id: s(m.id), tenantId: "1",
    type: (m.type?.toUpperCase() as any) ?? "RECEIPT",
    lotId: s(m.lot_id), warehouseId: s(m.warehouse_id),
    quantity: s(m.quantity ?? 0), uom: "kg",
    unitCost: "0", totalCost: "0",
    referenceType: "PURCHASE_ORDER" as any,
    referenceId: m.reference ?? null,
    reasonCode: null, notes: null,
    performedBy: "1",
    performedAt: m.created_at ?? now(),
    createdAt: m.created_at ?? now(),
  };
}

// ── PurchaseOrder ─────────────────────────────────────────────
function adaptPOStatus(v: string) {
  const map: Record<string, string> = {
    draft: "DRAFT", ordered: "DRAFT",
    partially_received: "PARTIALLY_RECEIVED",
    received: "RECEIVED", cancelled: "CANCELLED",
  };
  return (map[v] ?? "DRAFT") as any;
}

function adaptPOLine(item: any): PurchaseOrderLine {
  return {
    id: s(item.id), tenantId: "1",
    purchaseOrderId: s(item.purchase_order_id),
    productId: s(item.product_id),
    orderedQuantity: s(item.ordered ?? 0),
    receivedQuantity: s(item.received ?? 0),
    uom: item.uom ?? "kg",
    unitPrice: s(item.unit_price ?? 0),
    lineTotal: s((item.ordered ?? 0) * (item.unit_price ?? 0)),
  };
}

export function adaptPurchaseOrder(po: any): PurchaseOrderWithLines {
  return {
    id: s(po.id), tenantId: "1",
    poNumber: po.po_number,
    supplierId: s(po.supplier_id),
    warehouseId: s(po.warehouse_id),
    status: adaptPOStatus(po.status),
    currency: po.currency ?? "UZS",
    orderDate: po.order_date ?? now(),
    expectedDate: po.expected_date ?? now(),
    totalAmount: s(po.total ?? 0),
    notes: po.notes ?? null,
    createdBy: "1",
    createdAt: po.created_at ?? now(),
    updatedAt: po.updated_at ?? now(),
    lines: (po.items ?? []).map(adaptPOLine),
  };
}

// ── Recipe ────────────────────────────────────────────────────
function adaptIngredient(ing: any): RecipeIngredient {
  return {
    id: s(ing.id), tenantId: "1",
    recipeId: s(ing.recipe_id),
    productId: s(ing.product_id),
    quantity: s(ing.quantity ?? 0),
    uom: ing.uom ?? "kg",
    isOptional: ing.optional ?? false,
    notes: null,
  };
}

export function adaptRecipe(r: any): RecipeWithIngredients {
  return {
    id: s(r.id), tenantId: "1",
    code: r.code,
    name: r.name,
    outputProductId: s(r.output_product_id),
    outputQuantity: Number(r.output_qty ?? 0),
    outputUom: r.output_uom ?? "kg",
    expectedYieldPercent: Number(r.target_yield_percent ?? 100),
    version: 1,
    isActive: r.status === "active",
    notes: r.notes ?? null,
    createdAt: r.created_at ?? now(),
    updatedAt: r.updated_at ?? now(),
    ingredients: (r.ingredients ?? []).map(adaptIngredient),
  };
}

// ── ProductionOrder ───────────────────────────────────────────
function adaptProductionStatus(v: string) {
  const map: Record<string, string> = {
    draft: "DRAFT", in_progress: "IN_PROGRESS",
    completed: "COMPLETED", cancelled: "CANCELLED",
  };
  return (map[v] ?? "DRAFT") as any;
}

export function adaptProductionOrder(po: any): ProductionOrderWithDetail {
  const recipe = po.recipe ? adaptRecipe(po.recipe) : null;
  return {
    id: s(po.id), tenantId: "1",
    orderNumber: po.prd_number,
    recipeId: s(po.recipe_id),
    recipeVersion: 1,
    warehouseId: s(po.warehouse_id),
    status: adaptProductionStatus(po.status),
    plannedOutputQuantity: s(po.planned_output ?? 0),
    plannedOutputUom: recipe?.outputUom ?? "kg",
    actualOutputQuantity: po.actual_output != null ? s(po.actual_output) : null,
    outputLotId: null,
    scheduledFor: po.schedule_for ?? now(),
    startedAt: null, completedAt: null,
    totalInputCost: null, unitOutputCost: null,
    yieldPercent: po.actual_output && po.planned_output
      ? s(Math.round((po.actual_output / po.planned_output) * 100))
      : null,
    createdBy: "1", completedBy: null,
    notes: po.notes ?? null,
    createdAt: po.created_at ?? now(), updatedAt: po.updated_at ?? now(),
    inputs: (recipe?.ingredients ?? []).map((ing, i) => ({
      id: s(i + 1), tenantId: "1",
      productionOrderId: s(po.id),
      productId: ing.productId,
      plannedQuantity: ing.quantity,
      plannedUom: ing.uom,
      actualQuantity: null, consumedLots: [], notes: null,
    })),
    recipe,
    outputLot: null,
    movements: [],
  };
}

// ── SalesOrder ────────────────────────────────────────────────
function adaptSOStatus(v: string) {
  const map: Record<string, string> = {
    draft: "DRAFT", confirmed: "CONFIRMED",
    invoiced: "INVOICED", cancelled: "CANCELLED",
  };
  return (map[v] ?? "DRAFT") as any;
}

export function adaptSalesOrder(so: any): SalesOrderWithLines {
  return {
    id: s(so.id), tenantId: "1",
    orderNumber: so.so_number,
    customerId: s(so.customer_id),
    warehouseId: s(so.warehouse_id),
    status: adaptSOStatus(so.status),
    currency: "UZS",
    orderDate: so.order_date ?? now(),
    promisedDate: so.promised_date ?? now(),
    subtotal: s(so.subtotal ?? 0),
    taxAmount: s(so.tax_amount ?? 0),
    totalAmount: s(so.total ?? 0),
    totalCogs: null,
    grossMargin: so.margin != null ? s(so.margin) : null,
    notes: so.notes ?? null,
    createdBy: "1",
    createdAt: so.created_at ?? now(), updatedAt: so.updated_at ?? now(),
    lines: (so.items ?? []).map((item: any, i: number) => ({
      id: s(item.id ?? i), tenantId: "1",
      salesOrderId: s(so.id),
      productId: s(item.product_id),
      orderedQuantity: s(item.quantity ?? 0),
      uom: item.uom ?? "kg",
      unitPrice: s(item.unit_price ?? 0),
      lineTotal: s(item.line_total ?? 0),
      allocatedLots: [],
    })),
  };
}
