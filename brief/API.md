# Meat Processing ERP — API Contract

REST API consumed by the frontend. Backend is a future deliverable; the frontend mentee
builds against MSW (Mock Service Worker) using the seed data in `mock-data.json`.

When the real backend lands, the contract here is what it must satisfy. Treat this as the
binding interface between frontend and backend.

---

## 1. Conventions

### 1.1 Base URL
`/api/v1`

### 1.2 Authentication
- Login returns a JWT containing `userId`, `tenantId`, `role`.
- All other requests carry `Authorization: Bearer <jwt>`.
- Backend extracts `tenantId` from JWT — frontend NEVER sends it in requests.
- 401 if token missing/invalid; 403 if role insufficient.

### 1.3 Content type
- Request and response: `application/json; charset=utf-8`.
- Dates: ISO 8601 with timezone (`2026-05-05T08:30:00+05:00`).
- Decimals: strings (`"100.500"`), never JS numbers.
- Booleans, integers, enums: native JSON types / strings.

### 1.4 Pagination
List endpoints paginate via query params:
- `page` (1-indexed, default 1)
- `pageSize` (default 25, max 100)

Response envelope:
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 134,
    "totalPages": 6
  }
}
```

### 1.5 Filtering and sorting
Common params on list endpoints:
- `q` — free-text search (matches name/code/number depending on entity)
- `sort` — `field:asc` or `field:desc`, e.g. `sort=createdAt:desc`
- Entity-specific filters listed per endpoint.

Multi-value filters use comma separation: `status=AVAILABLE,QUARANTINE`.

### 1.6 Error response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Lot quantity cannot be negative",
    "details": [
      { "field": "currentQuantity", "issue": "must be >= 0" }
    ]
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) — e.g. duplicate SKU, lot already depleted
- `BUSINESS_RULE_VIOLATION` (422) — e.g. trying to consume an EXPIRED lot
- `INTERNAL_ERROR` (500)

### 1.7 IDs
All IDs are UUID v4 strings.

### 1.8 Idempotency
POST operations that create transactional records (production order completion, sales order
delivery) accept an `Idempotency-Key` header. Replays return the original response.

---

## 2. Auth endpoints

### POST /auth/login
Request:
```json
{ "email": "ops@andijan-meat.uz", "password": "..." }
```
Response 200:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "u-123",
    "email": "ops@andijan-meat.uz",
    "fullName": "Botir Karimov",
    "role": "PRODUCTION_MANAGER",
    "tenantId": "t-001",
    "tenantName": "Andijan Meat Co"
  }
}
```

### POST /auth/logout
Response 204.

### GET /auth/me
Response 200: same `user` shape as login.

---

## 3. Tenants & users

### GET /users
Query: `q`, `role`, `isActive`, `sort`, `page`, `pageSize`.
Response: paginated `User[]`.

### POST /users
Role required: `ADMIN`.
Request:
```json
{
  "email": "...", "fullName": "...", "role": "WAREHOUSE_OPERATOR", "password": "..."
}
```

### PATCH /users/:id
Update role, name, isActive. Cannot change own role.

### POST /users/:id/reset-password
Role required: `ADMIN`.

---

## 4. Warehouses

### GET /warehouses
Query: `type`, `isActive`, `q`.
Response 200:
```json
{
  "data": [
    {
      "id": "wh-001",
      "code": "CS-A",
      "name": "Cold Storage A",
      "type": "COLD_STORAGE",
      "isActive": true,
      "createdAt": "2026-01-15T09:00:00+05:00",
      "updatedAt": "2026-01-15T09:00:00+05:00"
    }
  ],
  "pagination": { "page": 1, "pageSize": 25, "totalItems": 4, "totalPages": 1 }
}
```

### POST /warehouses, PATCH /warehouses/:id, DELETE /warehouses/:id (soft delete)

---

## 5. Products

### GET /products
Query: `type`, `category`, `isActive`, `q`, `sort`, `page`, `pageSize`.

### GET /products/:id

### POST /products
```json
{
  "sku": "BEEF-TRIM-80",
  "name": "Beef Trim 80/20",
  "type": "RAW_MATERIAL",
  "uom": "KG",
  "shelfLifeDays": 5,
  "category": "Beef",
  "barcode": "4607012345678"
}
```

### PATCH /products/:id, DELETE /products/:id (soft delete via isActive=false)

---

## 6. Lots (the core inventory query)

### GET /lots
The big one — drives the inventory grid. Supports rich filtering.

