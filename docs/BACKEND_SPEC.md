# Backend Specification — Meat ERP

## Context

This project is currently a **frontend-only** ERP for a meat-processing business. The entire backend is faked in the browser with MSW mock handlers (`src/mocks/*.ts`) over seed data. The data model, REST contract, and all business logic already exist and are exercised by the live UI — they just run client-side.

This document is a single, clean, stack-agnostic specification for implementing the real server. It is reverse-engineered verbatim from the frontend types (`src/types/*.ts`) and mock handlers, so the new backend will be a **drop-in replacement** for the mocks — the frontend needs **zero** changes.

**Note on Lot `id` vs `lotNumber`:** the database keeps `Lot.id` as the primary key (all foreign keys keep pointing at `lotId`). `lotNumber` is the human-facing batch identifier — the frontend displays only `lotNumber` and hides `id`. Backend requirement: `lotNumber` must be **unique per tenant**.

---

## 1. Overview

REST API for a multi-tenant meat-processing ERP. Domains: **Inventory** (products, lots, warehouses, stock movements), **Purchasing** (suppliers, purchase orders, goods receipts), **Production** (recipes, production orders), **Sales** (customers, price lists, sales orders, invoices, payments), and **Reports**.

Core inventory model is **lot/batch-based with full traceability**: every physical batch is a `Lot`; every quantity change is a `StockMovement`; production and sales consume specific lots (FEFO — First Expiry First Out); finished-goods lots record their parent lots for forward/backward tracing.

## 2. Global Conventions

| Topic | Convention |
|---|---|
| Base path | All endpoints under `/api/`. |
| Multi-tenancy | Every persistent row has `tenantId`. The server resolves the tenant from the auth session and **filters every query by it**. `tenantId` is never sent by the client. |
| Auth | Token-based (e.g. JWT) carrying user + tenant. Not yet implemented in mocks — backend must add it. `createdBy`/`performedBy`/`completedBy` come from the authenticated user. |
| Response shape | Return typed JSON **directly** — no `{data, status}` envelope. Detail endpoints embed children (e.g. order + `lines`). |
| Money | **String**, 2 decimals (e.g. `"99.99"`). Use a decimal type server-side; never float. |
| Quantity | **String**, 3 decimals (e.g. `"10.500"`). Decimal, never float. |
| Percent | String, 2 decimals, no `%` (e.g. `"87.50"`). |
| Counts / versions / days | JSON `number` (integer). |
| Dates | Date-only fields: `YYYY-MM-DD`. Timestamps: ISO-8601 with offset (e.g. `2026-05-05T08:00:00+05:00`). |
| IDs | Opaque strings, no format enforced (UUID or prefixed slug both fine). |
| Errors | Non-2xx with appropriate HTTP status. `404` not found, `409` illegal state transition, `422` invalid reference. Body may carry a message. |
| Pagination | None currently — list endpoints return full sets filtered by query params. (Add later if needed; not required for parity.) |

## 3. Enums

```
UserRole                 = ADMIN | PRODUCTION_MANAGER | WAREHOUSE_OPERATOR | SALES | ACCOUNTANT
ProductType              = RAW_MATERIAL | PACKAGING | FINISHED_GOOD
CustomerType             = RETAIL | WHOLESALE | RESTAURANT | DISTRIBUTOR
PurchaseOrderStatus      = DRAFT | RECEIVED | PARTIALLY_RECEIVED | CANCELLED
LotStatus                = AVAILABLE | RESERVED | SOLD_OUT
LotSource                = PURCHASE | PRODUCTION
StockMovementType        = RECEIPT | PRODUCTION_INPUT | PRODUCTION_OUTPUT | SALE | ADJUSTMENT
StockMovementReferenceType = PURCHASE_ORDER | PRODUCTION_ORDER | SALES_ORDER | ADJUSTMENT
ProductionOrderStatus    = DRAFT | IN_PROGRESS | COMPLETED | CANCELLED
SalesOrderStatus         = DRAFT | CONFIRMED | PICKED | INVOICED | SHIPPED | DELIVERED | CANCELLED
InvoiceStatus            = PAID | UNPAID | PARTIAL
PaymentMethod            = BANK_TRANSFER | CASH | CARD
```

## 4. Entities

