# Meat Processing ERP — Domain Reference

This is the ground truth. Every entity, enum, relationship, and business rule lives here.
The API and UI are derivatives of this document — when in doubt, this wins.

---

## 1. Core concepts in plain language

A **tenant** is a company using the system. Everything is scoped to a tenant.

A **warehouse** is a physical storage location (e.g. "Cold Storage A", "Production Floor", "Shipping").
A tenant has multiple warehouses. Inventory always lives in some warehouse.

A **product** is a SKU. Two flavors:
- **Raw materials** — beef trim, pork shoulder, salt, paprika, packaging film
- **Finished goods** — "Beef Mince 80/20 1kg", "Lula Kebab 500g"

A **lot** (or batch) is a specific physical instance of a product with its own identity:
production date, expiry date, supplier reference, and **its own cost**. When you grind 100kg
of beef from Lot A and 50kg from Lot B, you produce a new finished-goods lot whose cost is
rolled up from those two parent lots.

A **stock movement** is the only way quantities ever change. Every receipt, consumption,
production, sale, adjustment, or write-off is a stock movement. Think double-entry
bookkeeping but for physical goods. Stock-on-hand is derived from movements, never stored.

A **recipe** (Bill of Materials) defines how to make a finished good: which raw materials
in what proportions, plus an expected yield (e.g. "100kg of inputs produces 96kg of output").

A **production order** is an instance of running a recipe. It has:
- **Planned** consumption (computed from the recipe + target output)
- **Actual** consumption (what the operator actually weighed and used)
- **Planned** output (target)
- **Actual** output (what came off the line)

The difference is **yield variance** and that's the metric the production manager lives by.

A **sales order** allocates specific finished-goods lots to a customer (FIFO suggested,
but operator can override). On delivery, those lots are consumed and the cost-of-goods-sold
is the sum of those lots' costs.

---

## 2. Enums

```ts
// All enums use UPPER_SNAKE_CASE values. Frontend displays use a label map.

enum UserRole {
  ADMIN              = 'ADMIN',               // tenant owner, all permissions
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER',  // creates/closes production orders
  WAREHOUSE_OPERATOR = 'WAREHOUSE_OPERATOR',  // receives goods, picks for sales
  SALES              = 'SALES',                // creates sales orders, customers
  ACCOUNTANT         = 'ACCOUNTANT',           // views costs, AR/AP, reports
  VIEWER             = 'VIEWER',               // read-only
}

enum ProductType {
  RAW_MATERIAL  = 'RAW_MATERIAL',
  FINISHED_GOOD = 'FINISHED_GOOD',
  PACKAGING     = 'PACKAGING',  // boxes, film, labels — tracked but not graded
}

enum UnitOfMeasure {
  KG    = 'KG',     // primary for meat
  G     = 'G',
  L     = 'L',
  ML    = 'ML',
  PIECE = 'PIECE',  // for packaging, casings
}

enum LotStatus {
  AVAILABLE  = 'AVAILABLE',   // can be consumed/sold
  QUARANTINE = 'QUARANTINE',  // received but not yet QC-cleared
  EXPIRED    = 'EXPIRED',     // past expiry, blocked from use
  DEPLETED   = 'DEPLETED',    // quantity == 0
  WRITTEN_OFF = 'WRITTEN_OFF', // damaged, recalled, scrapped
}

enum StockMovementType {
  RECEIPT          = 'RECEIPT',           // from purchase order / goods receipt
  PRODUCTION_INPUT = 'PRODUCTION_INPUT',  // consumed by a production order
  PRODUCTION_OUTPUT= 'PRODUCTION_OUTPUT', // produced by a production order
  SALE             = 'SALE',              // shipped to customer
  ADJUSTMENT       = 'ADJUSTMENT',        // physical count correction (+ or -)
  WRITE_OFF        = 'WRITE_OFF',         // disposal
  TRANSFER_OUT     = 'TRANSFER_OUT',      // internal transfer between warehouses
  TRANSFER_IN      = 'TRANSFER_IN',
}

enum ProductionOrderStatus {
  DRAFT       = 'DRAFT',        // created, not started
  IN_PROGRESS = 'IN_PROGRESS',  // operator is consuming inputs / weighing outputs
  COMPLETED   = 'COMPLETED',    // closed, stock movements posted, costs rolled up
  CANCELLED   = 'CANCELLED',    // never started or aborted; no stock impact
}

enum PurchaseOrderStatus {
  DRAFT      = 'DRAFT',
  SUBMITTED  = 'SUBMITTED',     // sent to supplier
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED   = 'RECEIVED',
  CANCELLED  = 'CANCELLED',
}

enum SalesOrderStatus {
  DRAFT      = 'DRAFT',
  CONFIRMED  = 'CONFIRMED',     // stock allocated
  PICKED     = 'PICKED',        // warehouse picked the lots
  DELIVERED  = 'DELIVERED',     // shipped, stock movements posted
  INVOICED   = 'INVOICED',
  CANCELLED  = 'CANCELLED',
}

enum InvoiceStatus {
  DRAFT   = 'DRAFT',
  ISSUED  = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID    = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID    = 'VOID',
}

enum Currency {
  UZS = 'UZS',
  USD = 'USD',
}
```