Query params:
- `productId` (single or comma-separated)
- `warehouseId`
- `status` (default: `AVAILABLE,QUARANTINE`; pass `*` for all)
- `expiryBefore` (ISO date) — lots expiring before this date
- `expiryAfter`
- `productType`
- `q` — searches lotNumber, supplierLotRef
- `hasStock=true` — filters out lots with currentQuantity == 0
- `sort` — `expiryDate:asc`, `createdAt:desc`, etc.

Response:
```json
{
  "data": [
    {
      "id": "lot-001",
      "lotNumber": "BEEF-2026-05-001",
      "product": {
        "id": "prod-001",
        "sku": "BEEF-TRIM-80",
        "name": "Beef Trim 80/20",
        "uom": "KG"
      },
      "warehouse": { "id": "wh-001", "code": "CS-A", "name": "Cold Storage A" },
      "status": "AVAILABLE",
      "initialQuantity": "100.000",
      "currentQuantity": "76.500",
      "uom": "KG",
      "unitCost": "65000.00",
      "currency": "UZS",
      "productionDate": "2026-05-01",
      "expiryDate": "2026-05-08",
      "receivedAt": "2026-05-02T10:30:00+05:00",
      "source": "PURCHASE",
      "purchaseOrderLineId": "pol-001",
      "productionOrderId": null,
      "parentLotIds": [],
      "supplierLotRef": "LOT-SX-2347",
      "notes": null,
      "createdAt": "2026-05-02T10:30:00+05:00",
      "updatedAt": "2026-05-04T14:20:00+05:00"
    }
  ],
  "pagination": { "page": 1, "pageSize": 25, "totalItems": 1, "totalPages": 1 }
}
```

### GET /lots/:id
Returns single lot with same shape as list item.

### GET /lots/:id/movements
Returns all stock movements for this lot, oldest first. Drives the "lot history" expanded row.

### GET /lots/:id/trace?direction=backward|forward
Returns traceability tree.
- `backward`: walks parentLotIds recursively. For raw lots returns `{}`.
- `forward`: finds all descendants and the sales orders that shipped them.

Response (backward):
```json
{
  "lot": { /* the queried lot */ },
  "parents": [
    {
      "lot": { /* parent lot summary */ },
      "consumedQuantity": "60.000",
      "parents": [ /* recursive */ ]
    }
  ]
}
```

Response (forward):
```json
{
  "lot": { /* the queried lot */ },
  "children": [
    {
      "lot": { /* child finished-goods lot */ },
      "producedQuantity": "96.000",
      "children": [ /* recursive */ ],
      "salesOrders": [
        {
          "id": "so-001",
          "orderNumber": "SO-2026-0042",
          "customerName": "Korzinka Tashkent",
          "deliveredAt": "2026-05-04T16:00:00+05:00",
          "shippedQuantity": "10.000"
        }
      ]
    }
  ]
}
```

### POST /lots/:id/adjust
Manual adjustment (stock count correction).
```json
{
  "quantityDelta": "-2.500",  // signed
  "reasonCode": "COUNT_DIFF",
  "notes": "Physical count came in 2.5kg short on 2026-05-04"
}
```
Response 200: updated Lot.

### POST /lots/:id/write-off
```json
{ "quantity": "5.000", "reasonCode": "EXPIRY", "notes": "..." }
```
Sets WRITTEN_OFF status if full quantity written off; otherwise reduces currentQuantity.

### GET /lots/expiring
Convenience endpoint for the dashboard.
Query: `withinDays` (default 7).
Response: paginated lots with `expiryDate <= today + withinDays`, status AVAILABLE/QUARANTINE.

---

## 7. Stock movements

### GET /stock-movements
Query: `lotId`, `type`, `referenceType`, `referenceId`, `from`, `to` (date range), `warehouseId`.
Response: paginated StockMovement[].

Movements are read-only via API. Created internally by other operations.

---

## 8. Suppliers

Standard REST: `GET /suppliers`, `GET /suppliers/:id`, `POST`, `PATCH`, `DELETE`.

---

## 9. Purchase orders & goods receipts

### GET /purchase-orders
Query: `status`, `supplierId`, `from`, `to`, `q` (matches poNumber).

### GET /purchase-orders/:id
Returns PO with embedded lines:
```json
{
  "id": "po-001",
  "poNumber": "PO-2026-0001",
  "supplier": { "id": "sup-001", "code": "SX", "name": "Sultanov Xojadod LLC" },
  "warehouseId": "wh-001",
  "status": "PARTIALLY_RECEIVED",
  "currency": "UZS",
  "orderDate": "2026-04-28",
  "expectedDate": "2026-05-02",
  "totalAmount": "8000000.00",
  "lines": [
    {
      "id": "pol-001",
      "product": { "id": "prod-001", "sku": "BEEF-TRIM-80", "name": "Beef Trim 80/20" },
      "orderedQuantity": "100.000",
      "receivedQuantity": "100.000",
      "uom": "KG",
      "unitPrice": "65000.00",
      "lineTotal": "6500000.00"
    }
  ],
  "createdBy": { "id": "u-002", "fullName": "Sales User" },
  "createdAt": "2026-04-28T09:15:00+05:00"
}
```