> Every entity also has `tenantId` (string), `createdAt` (ts), `updatedAt` (ts) unless noted. `?` = nullable.

### Inventory

**Product** — `id, sku, name, type:ProductType, uom, shelfLifeDays?:number, category, barcode?, isActive:boolean, notes?`

**Warehouse** — `id, code, name, type, isActive:boolean`

**Lot** — `id, lotNumber (unique per tenant), productId→Product, warehouseId→Warehouse, status:LotStatus, initialQuantity:qty, currentQuantity:qty, uom, unitCost:money, currency, productionDate:date, expiryDate:date, receivedAt?:ts (null for PRODUCTION), source:LotSource, purchaseOrderLineId?→PurchaseOrderLine, productionOrderId?→ProductionOrder, parentLotIds:string[] (source lots for traceability), supplierLotRef?, notes?`

**StockMovement** — `id, type:StockMovementType, lotId→Lot, warehouseId→Warehouse, quantity:qty (negative = consumption), uom, unitCost:money, totalCost:money, referenceType:StockMovementReferenceType, referenceId?, reasonCode?, notes?, performedBy→User, performedAt:ts, createdAt` (no `updatedAt`)

### Purchasing

**Supplier** — `id, code, name, taxId, contactName, phone, email, address, paymentTermsDays:number, isActive:boolean`

**PurchaseOrder** — `id, poNumber, supplierId→Supplier, warehouseId→Warehouse, status:PurchaseOrderStatus, currency, orderDate:date, expectedDate:date, totalAmount:money, notes?, createdBy→User`

**PurchaseOrderLine** — `id, purchaseOrderId→PurchaseOrder, productId→Product, orderedQuantity:qty, receivedQuantity:qty, uom, unitPrice:money, lineTotal:money` (no own timestamps)

**GoodsReceipt** — `id, receiptNumber, purchaseOrderId→PurchaseOrder, warehouseId→Warehouse, receivedAt:ts, receivedBy→User, notes?`

**GoodsReceiptLine** — `id, goodsReceiptId→GoodsReceipt, purchaseOrderLineId→PurchaseOrderLine, productId→Product, quantity:qty, uom, unitCost:money, supplierLotRef, productionDate:date, expiryDate:date, lotId→Lot (the lot this line created)`

### Production

**Recipe** — `id, code, name, outputProductId→Product, outputQuantity:number, outputUom, expectedYieldPercent:number, version:number, isActive:boolean, notes?` (immutable versioning — see §6.3)

**RecipeIngredient** — `id, recipeId→Recipe, productId→Product, quantity:qty, uom, isOptional:boolean, notes?` (no own timestamps)

**ProductionOrder** — `id, orderNumber, recipeId→Recipe, recipeVersion:number, warehouseId→Warehouse, status:ProductionOrderStatus, plannedOutputQuantity:qty, plannedOutputUom, actualOutputQuantity?:qty, outputLotId?→Lot, scheduledFor:date/ts, startedAt?:ts, completedAt?:ts, totalInputCost?:money, unitOutputCost?:money, yieldPercent?:string, createdBy→User, completedBy?→User, notes?`

**ProductionOrderInput** — `id, productionOrderId→ProductionOrder, productId→Product, plannedQuantity:qty, plannedUom, actualQuantity?:qty, consumedLots:ConsumedLot[], notes?` (no own timestamps)
- **ConsumedLot** (embedded): `{ lotId→Lot, quantity:qty, unitCost:money }`

### Sales

**Customer** — `id, code, name, type:CustomerType, taxId, contactName, phone, email, address, paymentTermsDays:number, creditLimit:money, priceListId→PriceList, isActive:boolean`

**PriceList** — `id, name, currency, validFrom:date, validTo?:date, isDefault:boolean`

**PriceListItem** — `id, priceListId→PriceList, productId→Product, unitPrice:money, minQuantity?:qty` (no own timestamps)

**SalesOrder** — `id, orderNumber, customerId→Customer, warehouseId→Warehouse, status:SalesOrderStatus, currency, orderDate:date, promisedDate:date, subtotal:money, taxAmount:money, totalAmount:money, totalCogs?:money, grossMargin?:money, notes?, createdBy→User`