---

## 3. Entities

Conventions:
- All entities have `id` (UUID v4), `tenantId` (UUID), `createdAt`, `updatedAt` (ISO 8601).
- All entities are tenant-scoped — every query MUST filter by `tenantId`.
- Money uses `numeric(14, 2)` in DB, `string` in JSON (decimal.js on frontend). NEVER float.
- Quantities use `numeric(14, 3)` — three decimals enough for grams in a kilo.

### 3.1 Tenant
```ts
{
  id: UUID,
  name: string,            // "Andijan Meat Co"
  legalName: string,
  taxId: string,
  defaultCurrency: Currency,
  timezone: string,        // "Asia/Tashkent"
  createdAt, updatedAt
}
```

### 3.2 User
```ts
{
  id: UUID,
  tenantId: UUID,
  email: string,           // unique within tenant
  fullName: string,
  role: UserRole,
  isActive: boolean,
  lastLoginAt?: ISO8601,
  createdAt, updatedAt
}
```

### 3.3 Warehouse
```ts
{
  id: UUID,
  tenantId: UUID,
  code: string,            // "CS-A", "PROD-1" — unique within tenant
  name: string,
  type: 'COLD_STORAGE' | 'PRODUCTION' | 'SHIPPING' | 'GENERAL',
  isActive: boolean,
  createdAt, updatedAt
}
```

### 3.4 Product
```ts
{
  id: UUID,
  tenantId: UUID,
  sku: string,             // unique within tenant, e.g. "BEEF-TRIM-80"
  name: string,            // "Beef Trim 80/20"
  type: ProductType,
  uom: UnitOfMeasure,
  shelfLifeDays?: number,  // null for non-perishables
  barcode?: string,
  isActive: boolean,
  // optional metadata
  category?: string,       // "Beef", "Pork", "Spices"
  notes?: string,
  createdAt, updatedAt
}
```

### 3.5 Lot (the heart of traceability and costing)
```ts
{
  id: UUID,
  tenantId: UUID,
  lotNumber: string,       // unique within tenant, e.g. "BEEF-2026-05-001"
  productId: UUID,
  warehouseId: UUID,       // current location (transfers update this)
  status: LotStatus,
  // quantities
  initialQuantity: string, // decimal, never changes after creation
  currentQuantity: string, // decimal, updated by stock movements
  uom: UnitOfMeasure,      // copied from product at creation
  // costing
  unitCost: string,        // decimal, cost per UOM in tenant default currency
  currency: Currency,
  // dates
  productionDate?: ISO8601,    // for finished goods, the production date
  expiryDate?: ISO8601,
  receivedAt?: ISO8601,        // for raw materials, when received from supplier
  // origin (one of these will be populated)
  source: 'PURCHASE' | 'PRODUCTION' | 'ADJUSTMENT',
  purchaseOrderLineId?: UUID,  // if source == PURCHASE
  productionOrderId?: UUID,    // if source == PRODUCTION
  // traceability — populated only for finished-goods lots
  parentLotIds: UUID[],        // raw lots consumed to make this lot
  // misc
  supplierLotRef?: string,     // supplier's own lot/batch number
  notes?: string,
  createdAt, updatedAt
}
```

### 3.6 StockMovement (append-only audit log)
```ts
{
  id: UUID,
  tenantId: UUID,
  type: StockMovementType,
  lotId: UUID,
  warehouseId: UUID,
  // signed quantity: +receipt, -consumption, -sale, etc.
  quantity: string,        // decimal, positive or negative
  uom: UnitOfMeasure,
  // cost at time of movement (snapshot)
  unitCost: string,
  totalCost: string,       // = abs(quantity) * unitCost
  // reference to the parent operation
  referenceType?: 'PURCHASE_ORDER' | 'PRODUCTION_ORDER' | 'SALES_ORDER' | 'ADJUSTMENT' | 'WRITE_OFF',
  referenceId?: UUID,
  reasonCode?: string,     // for ADJUSTMENT/WRITE_OFF: "DAMAGE", "EXPIRY", "COUNT_DIFF"
  notes?: string,
  performedBy: UUID,       // user id
  performedAt: ISO8601,
  createdAt              // == performedAt; movements are immutable
}
```
**Critical invariant:** `Lot.currentQuantity` = `initialQuantity` + sum(movements for that lot).
Movements are immutable. Mistakes are corrected with new movements (reversing entries).