### POST /purchase-orders
```json
{
  "supplierId": "sup-001",
  "warehouseId": "wh-001",
  "expectedDate": "2026-05-02",
  "currency": "UZS",
  "lines": [
    { "productId": "prod-001", "orderedQuantity": "100.000", "uom": "KG", "unitPrice": "65000.00" }
  ],
  "notes": "..."
}
```

### POST /purchase-orders/:id/submit  → status SUBMITTED
### POST /purchase-orders/:id/cancel  → status CANCELLED

### POST /purchase-orders/:id/receive
Records a goods receipt. Generates Lot(s) and stock movements atomically.
```json
{
  "receivedAt": "2026-05-02T10:30:00+05:00",
  "warehouseId": "wh-001",
  "lines": [
    {
      "purchaseOrderLineId": "pol-001",
      "quantity": "100.000",
      "unitCost": "65000.00",
      "supplierLotRef": "LOT-SX-2347",
      "productionDate": "2026-05-01",
      "expiryDate": "2026-05-08"
    }
  ],
  "notes": "Received in good condition, temperature -2°C"
}
```
Response 201:
```json
{
  "goodsReceipt": { /* full GR record */ },
  "createdLots": [ { /* Lot */ } ]
}
```

---

## 10. Recipes

### GET /recipes
Query: `outputProductId`, `isActive`, `q`.