**SalesOrderLine** — `id, salesOrderId→SalesOrder, productId→Product, orderedQuantity:qty, uom, unitPrice:money, lineTotal:money, allocatedLots:AllocatedLot[]` (no own timestamps)
- **AllocatedLot** (embedded): `{ lotId→Lot, quantity:qty, unitCost:money }`

**Invoice** — `id, invoiceNumber, customerId→Customer, salesOrderId→SalesOrder, status:InvoiceStatus, currency, issueDate:date, dueDate:date, subtotal:money, taxAmount:money, totalAmount:money, paidAmount:money, outstandingAmount:money, notes?`

**Payment** — `id, invoiceId→Invoice, amount:money, currency, paidAt:ts, method:PaymentMethod, reference, recordedBy→User, createdAt` (no `updatedAt`)

### Identity

**Tenant** — `id, name, legalName, taxId, defaultCurrency, timezone`
**User** — `id, email, fullName, role:UserRole, isActive:boolean, lastLoginAt:ts`

## 5. Endpoints

### Read-only master data
```
GET  /api/tenant                          -> Tenant (current)
GET  /api/users            [/:id]         -> User[] | User
GET  /api/warehouses       [/:id]         -> Warehouse[] | Warehouse
GET  /api/products         [/:id]         -> Product[] | Product      ?type, ?category
GET  /api/suppliers        [/:id]         -> Supplier[] | Supplier
GET  /api/customers        [/:id]         -> Customer[] | Customer     ?type
GET  /api/price-lists/:id                 -> PriceList & { items: PriceListItem[] }
GET  /api/price-list-items                -> PriceListItem[]           ?priceListId, ?productId
GET  /api/lots             [/:id]         -> Lot[] | Lot               ?status, ?productId, ?warehouseId, ?source
GET  /api/stock-movements                 -> StockMovement[]           ?lotId, ?warehouseId, ?type
GET  /api/invoices         [/:id]         -> Invoice[] | Invoice       ?status, ?customerId
GET  /api/payments                        -> Payment[]                 ?invoiceId
```

### Purchasing
```
GET    /api/purchase-orders        [/:id] -> PurchaseOrder[] | (PurchaseOrder & { lines })   ?status, ?supplierId
GET    /api/purchase-order-lines          -> PurchaseOrderLine[]       ?purchaseOrderId
POST   /api/purchase-orders               -> 201 PurchaseOrder         (see §6.1)
POST   /api/purchase-orders/:id/receive   -> 201 GoodsReceipt & { lines }   (see §6.2)
DELETE /api/purchase-orders/:id           -> 204   (cascade delete lines)
GET    /api/goods-receipts         [/:id] -> GoodsReceipt[] | (GoodsReceipt & { lines })   ?purchaseOrderId
```

### Production
```
GET    /api/recipes                [/:id] -> Recipe[] | (Recipe & { ingredients })
POST   /api/recipes                       -> 201 Recipe & { ingredients }   (version=1)
POST   /api/recipes/:id/new-version       -> 201 Recipe & { ingredients }   (see §6.3)
DELETE /api/recipes/:id                   -> 204   (cascade delete ingredients)

GET    /api/production-orders      [/:id] -> ProductionOrder[] | ProductionOrderWithDetail   ?status, ?recipeId
       (detail = order & { inputs, recipe, outputLot, movements })
GET    /api/production-orders/:id/suggest-lots   -> SuggestLotsResponse    ?productId(req), ?quantity(req)   (FEFO, §6.5)
POST   /api/production-orders              -> 201 ProductionOrderWithDetail   (status DRAFT, explode inputs, §6.4)
PATCH  /api/production-orders/:id          -> ProductionOrderWithDetail    (edit plannedOutput[DRAFT only]/notes; rescales inputs)
POST   /api/production-orders/:id/start    -> ProductionOrderWithDetail    (DRAFT->IN_PROGRESS)
PATCH  /api/production-orders/:id/inputs/:inputId -> ProductionOrderInput  (autosave actualQuantity/consumedLots/notes)
POST   /api/production-orders/:id/complete -> ProductionOrderWithDetail    (IN_PROGRESS->COMPLETED, §6.6)
DELETE /api/production-orders/:id          -> 204   (cascade inputs; does NOT roll back lots/movements)
```