### 3.7 Supplier
```ts
{
  id: UUID,
  tenantId: UUID,
  code: string,
  name: string,
  taxId?: string,
  contactName?: string,
  phone?: string,
  email?: string,
  address?: string,
  paymentTermsDays: number,    // default 30
  isActive: boolean,
  createdAt, updatedAt
}
```

### 3.8 PurchaseOrder
```ts
{
  id: UUID,
  tenantId: UUID,
  poNumber: string,            // "PO-2026-0001", unique within tenant
  supplierId: UUID,
  warehouseId: UUID,           // destination
  status: PurchaseOrderStatus,
  currency: Currency,
  orderDate: ISO8601,
  expectedDate?: ISO8601,
  totalAmount: string,         // sum of lines
  notes?: string,
  createdBy: UUID,
  createdAt, updatedAt
}
```

### 3.9 PurchaseOrderLine
```ts
{
  id: UUID,
  tenantId: UUID,
  purchaseOrderId: UUID,
  productId: UUID,
  orderedQuantity: string,
  receivedQuantity: string,    // updated as goods are received
  uom: UnitOfMeasure,
  unitPrice: string,
  lineTotal: string,           // orderedQty * unitPrice
}
```

### 3.10 GoodsReceipt
```ts
// Created when raw materials physically arrive. Generates Lot(s) and StockMovements.
{
  id: UUID,
  tenantId: UUID,
  receiptNumber: string,
  purchaseOrderId: UUID,
  warehouseId: UUID,
  receivedAt: ISO8601,
  receivedBy: UUID,
  notes?: string,
  createdAt, updatedAt
}
```

### 3.11 GoodsReceiptLine
```ts
{
  id: UUID,
  tenantId: UUID,
  goodsReceiptId: UUID,
  purchaseOrderLineId: UUID,
  productId: UUID,
  quantity: string,            // actually received (may differ from PO line)
  uom: UnitOfMeasure,
  unitCost: string,            // typically PO line's unitPrice, but operator can adjust
  // lot metadata captured at receipt
  supplierLotRef?: string,
  productionDate?: ISO8601,
  expiryDate?: ISO8601,
  // result
  lotId: UUID,                 // the lot created by this line
}
```

### 3.12 Recipe (BOM)
```ts
{
  id: UUID,
  tenantId: UUID,
  code: string,                // "RCP-MINCE-80"
  name: string,                // "Beef Mince 80/20"
  outputProductId: UUID,       // the finished good this recipe produces
  outputQuantity: string,      // base output, e.g. "100" (kg)
  outputUom: UnitOfMeasure,
  expectedYieldPercent: string, // "96.00" — for 100kg input, expect 96kg output
  version: number,             // recipes are versioned; only one active per code
  isActive: boolean,
  notes?: string,
  createdAt, updatedAt
}
```

### 3.13 RecipeIngredient
```ts
{
  id: UUID,
  tenantId: UUID,
  recipeId: UUID,
  productId: UUID,             // raw material
  quantity: string,            // amount needed for the recipe's outputQuantity
  uom: UnitOfMeasure,
  isOptional: boolean,         // e.g. spices that can be substituted
  notes?: string,
}
```

### 3.14 ProductionOrder (THE most important entity)
```ts
{
  id: UUID,
  tenantId: UUID,
  orderNumber: string,         // "PRD-2026-0001"
  recipeId: UUID,
  recipeVersion: number,       // snapshot — recipe may evolve later
  warehouseId: UUID,           // production floor warehouse
  status: ProductionOrderStatus,
  // planned (from recipe scaling)
  plannedOutputQuantity: string,
  plannedOutputUom: UnitOfMeasure,
  // actual (filled in as production progresses)
  actualOutputQuantity?: string,    // null until COMPLETED
  outputLotId?: UUID,                // the finished-goods lot created on completion
  // dates
  scheduledFor?: ISO8601,
  startedAt?: ISO8601,
  completedAt?: ISO8601,
  // costing summary (filled on completion)
  totalInputCost?: string,
  unitOutputCost?: string,           // totalInputCost / actualOutputQuantity
  yieldPercent?: string,             // actualOutput / totalInput * 100
  // people
  createdBy: UUID,
  completedBy?: UUID,
  notes?: string,
  createdAt, updatedAt
}
```