### GET /recipes/:id
Includes ingredients:
```json
{
  "id": "rcp-001",
  "code": "RCP-MINCE-80",
  "name": "Beef Mince 80/20",
  "outputProduct": { "id": "prod-fg-001", "sku": "BEEF-MINCE-80-1KG", "name": "Beef Mince 80/20 1kg" },
  "outputQuantity": "100.000",
  "outputUom": "KG",
  "expectedYieldPercent": "96.00",
  "version": 1,
  "isActive": true,
  "ingredients": [
    {
      "id": "ing-001",
      "product": { "id": "prod-001", "sku": "BEEF-TRIM-80", "name": "Beef Trim 80/20" },
      "quantity": "104.000",
      "uom": "KG",
      "isOptional": false
    },
    {
      "id": "ing-002",
      "product": { "id": "prod-002", "sku": "SALT", "name": "Salt" },
      "quantity": "0.800",
      "uom": "KG",
      "isOptional": false
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### POST /recipes, PATCH /recipes/:id (creates a new version), DELETE /recipes/:id (deactivates)

---

## 11. Production orders (the most complex screen)

### GET /production-orders
Query: `status`, `recipeId`, `from`, `to`, `q` (matches orderNumber).

### GET /production-orders/:id
```json
{
  "id": "prd-001",
  "orderNumber": "PRD-2026-0001",
  "recipe": {
    "id": "rcp-001",
    "code": "RCP-MINCE-80",
    "name": "Beef Mince 80/20",
    "version": 1,
    "expectedYieldPercent": "96.00"
  },
  "warehouse": { "id": "wh-002", "code": "PROD-1", "name": "Production Floor 1" },
  "status": "IN_PROGRESS",
  "plannedOutputQuantity": "100.000",
  "plannedOutputUom": "KG",
  "actualOutputQuantity": null,
  "outputLotId": null,
  "scheduledFor": "2026-05-05T08:00:00+05:00",
  "startedAt": "2026-05-05T08:15:00+05:00",
  "completedAt": null,
  "totalInputCost": null,
  "unitOutputCost": null,
  "yieldPercent": null,
  "inputs": [
    {
      "id": "poi-001",
      "product": {
        "id": "prod-001",
        "sku": "BEEF-TRIM-80",
        "name": "Beef Trim 80/20",
        "uom": "KG"
      },
      "plannedQuantity": "104.000",
      "plannedUom": "KG",
      "actualQuantity": "60.000",
      "consumedLots": [
        {
          "lotId": "lot-001",
          "lotNumber": "BEEF-2026-05-001",
          "quantity": "60.000",
          "unitCost": "65000.00"
        }
      ]
    },
    {
      "id": "poi-002",
      "product": { "id": "prod-002", "sku": "SALT", "name": "Salt", "uom": "KG" },
      "plannedQuantity": "0.800",
      "plannedUom": "KG",
      "actualQuantity": null,
      "consumedLots": []
    }
  ],
  "createdBy": { "id": "u-003", "fullName": "Production Manager" },
  "completedBy": null,
  "notes": "Morning batch",
  "createdAt": "2026-05-04T17:00:00+05:00",
  "updatedAt": "2026-05-05T08:15:00+05:00"
}
```

### POST /production-orders
Creates DRAFT. Backend computes planned consumption from recipe scaled to plannedOutputQuantity.
```json
{
  "recipeId": "rcp-001",
  "plannedOutputQuantity": "100.000",
  "warehouseId": "wh-002",
  "scheduledFor": "2026-05-05T08:00:00+05:00",
  "notes": "..."
}
```
Response 201: full ProductionOrder with computed `inputs[].plannedQuantity`.

### PATCH /production-orders/:id
Edit DRAFT (change planned output, scheduled date, notes). Returns 409 if not DRAFT.

### POST /production-orders/:id/start  → status IN_PROGRESS, sets startedAt

### PATCH /production-orders/:id/inputs/:inputId
Records actual consumption for one ingredient. Sent as operator weighs each input.
```json
{
  "actualQuantity": "60.000",
  "consumedLots": [
    { "lotId": "lot-001", "quantity": "60.000" }
  ]
}
```
Response 200: updated input. Backend snapshots `unitCost` from each lot.

If `consumedLots` is omitted, backend auto-allocates FIFO and returns the chosen lots.

### GET /production-orders/:id/suggest-lots?productId=X&quantity=Y
Returns FIFO-suggested lots for a given product and quantity. Drives the "auto-fill" UX.
```json
{
  "suggested": [
    { "lotId": "lot-001", "lotNumber": "BEEF-2026-05-001", "availableQuantity": "76.500", "expiryDate": "2026-05-08", "unitCost": "65000.00", "useQuantity": "60.000" }
  ],
  "shortage": "0.000"
}
```

### POST /production-orders/:id/complete
Atomically: validates, posts movements, creates output lot, sets status COMPLETED.
```json
{
  "actualOutputQuantity": "96.500",
  "outputLotNumber": "MINCE-2026-05-001",     // optional, auto-generated if omitted
  "expiryDate": "2026-05-12",
  "outputWarehouseId": "wh-001",
  "notes": "..."
}
```
Response 200: full updated ProductionOrder including `outputLotId`, `unitOutputCost`, `yieldPercent`.

Errors:
- `BUSINESS_RULE_VIOLATION` if any required input has actualQuantity null.
- `BUSINESS_RULE_VIOLATION` if any consumed lot is no longer AVAILABLE.

### POST /production-orders/:id/cancel  → status CANCELLED (only from DRAFT or IN_PROGRESS)

---

## 12. Customers & price lists

### GET /customers, /customers/:id, POST, PATCH, DELETE — standard.

### GET /price-lists, /price-lists/:id, POST, PATCH, DELETE.

### GET /price-lists/:id/items
### POST /price-lists/:id/items, PATCH, DELETE.

---

## 13. Sales orders

### GET /sales-orders
Query: `status`, `customerId`, `from`, `to`, `q`.

### GET /sales-orders/:id
```json
{
  "id": "so-001",
  "orderNumber": "SO-2026-0042",
  "customer": { "id": "cus-001", "code": "KZ", "name": "Korzinka Tashkent", "type": "RETAIL" },
  "warehouse": { "id": "wh-001", "code": "CS-A", "name": "Cold Storage A" },
  "status": "CONFIRMED",
  "currency": "UZS",
  "orderDate": "2026-05-04",
  "promisedDate": "2026-05-05",
  "subtotal": "1850000.00",
  "taxAmount": "222000.00",
  "totalAmount": "2072000.00",
  "totalCogs": null,
  "grossMargin": null,
  "lines": [
    {
      "id": "sol-001",
      "product": { "id": "prod-fg-001", "sku": "BEEF-MINCE-80-1KG", "name": "Beef Mince 80/20 1kg" },
      "orderedQuantity": "20.000",
      "uom": "KG",
      "unitPrice": "92500.00",
      "lineTotal": "1850000.00",
      "allocatedLots": [
        {
          "lotId": "lot-fg-001",
          "lotNumber": "MINCE-2026-05-001",
          "quantity": "20.000",
          "unitCost": "67708.33"
        }
      ]
    }
  ],
  "notes": "...",
  "createdAt": "2026-05-04T11:00:00+05:00"
}
```

### POST /sales-orders
```json
{
  "customerId": "cus-001",
  "warehouseId": "wh-001",
  "promisedDate": "2026-05-05",
  "lines": [
    { "productId": "prod-fg-001", "orderedQuantity": "20.000", "uom": "KG", "unitPrice": "92500.00" }
  ]
}
```
Status DRAFT. Allocations not yet made.

### POST /sales-orders/:id/confirm
Allocates lots (FIFO by default). Operator can pre-set allocations via PATCH on lines.
Status → CONFIRMED.

### PATCH /sales-orders/:id/lines/:lineId
Allows manual lot allocation override:
```json
{ "allocatedLots": [ { "lotId": "lot-fg-002", "quantity": "20.000" } ] }
```

### POST /sales-orders/:id/pick   → PICKED
### POST /sales-orders/:id/deliver
Posts SALE movements; computes totalCogs and grossMargin; status → DELIVERED.
```json
{ "deliveredAt": "2026-05-05T14:00:00+05:00", "notes": "..." }
```

### POST /sales-orders/:id/cancel

---

## 14. Invoices & payments

### GET /invoices, GET /invoices/:id

### POST /invoices  (or auto-generated on sales order INVOICED transition)
### POST /invoices/:id/issue   → ISSUED
### POST /invoices/:id/void

### POST /invoices/:id/payments
```json
{ "amount": "1000000.00", "paidAt": "2026-05-10T12:00:00+05:00", "method": "BANK_TRANSFER", "reference": "..." }
```
Response: updated Invoice with new outstandingAmount.

### GET /invoices/:id/payments

---

## 15. Reports

### GET /reports/inventory-valuation
Query: `asOfDate`, `warehouseId`, `productType`.
Response: per-product totals (quantity, cost) and grand total.

### GET /reports/yield
Query: `from`, `to`, `recipeId`.
Response: production orders in range with planned vs actual, average yield %.

### GET /reports/expiry-aging
Returns lots bucketed by days-to-expiry: `<0`, `0-7`, `8-14`, `15-30`, `>30`.

### GET /reports/sales-margin
Query: `from`, `to`, `customerId`, `productId`.
Response: revenue, COGS, margin per dimension.

### GET /reports/dashboard
Aggregate for the home screen:
```json
{
  "stockOnHandValue": "85000000.00",
  "lotsExpiringSoon": 12,
  "activeProductionOrders": 3,
  "openSalesOrders": 7,
  "todaysReceipts": 2,
  "todaysProductionOutputKg": "240.500",
  "outstandingAR": "12500000.00",
  "currency": "UZS"
}
```

---

## 16. Permission matrix

| Endpoint family            | ADMIN | PROD_MGR | WH_OP | SALES | ACCT | VIEWER |
|----------------------------|:-----:|:--------:|:-----:|:-----:|:----:|:------:|
| Users (write)              |   ✓   |    -     |   -   |   -   |  -   |   -    |
| Warehouses (write)         |   ✓   |    -     |   -   |   -   |  -   |   -    |
| Products (write)           |   ✓   |    ✓     |   -   |   -   |  -   |   -    |
| Suppliers (write)          |   ✓   |    ✓     |   -   |   ✓   |  -   |   -    |
| POs / receipts (write)     |   ✓   |    ✓     |   ✓   |   -   |  -   |   -    |
| Recipes (write)            |   ✓   |    ✓     |   -   |   -   |  -   |   -    |
| Production orders          |   ✓   |    ✓     |   ✓*  |   -   |  -   |   -    |
| Lots adjust/write-off      |   ✓   |    ✓     |   ✓   |   -   |  -   |   -    |
| Customers / price lists    |   ✓   |    -     |   -   |   ✓   |  -   |   -    |
| Sales orders               |   ✓   |    -     |   ✓** |   ✓   |  -   |   -    |
| Invoices / payments        |   ✓   |    -     |   -   |   ✓   |  ✓   |   -    |
| Reports (read)             |   ✓   |    ✓     |   ✓   |   ✓   |  ✓   |   ✓    |
| All read endpoints         |   ✓   |    ✓     |   ✓   |   ✓   |  ✓   |   ✓    |

* WH_OP can record actual consumption on production orders but cannot create or complete them.
** WH_OP can pick/deliver but not create or price sales orders.

---

## 17. Mock backend (frontend dev)

Until the real backend exists, the frontend uses MSW. Conventions:
- Implement every endpoint in section 2-15 against the seed data in `mock-data.json`.
- Mutations update an in-memory store derived from the seed; reset on page reload is fine.
- Latency: introduce a 200-400ms randomized delay so loading states are exercised.
- Failure simulation: a hidden URL toggle (`?simulate=fail-on-complete`) for testing error paths.