### Sales
```
GET    /api/inventory/availability         -> { productId, onHand, reserved, available }   ?productId(req)   (§6.7)
GET    /api/sales-orders           [/:id]  -> SalesOrder[] | (SalesOrder & { lines })   ?status, ?customerId
GET    /api/sales-order-lines              -> SalesOrderLine[]          ?salesOrderId
GET    /api/sales-orders/:id/suggest-allocations -> SuggestAllocationsResponse   ?productId(req), ?quantity(req), ?lineId   (FEFO + reservation-aware, §6.7)
POST   /api/sales-orders                   -> 201 SalesOrder & { lines }   (status DRAFT, tax 12%, §6.8)
POST   /api/sales-orders/:id/confirm       -> SalesOrder & { lines }    (DRAFT->CONFIRMED, reserve lots, §6.9)
POST   /api/sales-orders/:id/pick          -> SalesOrder & { lines }    (CONFIRMED->PICKED)
POST   /api/sales-orders/:id/deliver       -> SalesOrder & { lines }    (PICKED->DELIVERED, consume + COGS, §6.10)
DELETE /api/sales-orders/:id               -> 204   (cascade lines)
```

### Reports (§7)
```
GET /api/reports/dashboard                 -> DashboardReport
GET /api/reports/yield                     -> YieldReport          ?recipeId, ?from, ?to
GET /api/reports/inventory-valuation       -> ValuationReport      ?warehouseId, ?productType
GET /api/reports/traceability              -> TraceabilityReport   ?lotId(req), ?direction(backward|forward, default backward)
```

## 6. Business Logic (the important part)

### 6.1 Create Purchase Order — `POST /api/purchase-orders`
Body: `{ supplierId, warehouseId, expectedDate, currency, notes?, lines:[{ productId, orderedQuantity, uom, unitPrice }] }`
- Force `status = DRAFT`. Generate `poNumber = PO-{year}-{seq4}`.
- Per line: `lineTotal = orderedQuantity * unitPrice`, `receivedQuantity = "0.000"`.
- `totalAmount = Σ lineTotal`. `createdBy` = current user.

### 6.2 Receive Goods — `POST /api/purchase-orders/:id/receive`
Body: `{ warehouseId, notes?, lines:[{ purchaseOrderLineId, productId, quantity, uom, unitCost, supplierLotRef, productionDate, expiryDate }] }`
- Create `GoodsReceipt` (`receiptNumber = GR-{year}-{seq4}`) + one `GoodsReceiptLine` per line.
- **Per line create a new `Lot`**: new `lotNumber` (unique per tenant), `status = AVAILABLE`, `initialQuantity = currentQuantity = quantity`, `source = PURCHASE`, copy `unitCost/supplierLotRef/productionDate/expiryDate`, link `purchaseOrderLineId`.
- Create a `RECEIPT` `StockMovement` per lot (positive quantity). *(Mocks create the lot; emit the movement for audit parity.)*
- Increment `PurchaseOrderLine.receivedQuantity += quantity`.
- **PO status:** all lines `receivedQuantity >= orderedQuantity` → `RECEIVED`, else `PARTIALLY_RECEIVED`.

### 6.3 Recipe new version — `POST /api/recipes/:id/new-version`
- Old recipe → `isActive = false`. New row: `version = prev.version + 1`, `isActive = true`, fields default to previous if omitted, fresh ingredient rows. Old versions are immutable history.

### 6.4 Create Production Order — `POST /api/production-orders`
Body: `{ recipeId, warehouseId, plannedOutputQuantity, scheduledFor, notes? }`
- Load recipe (→ `422` if missing). `scale = plannedOutputQuantity / recipe.outputQuantity`.
- `status = DRAFT`, `orderNumber = PRD-{year}-{seq4}`, snapshot `recipeVersion`, cost/yield fields null.
- Explode one `ProductionOrderInput` per `RecipeIngredient`: `plannedQuantity = ingredient.quantity * scale`, `actualQuantity = null`, `consumedLots = []`.
- `PATCH /:id` recomputes input `plannedQuantity` when `plannedOutputQuantity` changes (DRAFT only, else `409`).

### 6.5 Suggest lots (production) — `GET /:id/suggest-lots`
- Candidate lots: `productId` match, `status = AVAILABLE`, `currentQuantity > 0`.
- Sort by `expiryDate` ASC (**FEFO**), greedily fill `quantity`. Response: `{ productId, requestedQuantity, shortfall, suggestions:[{ lotId, lotNumber, availableQuantity, expiryDate, unitCost, warehouseId, suggestedQuantity }] }`.