### 3.15 ProductionOrderInput (planned + actual consumption per ingredient)
```ts
{
  id: UUID,
  tenantId: UUID,
  productionOrderId: UUID,
  productId: UUID,             // raw material
  // planned (from scaled recipe)
  plannedQuantity: string,
  plannedUom: UnitOfMeasure,
  // actual (filled by operator during production)
  actualQuantity?: string,
  // lot consumption — array because multiple lots may contribute (FIFO)
  consumedLots: Array<{
    lotId: UUID,
    quantity: string,          // amount consumed from this lot
    unitCost: string,          // snapshot of lot's unitCost at consumption time
  }>,
  notes?: string,
}
```

### 3.16 Customer
```ts
{
  id: UUID,
  tenantId: UUID,
  code: string,
  name: string,
  type: 'RETAIL' | 'WHOLESALE' | 'RESTAURANT' | 'DISTRIBUTOR',
  taxId?: string,
  contactName?: string,
  phone?: string,
  email?: string,
  address?: string,
  paymentTermsDays: number,
  creditLimit?: string,        // null = no limit
  priceListId?: UUID,
  isActive: boolean,
  createdAt, updatedAt
}
```

### 3.17 PriceList & PriceListItem
```ts
PriceList {
  id, tenantId, name, currency, validFrom, validTo?, isDefault: boolean,
  createdAt, updatedAt
}

PriceListItem {
  id, tenantId, priceListId,
  productId,
  unitPrice: string,
  minQuantity?: string,        // tier pricing: this price applies if qty >= minQuantity
}
```

### 3.18 SalesOrder
```ts
{
  id: UUID,
  tenantId: UUID,
  orderNumber: string,         // "SO-2026-0001"
  customerId: UUID,
  warehouseId: UUID,           // ship from
  status: SalesOrderStatus,
  currency: Currency,
  orderDate: ISO8601,
  promisedDate?: ISO8601,
  // totals
  subtotal: string,
  taxAmount: string,
  totalAmount: string,
  // costing (computed when DELIVERED)
  totalCogs?: string,
  grossMargin?: string,        // totalAmount - totalCogs
  notes?: string,
  createdBy: UUID,
  createdAt, updatedAt
}
```

### 3.19 SalesOrderLine
```ts
{
  id: UUID,
  tenantId: UUID,
  salesOrderId: UUID,
  productId: UUID,
  orderedQuantity: string,
  uom: UnitOfMeasure,
  unitPrice: string,
  lineTotal: string,
  // allocation — which finished-goods lots will fulfill this line
  allocatedLots: Array<{
    lotId: UUID,
    quantity: string,
    unitCost: string,           // snapshot at allocation
  }>,
}
```

### 3.20 Invoice
```ts
{
  id: UUID,
  tenantId: UUID,
  invoiceNumber: string,
  customerId: UUID,
  salesOrderId: UUID,
  status: InvoiceStatus,
  currency: Currency,
  issueDate: ISO8601,
  dueDate: ISO8601,
  subtotal: string,
  taxAmount: string,
  totalAmount: string,
  paidAmount: string,
  outstandingAmount: string,    // totalAmount - paidAmount
  notes?: string,
  createdAt, updatedAt
}
```

### 3.21 Payment
```ts
{
  id: UUID,
  tenantId: UUID,
  invoiceId: UUID,
  amount: string,
  currency: Currency,
  paidAt: ISO8601,
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER',
  reference?: string,
  recordedBy: UUID,
  createdAt
}
```

---

## 4. Relationships at a glance

```
Tenant 1—N User
Tenant 1—N Warehouse 1—N Lot
Tenant 1—N Product 1—N Lot
Lot 1—N StockMovement
Lot N—M Lot   (parentLotIds for traceability)

Supplier 1—N PurchaseOrder 1—N PurchaseOrderLine
PurchaseOrder 1—N GoodsReceipt 1—N GoodsReceiptLine 1—1 Lot

Recipe 1—N RecipeIngredient
Recipe 1—N ProductionOrder
ProductionOrder 1—N ProductionOrderInput
ProductionOrder 1—1 Lot (output)

Customer 1—N SalesOrder 1—N SalesOrderLine
SalesOrder 1—1 Invoice 1—N Payment
SalesOrderLine N—N Lot (via allocatedLots)
```

---

## 5. Business rules and invariants