### 6.6 Complete Production — `POST /:id/complete`  (the heaviest flow)
Guard: must be `IN_PROGRESS` else `409`. Body: `{ actualOutputQuantity, outputLotNumber, expiryDate, outputWarehouseId, notes? }`.
1. `totalInputCost = Σ (consumedLot.quantity * unitCost)` over all inputs.
2. `meatActual = Σ actualQuantity` of inputs whose product `category ∈ {Beef, Pork, Lamb}` (`MEAT_CATEGORIES`).
3. `unitOutputCost = totalInputCost / actualOutputQuantity` (0 if output 0). `yieldPercent = actualOutputQuantity / meatActual * 100` (0 if meatActual 0), 2 decimals.
4. **Consume each consumed lot:** `currentQuantity -= quantity`; if hits 0 → `status = SOLD_OUT`. Emit `PRODUCTION_INPUT` movement (negative qty, ref `PRODUCTION_ORDER`/order.id).
5. **Create output lot:** `lotNumber = outputLotNumber`, `productId = recipe.outputProductId`, `warehouseId = outputWarehouseId`, `status = AVAILABLE`, `initial = current = actualOutputQuantity`, `unitCost = unitOutputCost`, `source = PRODUCTION`, `productionOrderId = order.id`, `parentLotIds = [distinct consumed lot ids]`.
6. Emit `PRODUCTION_OUTPUT` movement (positive qty).
7. Order → `COMPLETED`, set `actualOutputQuantity, outputLotId, completedAt, completedBy, totalInputCost, unitOutputCost, yieldPercent`.

### 6.7 Inventory availability & sales FEFO (reservation-aware)
- `onHand` = Σ `currentQuantity` of lots with `status != SOLD_OUT` for the product.
- `reserved` = Σ allocated quantities across `SalesOrderLine.allocatedLots` whose parent `SalesOrder.status ∈ {CONFIRMED, PICKED}` (NOT draft, NOT delivered).
- `available = max(onHand - reserved, 0)`.
- `suggest-allocations`: like 6.5 but each lot's `availableQuantity = max(currentQuantity - reservations against that lot from CONFIRMED/PICKED orders, 0)`; FEFO sort; greedy fill. Response adds optional `lineId` echo.

### 6.8 Create Sales Order — `POST /api/sales-orders`
Body: `{ customerId, warehouseId, orderDate, promisedDate, notes?, lines:[{ productId, orderedQuantity, uom, unitPrice }] }`
- `status = DRAFT`, `orderNumber = SO-{year}-{seq4}`.
- `lineTotal = orderedQuantity * unitPrice`, `allocatedLots = []`.
- `subtotal = Σ lineTotal`, `taxAmount = subtotal * 0.12` (**TAX_RATE = 12%**), `totalAmount = subtotal + taxAmount`. `totalCogs`/`grossMargin` null until delivery.

### 6.9 Confirm — `POST /:id/confirm`
Guard DRAFT else `409`. Body: `{ lines:[{ lineId, allocatedLots:[{ lotId, quantity, unitCost }] }] }`.
- Set each line's `allocatedLots`; each referenced lot `AVAILABLE → RESERVED`. Order → `CONFIRMED`. **No stock movements yet** (reservation is metadata only).
- `pick`: CONFIRMED → PICKED, no stock change.

### 6.10 Deliver — `POST /:id/deliver`
Guard PICKED else `409`. Body: `{ deliveredDate, notes? }`.
- For each line's allocated lots: `totalCogs += quantity * unitCost`; `currentQuantity -= quantity`; 0 → `SOLD_OUT` else `AVAILABLE`; emit `SALE` movement (negative qty, ref `SALES_ORDER`).
- `grossMargin = subtotal - totalCogs`. Order → `DELIVERED`, set `totalCogs, grossMargin`.