### 5.1 Tenant isolation (non-negotiable)
- Every API request carries a `tenantId` derived from JWT.
- Every DB query filters by `tenantId`. No exceptions.
- Cross-tenant references are forbidden (e.g. a Lot's product must be in the same tenant).

### 5.2 Lot quantity invariant
- `Lot.currentQuantity == Lot.initialQuantity + sum(movements.quantity for that lot)`
- `currentQuantity >= 0` always. Operations that would drive it negative must fail.
- When `currentQuantity == 0`, status auto-transitions to `DEPLETED`.

### 5.3 Cost layering (FIFO)
- When consuming from a lot, the consumption inherits that lot's `unitCost`.
- When producing a finished-goods lot, its `unitCost` is:
  `sum(actual consumed cost across all inputs) / actualOutputQuantity`
- Costs are immutable once posted. Recosting requires reversing entries.

### 5.4 FIFO consumption suggestion
- When a production order or sales order needs N kg of product X, the system suggests
  lots in this order: status=AVAILABLE, oldest expiry first, then oldest receivedAt.
- Operator can override the suggestion (override is logged).

### 5.5 Production order lifecycle
- DRAFT: editable. No stock impact.
- IN_PROGRESS: starts when operator clicks "Start". Status transition logged.
  Operator can record actual consumption per ingredient progressively.
  Stock movements for inputs are NOT yet posted.
- COMPLETED: triggered by operator. On completion (atomically):
  1. Validate all required ingredients have actualQuantity set.
  2. Validate actualOutputQuantity is set and > 0.
  3. Post `PRODUCTION_INPUT` movements (negative qty) for each consumed lot.
  4. Create the output Lot with rolled-up cost and `parentLotIds`.
  5. Post `PRODUCTION_OUTPUT` movement (positive qty) for the new lot.
  6. Compute and store yieldPercent, totalInputCost, unitOutputCost.
  7. Set status=COMPLETED.
- CANCELLED: only allowed from DRAFT or IN_PROGRESS. No stock impact.

### 5.6 Sales order lifecycle
- DRAFT: editable, no allocation.
- CONFIRMED: lots are allocated (reserved). Stock not yet moved.
  Allocated quantity is "soft-locked" — visible in UI as "allocated" but currentQuantity unchanged.
- PICKED: warehouse confirms physical pick. Still no stock movement.
- DELIVERED: posts `SALE` movements (negative qty) for allocated lots.
  Computes totalCogs and grossMargin.
- INVOICED: creates Invoice record.
- CANCELLED: only from DRAFT/CONFIRMED. Releases allocations.

### 5.7 Expiry handling
- Daily background job marks lots with `expiryDate < today` as `EXPIRED`.
- `EXPIRED` lots cannot be allocated or consumed. They can only be `WRITTEN_OFF`.
- UI shows lots expiring within 7/14/30 days with warning indicators.

### 5.8 Adjustments
- Negative adjustments require a `reasonCode`.
- Adjustments do not affect cost; they're quantity-only.
- Adjustments require role >= WAREHOUSE_OPERATOR for tenant.

### 5.9 Numeric precision
- Money: 2 decimals.
- Quantities: 3 decimals.
- Yield percent: 2 decimals.
- All decimals serialized as strings in JSON. Frontend uses decimal.js. Never JS number.

### 5.10 Auditability
- StockMovement is the audit log for inventory.
- For other entities, `updatedAt` is sufficient for v1. Phase 5 stretch: full audit log table.

---

## 6. Traceability rules

**Backward (where did it come from?):** Given a finished lot, walk `parentLotIds` recursively
to surface every raw lot, every supplier, every receipt date.

**Forward (where did it go?):** Given a raw lot, find every production order that consumed it
(via `ProductionOrderInput.consumedLots`), then every finished lot produced, then every sales
order line that allocated those finished lots, then every customer.

Both queries should be implementable with PostgreSQL recursive CTEs. Performance target:
< 1 second for 5 levels deep.

---

## 7. What's NOT in v1 (be explicit)

These are deliberately deferred so the mentee doesn't drown:

- Multi-currency conversion (one currency per tenant; record currency on lot but no FX math).
- Tax calculation engine (a flat tax % per sales order line is enough).
- Approval workflows (any role can do anything within their permissions).
- Inventory revaluation / standard costing.
- Multi-step BOMs (recipes with sub-recipes). Recipes are one level deep.
- Returns and credit notes.
- Procurement RFQ / supplier comparison.
- WMS-level features (bin locations within a warehouse, putaway optimization).
- Real-time websocket updates. REST + polling is fine for v1.