### State machines
- **PurchaseOrder:** DRAFT → PARTIALLY_RECEIVED → RECEIVED (via receive); CANCELLED.
- **ProductionOrder:** DRAFT → IN_PROGRESS → COMPLETED; CANCELLED. Illegal transition → `409`.
- **SalesOrder:** DRAFT → CONFIRMED → PICKED → DELIVERED; (INVOICED/SHIPPED reserved for future); CANCELLED. Illegal → `409`.
- **Invoice:** UNPAID / PARTIAL / PAID, driven by Payments (`outstandingAmount = totalAmount - paidAmount`).

## 7. Reports (computation)

All reports anchor to a configurable **anchor date** (mocks use seed `_meta.anchorDate`; real backend should use *now()* in the tenant timezone). "On-hand lot" everywhere = `status != SOLD_OUT && currentQuantity > 0`.

**Dashboard** `/api/reports/dashboard` →
`{ stockOnHandValue, lotsExpiringSoon:ExpiringLot[], activeProductionOrders, todayProductionOutput, outstandingAR, currency, productionOutput30d:[{date,quantity}] }`
- `stockOnHandValue` = Σ(currentQuantity × unitCost) of on-hand lots.
- `lotsExpiringSoon` = on-hand lots with `daysToExpiry <= 7`, sorted asc. `ExpiringLot = { lotId, lotNumber, productId, productName, warehouseId, currentQuantity, uom, expiryDate, daysToExpiry, value }`.
- `activeProductionOrders` = count status ∈ {IN_PROGRESS, DRAFT}.
- `todayProductionOutput` = Σ qty of `PRODUCTION_OUTPUT` movements on anchor day.
- `outstandingAR` = Σ `invoice.outstandingAmount` where status != PAID.
- `productionOutput30d` = 30 daily buckets ending at anchor (inclusive).

**Yield** `/api/reports/yield` ?recipeId,from,to → groups **COMPLETED** production orders by recipe (filter by `completedAt` in `[from, to T23:59:59]`).
Row: `{ recipeId, recipeName, batches, plannedOutput(Σ), actualOutput(Σ), totalCost(Σ totalInputCost), avgYieldPercent(avg of non-null yieldPercent), expectedYieldPercent(recipe), yieldVariance(avg - expected) }`. Plus `batchCount` total.

**Inventory valuation** `/api/reports/inventory-valuation` ?warehouseId,productType → on-hand lots grouped by `warehouseId + product.type`.
Row: `{ warehouseId, warehouseName, productType, lotCount, totalQuantity(Σ), totalValue(Σ qty×unitCost) }`. Plus `grandTotal`.

**Traceability** `/api/reports/traceability` ?lotId(req),direction → recursive lot tree (`404` if lot missing).
- `backward`: follow `parentLotIds` (ingredients that went into this lot).
- `forward`: find lots whose `parentLotIds` contains this lot (where this lot ended up).
- `TraceNode = { lotId, lotNumber, productId, productName, warehouseId, quantity, uom, unitCost, expiryDate, source, status, depth, children[] }`. **Cap depth < 8** (cycle guard).

## 8. Implementation notes for the backend dev
- Money/quantity math must use a decimal library (server-side `Decimal`), output as fixed-precision strings (money 2dp, qty 3dp, percent 2dp).
- Wrap multi-write flows (6.2, 6.6, 6.10) in **DB transactions** — lot decrement + movement + status update must be atomic; the mocks aren't, the real backend must be.
- The mocks **do not** validate that allocated/consumed quantities ≤ lot `currentQuantity`, nor re-check reservations at deliver/complete time. Recommend adding these guards server-side (return `409`/`422`), since concurrent orders can oversell. Flag to product owner.
- Number generators (`PO-`, `GR-`, `PRD-`, `SO-` + zero-padded yearly sequence) must be concurrency-safe (sequence per tenant per year).
- Enforce `lotNumber` unique per tenant (UI now relies on it as the lot's display identity).
- Seed/reference data (`MEAT_CATEGORIES = {Beef, Pork, Lamb}`, `TAX_RATE = 0.12`) should be configurable, ideally per-tenant.

## 9. Verification (frontend parity)
- Run frontend against the new backend with mocks **disabled** (`src/mocks/browser.ts` worker not started). Every screen must work unchanged: lots list/detail, PO create+receive, production create→start→complete, sales create→confirm→pick→deliver, all 4 reports.
- Compare a handful of responses field-by-field against the mock output for the same seed to confirm contract parity (shapes, string precision, embedded children).
