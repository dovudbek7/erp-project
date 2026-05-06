# Meat Processing ERP — To'liq Loyiha Qo'llanmasi

> Bu hujjat brif (`MENTEE-BRIEF.md`, `DOMAIN.md`, `API.md`) ning o'zbekcha,
> yanada batafsil va amaliy versiyasi. Maqsad — siz bu hujjatga qarab `meat-erp-design`
> design referansidagi har bir sahifani noldan o'zingiz qura olishingiz.
>
> **O'qish tartibi:** 1-bo'lim → 4-bo'lim (domain) → 5-bo'lim (API) → keyin
> kerakli sahifaga o'tib boring. **Frontend ishini boshlashdan oldin
> 1–6 bo'limlarni to'liq o'qib chiqing.**

---

## Mundarija

1. [Loyiha haqida umumiy ma'lumot](#1-loyiha-haqida-umumiy-malumot)
2. [Texnologiyalar to'plami (stack)](#2-texnologiyalar-toplami-stack)
3. [Loyiha tuzilmasi (folder structure)](#3-loyiha-tuzilmasi-folder-structure)
4. [Domain — biznes modeli](#4-domain--biznes-modeli)
5. [API kontrakti](#5-api-kontrakti)
6. [Frontend arxitekturasi](#6-frontend-arxitekturasi)
7. [Design tizimi (Design System)](#7-design-tizimi-design-system)
8. [Routing strategiyasi](#8-routing-strategiyasi)
9. [Auth oqimi (login/logout)](#9-auth-oqimi-loginlogout)
10. [Multi-tenant izolatsiya](#10-multi-tenant-izolatsiya)
11. [MSW (mock backend) sozlash](#11-msw-mock-backend-sozlash)
12. [TanStack Query bilan ishlash](#12-tanstack-query-bilan-ishlash)
13. [Forma va validatsiya (RHF + Zod)](#13-forma-va-validatsiya-rhf--zod)
14. [Pul va miqdor matematika (decimal.js)](#14-pul-va-miqdor-matematika-decimaljs)
15. [Sahifalar (har bir ekranni qurish)](#15-sahifalar-har-bir-ekranni-qurish)
    - 15.1 Login
    - 15.2 Dashboard
    - 15.3 Inventory — Lots Grid
    - 15.4 Lot Detail
    - 15.5 Expiring Soon
    - 15.6 Purchase Orders
    - 15.7 PO Detail + Receive Goods
    - 15.8 Production Orders
    - 15.9 Production Order Detail (DRAFT / IN_PROGRESS / COMPLETED)
    - 15.10 Sales Orders
    - 15.11 Sales Order Detail (allocation)
    - 15.12 Reports
    - 15.13 Traceability
    - 15.14 Stub sahifalar (Warehouses, Products, Recipes, Customers, Invoices)
16. [Tayyor bo'lganini bilish (Definition of Done)](#16-tayyor-bolganini-bilish-definition-of-done)
17. [Test strategiyasi](#17-test-strategiyasi)
18. [Bosqichma-bosqich reja (5 phase)](#18-bosqichma-bosqich-reja-5-phase)
19. [Tez-tez uchraydigan xatolar (Pitfallar)](#19-tez-tez-uchraydigan-xatolar-pitfallar)
20. [Foydali komandalar va tezkor referans](#20-foydali-komandalar-va-tezkor-referans)

---

## 1. Loyiha haqida umumiy ma'lumot

### Nima quramiz

Andijonda joylashgan kichik **Andijan Meat Co** korxonasi uchun **multi-tenant ERP**
tizimining frontend qismi. Korxona xom go'shtni (mol go'shti, qo'y, cho'chqa, ziravorlar,
o'rash materiallari) yetkazib beruvchilardan oladi, ularni quyma go'sht (mince),
lula kabob va sosiska kabi tayyor mahsulotlarga aylantiradi, so'ng do'kon, restoran
va distribyutorlarga sotadi.

Tizim kuzatishi kerak:
- **Har bir kilogramm xom xom ashyoning narxi** va kelib chiqishi (qachon, qaysi
  yetkazib beruvchidan, qachon yaroqlilik muddati tugaydi).
- **Har bir tayyor partiya tannarxi** — uning tarkibida ishlatilgan har bir xom
  partiya narxlari yig'indisidan kelib chiqib hisoblanadi.
- **Sotuv** — qaysi tayyor partiya qaysi mijozga ketdi va margin (foyda).
- **Yaroqlilik muddati** — qaysi partiya tez orada eskirayapti.

### Nega faqat frontend?

Backend keyinchalik (NestJS bilan) qilinadi. Hozir biz **MSW (Mock Service Worker)**
yordamida frontend ni real API bo'lganday qilib ishlatamiz. Backend chiqqanda,
faqat MSW ni o'chirib, base URL ni o'zgartirib, kod o'zgarishsiz ishlashi kerak.

### Sizning roli

Siz oddiy "ekran chizuvchi" emas, **shartnoma asosida ishlovchi (contract-first),
type-safe, multi-tenant, testlanadigan** real frontend yozasiz. Maqsad — tezlik
emas, **chuqurlik va intizom**. Bu loyiha kelajakda ishlaydigan bir nechta real
mahsulotlar uchun shablon vazifasini bajaradi.

---

## 2. Texnologiyalar to'plami (stack)

Quyidagi to'plam **majburiy** (MGK ELD frontend stack ga aynan mos):

| Texnologiya             | Vazifasi                                    |
|-------------------------|---------------------------------------------|
| **React 18 + TypeScript** (strict mode) | UI framework + tip xavfsizligi |
| **Vite**                | Build tool                                  |
| **TanStack Query**      | Server state (`@tanstack/react-query`)      |
| **TanStack Table v8**   | Data grid lar                               |
| **MUI v6**              | UI komponentlar va theming                  |
| **React Hook Form**     | Forma boshqaruvi                            |
| **Zod**                 | Validatsiya schema                          |
| **MSW**                 | Mock backend (Mock Service Worker)          |
| **decimal.js**          | Pul va miqdor uchun (`number` ishlatmang!)  |
| **date-fns**            | Sana arifmetika                             |
| **Vitest + RTL**        | Test                                        |
| **ESLint + Prettier**   | Linting va formatting                       |

> **Muhim:** `number` tipi **pul** va **miqdor** uchun **mutlaqo taqiqlangan**.
> Faqat `decimal.js` orqali. Sababi — JS `number` floating-point xatolari
> (`0.1 + 0.2 === 0.30000000000000004`) bilan moliyaviy hisob-kitoblar buziladi.

---

## 3. Loyiha tuzilmasi (folder structure)

```
meat-erp-frontend/
├── src/
│   ├── api/                  # API client wrapperlar
│   │   ├── client.ts         # axios instance + auth interceptor
│   │   └── endpoints/        # har bir resurs uchun bitta fayl
│   │       ├── auth.ts
│   │       ├── lots.ts
│   │       ├── purchase-orders.ts
│   │       ├── production-orders.ts
│   │       ├── sales-orders.ts
│   │       └── ...
│   ├── contracts/            # DOMAIN.md ga mos TypeScript turlari
│   │   ├── enums.ts          # UserRole, LotStatus, ...
│   │   ├── entities.ts       # Lot, Product, ProductionOrder, ...
│   │   └── api-payloads.ts   # Request/Response shape lari
│   ├── mocks/                # MSW handler lar
│   │   ├── handlers/         # endpoint bo'yicha bo'lingan
│   │   │   ├── auth.ts
│   │   │   ├── lots.ts
│   │   │   └── ...
│   │   ├── store.ts          # in-memory data store
│   │   ├── seed.ts           # mock-data.json ni yuklash
│   │   └── browser.ts        # MSW worker ni boshlash
│   ├── features/             # domain bo'yicha bo'lingan UI
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── useAuth.ts
│   │   │   └── AuthProvider.tsx
│   │   ├── inventory/
│   │   │   ├── LotsPage.tsx
│   │   │   ├── LotDetailPage.tsx
│   │   │   ├── ExpiringPage.tsx
│   │   │   └── components/
│   │   ├── purchase/
│   │   ├── production/       # eng katta feature
│   │   │   ├── ProductionOrderPage.tsx
│   │   │   ├── modes/
│   │   │   │   ├── DraftMode.tsx
│   │   │   │   ├── InProgressMode.tsx
│   │   │   │   └── CompletedMode.tsx
│   │   │   └── components/
│   │   │       ├── InputRow.tsx
│   │   │       ├── LotSuggestPanel.tsx
│   │   │       └── CumulativeCard.tsx
│   │   ├── sales/
│   │   └── reports/
│   ├── shared/               # umumiy komponentlar
│   │   ├── components/       # AppShell, Sidebar, PageHead, StatusPill, ...
│   │   ├── hooks/            # useDebounce, useUrlState, ...
│   │   └── utils/            # money, qty, date helperlari
│   ├── routes/               # route ta'riflari (react-router)
│   ├── theme/                # MUI theme
│   └── App.tsx
├── public/
│   └── mockServiceWorker.js  # MSW yaratadi
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> **`contracts/` papkasi muqaddas.** U `DOMAIN.md` ning TypeScript ifodasi.
> Backend chiqqanda, bu papka backend tipi bilan **aynan bir xil bo'lishi kerak**.
> Agar bo'lmasa — **biror joyda bug bor**.

---

## 4. Domain — biznes modeli

### 4.1 Asosiy tushunchalar

- **Tenant** (ijaraga oluvchi) — tizimdan foydalanuvchi kompaniya. Hamma narsa
  tenant ga bog'langan. Bizning seed da bitta tenant: **Andijan Meat Co**.

- **Warehouse** (ombor) — fizik saqlash joyi (`Cold Storage A`, `Production Floor 1`,
  `Finished Goods Cold A`, `Shipping Dock`). Inventar har doim qaysidir omborda
  yashaydi.

- **Product** (mahsulot/SKU) — ikki turi bor:
  - **RAW_MATERIAL** — Beef Trim 80/20, Salt, Black Pepper, ...
  - **FINISHED_GOOD** — Beef Mince 80/20 1kg, Lula Kebab 500g, ...
  - **PACKAGING** — qutilar, plyonka, etiketkalar.

- **Lot** (partiya/batch) — mahsulotning **fizik nusxasi**, har birining o'z identifikatori,
  ishlab chiqarilgan sanasi, yaroqlilik muddati va **o'z tannarxi** bor. Agar
  Lot A dan 100 kg va Lot B dan 50 kg go'shtni mince qilsangiz, yangi tayyor
  partiya hosil bo'ladi va uning tannarxi shu ikki ota partiyadan rolling-up qilinadi.

- **StockMovement** (ombor harakati) — miqdorlar **faqat shu orqali** o'zgaradi.
  Har bir kelishi, ishlatishi, sotishi, tuzatish, write-off — bu stock movement.
  Buni **ikki tomonlama buxgalteriya** (double-entry bookkeeping) deb tasavvur
  qiling, faqat fizik mol uchun. **Stock-on-hand harakatlardan derive qilinadi,
  hech qachon to'g'ridan-to'g'ri saqlanmaydi.**

- **Recipe** (resept / BOM — Bill of Materials) — qanday tayyor mahsulot ishlab
  chiqarish: qaysi xom ashyolar, qancha miqdorda, va kutilayotgan unum (yield),
  masalan "100 kg input → 96 kg output".

- **ProductionOrder** (ishlab chiqarish buyurtmasi) — bitta retsept ni ishga
  tushirish hodisasi. Uning ichida:
  - **Planned** consumption (resept × scale)
  - **Actual** consumption (operator nima tortdi)
  - **Planned** output (maqsad)
  - **Actual** output (chiziqdan nima chiqdi)
  - Farq — **yield variance**, ishlab chiqarish menejeri shu metrik bilan yashaydi.

- **SalesOrder** (sotuv buyurtmasi) — mijozga ma'lum tayyor partiyalarni biriktiradi
  (FIFO tavsiya qilinadi, lekin operator override qila oladi). Yetkazib berilganda
  shu partiyalar consumed qilinadi va **COGS** (Cost of Goods Sold) hisoblanadi.

### 4.2 Enum lar (toza ro'yxat)

```ts
enum UserRole {
  ADMIN              = 'ADMIN',
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER',
  WAREHOUSE_OPERATOR = 'WAREHOUSE_OPERATOR',
  SALES              = 'SALES',
  ACCOUNTANT         = 'ACCOUNTANT',
  VIEWER             = 'VIEWER',
}

enum ProductType { RAW_MATERIAL, FINISHED_GOOD, PACKAGING }
enum UnitOfMeasure { KG, G, L, ML, PIECE }

enum LotStatus {
  AVAILABLE,    // ishlatish/sotish mumkin
  QUARANTINE,   // qabul qilingan, lekin QC dan o'tmagan
  EXPIRED,      // muddati o'tdi, ishlatish mumkin emas
  DEPLETED,     // miqdori 0 ga tushdi
  WRITTEN_OFF,  // shikastlangan / scrap
}

enum StockMovementType {
  RECEIPT,            // PO dan qabul qilish
  PRODUCTION_INPUT,   // production order tomonidan iste'mol
  PRODUCTION_OUTPUT,  // production order tomonidan ishlab chiqarish
  SALE,               // mijozga jo'natish
  ADJUSTMENT,         // fizik hisob tuzatish (+ yoki -)
  WRITE_OFF,          // utilizatsiya
  TRANSFER_OUT,
  TRANSFER_IN,
}

enum ProductionOrderStatus { DRAFT, IN_PROGRESS, COMPLETED, CANCELLED }
enum PurchaseOrderStatus    { DRAFT, SUBMITTED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED }
enum SalesOrderStatus       { DRAFT, CONFIRMED, PICKED, DELIVERED, INVOICED, CANCELLED }
enum InvoiceStatus          { DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, VOID }
enum Currency               { UZS, USD }
```

### 4.3 Asosiy entitilar (qisqartirilgan)

Hammasini DOMAIN.md ga qarab to'liq yozing. Bu yerda eng muhim maydonlar.

**User**: `id, tenantId, email (tenant ichida unik), fullName, role, isActive, lastLoginAt`

**Warehouse**: `id, tenantId, code, name, type, isActive`

**Product**: `id, tenantId, sku, name, type, uom, shelfLifeDays?, category?, barcode?, isActive`

**Lot** (eng muhim entity — traceability + costing yuragi):
```ts
{
  id, tenantId,
  lotNumber,                 // tenant ichida unik
  productId, warehouseId,
  status: LotStatus,
  // miqdorlar (string — decimal.js)
  initialQuantity: string,   // yaratilganidan keyin o'zgarmaydi
  currentQuantity: string,   // movement lar bilan yangilanadi
  uom,
  // tannarx
  unitCost: string,
  currency,
  // sanalar
  productionDate?, expiryDate?, receivedAt?,
  // kelib chiqishi (faqat bittasi to'ldiriladi)
  source: 'PURCHASE' | 'PRODUCTION' | 'ADJUSTMENT',
  purchaseOrderLineId?,      // source == PURCHASE
  productionOrderId?,        // source == PRODUCTION
  // traceability
  parentLotIds: UUID[],      // tayyor mahsulotlar uchun
  supplierLotRef?, notes?,
}
```

**StockMovement** (append-only audit log):
```ts
{
  id, tenantId,
  type: StockMovementType,
  lotId, warehouseId,
  quantity: string,          // SIGNED: + qabul, - iste'mol
  uom, unitCost, totalCost,
  referenceType?, referenceId?,    // PO, PRD, SO id si
  reasonCode?,                     // ADJUSTMENT/WRITE_OFF uchun
  notes?,
  performedBy: UUID,
  performedAt: ISO8601,
}
```

> **Kritik invariant:**
> `Lot.currentQuantity == Lot.initialQuantity + sum(movements.quantity for that lot)`
> Movement lar **immutable**. Xato bo'lsa — yangi reverse movement yoziladi,
> hech qachon eski movement tahrirlanmaydi.

**ProductionOrder** (eng muhim ekranning entity si):
```ts
{
  id, tenantId, orderNumber,
  recipeId, recipeVersion,         // snapshot
  warehouseId,                     // ishlab chiqarish floor
  status: ProductionOrderStatus,
  // planned (resept × scale)
  plannedOutputQuantity, plannedOutputUom,
  // actual (operator to'ldiradi)
  actualOutputQuantity?,
  outputLotId?,                    // tugaganda yaratilgan tayyor partiya
  scheduledFor?, startedAt?, completedAt?,
  // costing summary (tugaganda hisoblanadi)
  totalInputCost?, unitOutputCost?, yieldPercent?,
  createdBy, completedBy?, notes?,
}
```

**ProductionOrderInput** (har bir ingredient uchun planned + actual):
```ts
{
  id, tenantId, productionOrderId,
  productId,
  plannedQuantity, plannedUom,
  actualQuantity?,
  consumedLots: Array<{
    lotId, quantity, unitCost,    // unitCost — iste'mol vaqtidagi snapshot
  }>,
  notes?,
}
```

### 4.4 Biznes qoidalari (invariants)

#### 4.4.1 Tenant izolatsiyasi (kelishilmaydi)
- Har bir API request JWT dan olingan `tenantId` ni o'z ichiga oladi.
- Har bir DB query `tenantId` bilan filter qiladi. **Istisnolar yo'q.**
- Cross-tenant murojaat **taqiqlangan**.

#### 4.4.2 Lot miqdor invarianti
- `Lot.currentQuantity == initialQuantity + sum(movements.quantity)`
- `currentQuantity >= 0` har doim. Manfiy qiymat keltiruvchi operatsiya **fail** bo'lishi kerak.
- `currentQuantity == 0` bo'lganda, status avtomatik `DEPLETED` ga o'tadi.

#### 4.4.3 Cost layering (FIFO)
- Lot dan iste'mol qilinganda, iste'mol shu lot ning `unitCost` ini meros oladi.
- Tayyor partiya yaratilganda, uning `unitCost` i:
  ```
  unitCost = sum(actual consumed cost across all inputs) / actualOutputQuantity
  ```
- Posted bo'lgan tannarx — **immutable**. Recosting uchun reversing entry kerak.

#### 4.4.4 FIFO consumption suggestion (taklifi)
- N kg X mahsulot kerak bo'lsa, tizim quyidagi tartibda lot lar tavsiya qiladi:
  1. `status == AVAILABLE`
  2. eng eski `expiryDate` birinchi
  3. keyin eng eski `receivedAt`
- Operator override qilishi mumkin — **override loglanadi** (notes ga yoziladi).

#### 4.4.5 Production order lifecycle

| Status        | Nima bo'ladi |
|---------------|--------------|
| `DRAFT`       | Tahrirlash mumkin. Ombor o'zgarmaydi. |
| `IN_PROGRESS` | Operator "Start" bosgandan keyin. Actual consumption progressively yoziladi. **Stock movement lar hali post qilinmaydi.** |
| `COMPLETED`   | Operator "Complete" bosadi. Atomically: (1) tekshirish (2) `PRODUCTION_INPUT` movement larni post qilish (3) yangi tayyor Lot yaratish (4) `PRODUCTION_OUTPUT` movement (5) yieldPercent va costlar hisoblash (6) status. |
| `CANCELLED`   | Faqat DRAFT yoki IN_PROGRESS dan. Stock o'zgarmaydi. |

#### 4.4.6 Sales order lifecycle

| Status      | Nima bo'ladi |
|-------------|--------------|
| `DRAFT`     | Tahrirlanadi, allocation yo'q. |
| `CONFIRMED` | Lot lar reserve qilinadi (soft-lock). currentQuantity hali o'zgarmaydi. |
| `PICKED`    | Ombor fizik yig'di. Hali movement yo'q. |
| `DELIVERED` | `SALE` movement lar post qilinadi. totalCogs va grossMargin hisoblanadi. |
| `INVOICED`  | Invoice yaratiladi. |

#### 4.4.7 Yaroqlilik muddati
- Kunlik background job `expiryDate < today` partiyalarni `EXPIRED` ga o'tkazadi.
- `EXPIRED` lot ni allocate yoki consume **qilib bo'lmaydi**, faqat `WRITE_OFF`.
- UI: 7/14/30 kun ichida tugaydigan partiyalar warning bilan ko'rsatiladi.

#### 4.4.8 Aniqlik (precision)
- **Pul:** 2 ta o'nlik
- **Miqdor:** 3 ta o'nlik
- **Yield %:** 2 ta o'nlik
- Hammasi JSON da **string** sifatida. Frontend da **`decimal.js`**. Hech qachon `number` emas.

### 4.5 Traceability qoidalari

- **Backward** (qayerdan keldi?) — tayyor lot dan boshlab `parentLotIds` ni
  rekursiv yuradi, har bir xom partiya, har bir yetkazib beruvchi, har bir qabul
  sanasini topib beradi.

- **Forward** (qayerga ketdi?) — xom lot dan boshlab uni iste'mol qilgan har bir
  production order, undan kelib chiqqan tayyor partiya, sotuv buyurtmasi,
  mijozni topadi.

Maqsad: 5 daraja chuqurlik uchun **< 1 sekund**.

---

## 5. API kontrakti

### 5.1 Konventsiyalar

- **Base URL:** `/api/v1`
- **Auth:** `POST /auth/login` JWT qaytaradi (`userId`, `tenantId`, `role` ichida).
  Boshqa hamma request `Authorization: Bearer <jwt>`. **Frontend `tenantId` ni
  hech qachon yubormaydi** — backend uni JWT dan oladi.
- **Content-Type:** `application/json; charset=utf-8`
- **Sanalar:** ISO 8601 timezone bilan (`2026-05-05T08:30:00+05:00`)
- **Decimallar:** **string** sifatida (`"100.500"`)
- **401** — token yo'q yoki noto'g'ri; **403** — rol yetishmaydi

### 5.2 Pagination

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1, "pageSize": 25,
    "totalItems": 134, "totalPages": 6
  }
}
```

Query parametrlar: `page` (1-indexed), `pageSize` (default 25, max 100).

### 5.3 Filtering va sorting

Common parametrlar:
- `q` — free-text search
- `sort` — `field:asc` yoki `field:desc` (masalan `sort=createdAt:desc`)
- Multi-value: vergul bilan (`status=AVAILABLE,QUARANTINE`)

### 5.4 Xato javobi (error response)

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

Xato kodlari:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) — masalan, dublikat SKU
- `BUSINESS_RULE_VIOLATION` (422) — masalan, EXPIRED lot ni iste'mol qilish
- `INTERNAL_ERROR` (500)

### 5.5 Endpoint lar (qisqartirilgan)

To'liq spetsifikatsiyani API.md dan ko'ring. Bu yerda eng muhimlari:

| Method | Path | Tavsifi |
|--------|------|---------|
| `POST` | `/auth/login` | JWT qaytaradi |
| `POST` | `/auth/logout` | 204 |
| `GET`  | `/auth/me` | Hozirgi foydalanuvchi |
| `GET`  | `/lots` | Lot grid (filter, sort, pagination) |
| `GET`  | `/lots/:id` | Bitta lot |
| `GET`  | `/lots/:id/movements` | Lot harakatlari |
| `GET`  | `/lots/:id/trace?direction=backward\|forward` | Traceability |
| `POST` | `/lots/:id/adjust` | Qo'lda tuzatish |
| `POST` | `/lots/:id/write-off` | Write-off |
| `GET`  | `/lots/expiring?withinDays=7` | Tugab borayotganlar |
| `GET`  | `/purchase-orders` | PO list |
| `GET`  | `/purchase-orders/:id` | PO detail (linelar bilan) |
| `POST` | `/purchase-orders` | Yangi PO |
| `POST` | `/purchase-orders/:id/submit` | DRAFT → SUBMITTED |
| `POST` | `/purchase-orders/:id/receive` | Goods receipt — Lot va movement larni atomic yaratadi |
| `GET`  | `/production-orders` | PRD list |
| `GET`  | `/production-orders/:id` | PRD detail |
| `POST` | `/production-orders` | DRAFT yaratadi (planned consumption ni hisoblaydi) |
| `POST` | `/production-orders/:id/start` | DRAFT → IN_PROGRESS |
| `PATCH`| `/production-orders/:id/inputs/:inputId` | Bitta ingredient uchun actual ni yozish (auto-save) |
| `GET`  | `/production-orders/:id/suggest-lots?productId=X&quantity=Y` | FIFO tavsif |
| `POST` | `/production-orders/:id/complete` | Atomic: validatsiya, movement post, output lot yaratish, status |
| `GET`  | `/sales-orders` | SO list |
| `POST` | `/sales-orders/:id/confirm` | Lot allocation (soft-lock) |
| `POST` | `/sales-orders/:id/deliver` | SALE movement, COGS, margin |
| `GET`  | `/reports/dashboard` | Dashboard aggregati |

### 5.6 Idempotency

`production-orders/:id/complete`, `sales-orders/:id/deliver` kabi kritik POST lar
`Idempotency-Key` header ni qabul qiladi. Replay original javobni qaytaradi.

---

## 6. Frontend arxitekturasi

### 6.1 Layer lar

```
┌─────────────────────────────────────┐
│         Pages (features/*)          │  Sahifa komponentlar
├─────────────────────────────────────┤
│    Hooks (useXxx)                   │  TanStack Query hooks
│    + RHF + Zod                      │
├─────────────────────────────────────┤
│    api/endpoints/*                  │  axios wrapperlar
├─────────────────────────────────────┤
│    contracts/* (TS types)           │  Domain tiplar
└─────────────────────────────────────┘
              ↕ HTTP
┌─────────────────────────────────────┐
│         MSW handlers                │  Mock backend
└─────────────────────────────────────┘
```

### 6.2 Asosiy printsiplar

1. **`useEffect` bilan fetch qilish — TAQIQLANGAN.** Faqat TanStack Query (`useQuery`/`useMutation`).
2. **Filter va pagination state — URL da.** Foydalanuvchi link share qila olsin.
3. **Pul/miqdor — `decimal.js`.** `parseFloat` taqiqlangan.
4. **Forma state — RHF.** State validation lar paytida yo'qolmasligi kerak.
5. **Komponent < 200 qator.** Kattalashsa — bo'lib tashlang.
6. **Prop drilling 2 darajadan ortmaydi.** Aks holda — context yoki composition.
7. **Sana — timezone-aware.** Seed `Asia/Tashkent` ishlatadi. UTC ga tushib qolmang.

---

## 7. Design tizimi (Design System)

### 7.1 Rang palitra (CSS variables)

```css
/* Brand */
--brand-500: #DC2626;   /* Asosiy meat-red */
--brand-600: #B91C1C;
--brand-700: #991B1B;

/* Slate (neytral) */
--slate-50:  #F8FAFC;   /* Background */
--slate-100: #F1F5F9;
--slate-200: #E2E8F0;   /* Border */
--slate-500: #64748B;   /* Muted text */
--slate-900: #0F172A;   /* Primary text */

/* Semantic */
--green-500: #10B981;   /* Success / Available */
--amber-500: #F59E0B;   /* Warning / In progress */
--red-500:   #EF4444;   /* Danger / Expired */
--blue-500:  #3B82F6;   /* Info / Quarantine / Confirmed */
--purple-500:#A855F7;   /* Picked / Wholesale */

/* Sidebar (dark) */
--side-bg:        #0B1220;
--side-bg-hover:  #131C30;
--side-active:    #1E2A47;
```

### 7.2 Typography

- **Font:** Inter (400/500/600/700/800)
- **Mono:** JetBrains Mono (lot raqamlari, SKU lar uchun)
- **Base size:** 14px
- **Heading:**
  - Page title: 24px / 700
  - Card title: 14.5px / 600
  - Stat value: 26px / 700

### 7.3 Spacing

- Card padding: `20px`
- Page padding: `28px 36px 60px`
- Card gap: `20px`
- Inline gap: `8/12/16/20px`

### 7.4 Radius

- Input/button: `8px`
- Card: `14px`
- Modal: `18px`

### 7.5 Komponent atomlari

Quyidagilarni shared/components ga chiqaring:

| Komponent | Vazifa |
|-----------|--------|
| `<AppShell>` | Sidebar + Topbar + page wrapper |
| `<Sidebar>`  | Navigatsiya, dark theme |
| `<Topbar>`   | Global search + notifications |
| `<PageHead>` | Breadcrumbs + title + sub + actions |
| `<StatusPill status="AVAILABLE" />` | Rangli status badge |
| `<ExpiryPill expiry="2026-05-10" />` | Yaroqlilik muddati indikatori |
| `<ProductCell name sku />` | Avatar + name + SKU |
| `<ProgressCell received ordered />` | Progress bar + foiz |
| `<Pagination page total />` | Pagination control |
| `<Chip active closable>` | Filter chip |
| `<Lifecycle steps current />` | Status stepper |
| `<Empty icon title message />` | Bo'sh holat |

### 7.6 Status pill rang xaritasi

Shu jadval `<StatusPill>` ichida saqlanadi:

| Status | Tone |
|--------|------|
| `AVAILABLE`, `COMPLETED`, `RECEIVED`, `DELIVERED`, `INVOICED` | green |
| `QUARANTINE`, `SUBMITTED`, `CONFIRMED`, `RETAIL` | blue |
| `IN_PROGRESS`, `PARTIALLY_RECEIVED`, `RESTAURANT` | amber |
| `EXPIRED`, `CANCELLED`, `ADMIN` | red |
| `DRAFT`, `DEPLETED`, `WRITTEN_OFF`, `DISTRIBUTOR`, `VIEWER` | slate |
| `PICKED`, `WHOLESALE`, `SALES` | purple |

### 7.7 Loading va empty holatlar

Har bir grid uchun majburiy:

- **Skeleton loading** — sahifa kelishida
- **Empty state** — filter natijasi bo'sh bo'lsa ("No lots match your filters.")
- **Error state** — API xato qaytarsa, retry tugmasi bilan

---

## 8. Routing strategiyasi

`react-router-dom` ishlatamiz. URL state birinchi darajali — har bir filter,
pagination URL da bo'lishi kerak.

### 8.1 Route lar ro'yxati

```
/login                          # Login
/                               # Dashboard
/inventory/lots                 # Lot grid
/inventory/lots/:id             # Lot detail (Overview)
/inventory/lots/:id/movements   # Lot detail — Movements tab
/inventory/lots/:id/trace       # Lot detail — Traceability tab
/inventory/expiring             # Expiring soon

/warehouses                     # Warehouse list
/products                       # Product list

/purchase/orders                # PO list
/purchase/orders/new            # PO create
/purchase/orders/:id            # PO detail (+ receive flow)

/production/orders              # Production list
/production/orders/new          # Production create
/production/orders/:id          # Production detail (mode by status)

/recipes                        # Recipe list
/recipes/new                    # Recipe create
/recipes/:id                    # Recipe detail (versioned)

/customers                      # Customer list
/customers/:id                  # Customer detail
/customers/new

/sales/orders
/sales/orders/new
/sales/orders/:id

/invoices
/invoices/:id

/reports                        # Reports menu
/reports/yield
/reports/inventory-valuation
/reports/sales-margin
/reports/expiry-aging
/reports/traceability
```

### 8.2 URL state pattern

Filterlar — query string da:

```
/inventory/lots?status=AVAILABLE,QUARANTINE&warehouseId=wh-001&q=BEEF&page=2&sort=expiryDate:asc
```

Custom hook yozing:

```ts
function useUrlFilters<T>(defaults: T): [T, (next: Partial<T>) => void] { ... }
```

### 8.3 Protected routes

`<ProtectedRoute>` wrapper:

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

---

## 9. Auth oqimi (login/logout)

### 9.1 Login

1. Foydalanuvchi `email` + `password` ni kiritadi.
2. `POST /auth/login` chaqiriladi.
3. Backend JWT + user ma'lumotlarini qaytaradi.
4. **JWT `localStorage` ga SAQLANMAYDI.** Faqat memory (`useState` yoki kontekst).
5. Refresh — sahifa ochilganda `GET /auth/me` orqali sessiyani tiklash.

### 9.2 Nima uchun localStorage emas?

- **XSS xavfi** — sahifaga injection bo'lsa, JS `localStorage` ga to'liq access oladi.
- **Httponly cookie** ishlatish ma'qul. Hozircha — memory + refresh.
- **Trade-off:** sahifa refresh bo'lsa, foydalanuvchi qayta login qilishi kerak,
  yoki refresh token oqimini implement qiling.

### 9.3 axios interceptor

```ts
api.interceptors.request.use(config => {
  const token = getTokenFromMemory();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) clearAuthAndRedirect();
    return Promise.reject(err);
  }
);
```

### 9.4 Demo foydalanuvchilar (seed dan)

| Email | Rol | Ism |
|-------|-----|-----|
| `admin@andijan-meat.uz` | ADMIN | Akmal Yusupov |
| `prod@andijan-meat.uz` | PRODUCTION_MANAGER | Botir Karimov |
| `warehouse@andijan-meat.uz` | WAREHOUSE_OPERATOR | Dilshod Rahimov |
| `sales@andijan-meat.uz` | SALES | Madina Tashpulatova |
| `accounting@andijan-meat.uz` | ACCOUNTANT | Nodira Saidova |

MSW da parol tekshirilmaydi (har qanday parol o'tadi).

---

## 10. Multi-tenant izolatsiya

### 10.1 Frontend qoidasi

- **Frontend `tenantId` ni hech qachon yubormaydi.**
- Backend uni JWT dan o'qib, har bir query ga avtomatik qo'shadi.

### 10.2 MSW da izolatsiya (mashq uchun)

Har bir handler shunday boshlanishi kerak:

```ts
import { extractTenantId } from '../auth';

export const lotsHandler = http.get('/api/v1/lots', ({ request }) => {
  const tenantId = extractTenantId(request);   // JWT dan
  if (!tenantId) return new Response(null, { status: 401 });

  const filtered = store.lots.filter(l => l.tenantId === tenantId);
  // ... keyingi filterlar
});
```

Bu real backendga o'rganish.

---

## 11. MSW (mock backend) sozlash

### 11.1 O'rnatish

```bash
npm install -D msw
npx msw init public/ --save
```

`public/mockServiceWorker.js` yaratiladi.

### 11.2 Strukturasi

```
src/mocks/
├── browser.ts          # MSW worker ni boshlash
├── seed.ts             # mock-data.json ni yuklash
├── store.ts            # in-memory CRUD store
└── handlers/
    ├── index.ts        # hammasini export
    ├── auth.ts
    ├── lots.ts
    ├── purchaseOrders.ts
    ├── productionOrders.ts
    ├── salesOrders.ts
    ├── reports.ts
    └── ...
```

### 11.3 `store.ts` shabloni

```ts
import seed from '../../brief/mock-data.json';

export const store = {
  users: structuredClone(seed.users),
  lots:  structuredClone(seed.lots),
  movements: structuredClone(seed.stockMovements),
  // ...

  // Helper
  filterByTenant<T extends { tenantId: string }>(arr: T[], tenantId: string): T[] {
    return arr.filter(x => x.tenantId === tenantId);
  },
};
```

### 11.4 Latency simulatsiyasi

Har bir handler:

```ts
import { delay } from 'msw';
async function withLatency() { await delay(200 + Math.random() * 200); }
```

Loading state larni majburiy mashq qilish uchun.

### 11.5 Error simulatsiyasi

URL toggle: `?simulate=fail-on-complete` — production order complete da xato qaytarish. Buni handler ichida read qiling.

---

## 12. TanStack Query bilan ishlash

### 12.1 Provider

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 12.2 Query key konventsiyasi

```ts
// To'g'ri:
['lots', { status, warehouseId, page, sort }]
['lots', id]
['lots', id, 'movements']
['production-orders', id]

// Noto'g'ri:
'lots'                    // string emas, tuple
{ key: 'lots' }           // object emas
```

### 12.3 Hook namunasi

```ts
export function useLotsQuery(filters: LotFilters) {
  return useQuery({
    queryKey: ['lots', filters],
    queryFn: () => api.lots.list(filters),
  });
}

export function useAdjustLotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.lots.adjust,
    onSuccess: (lot) => {
      qc.invalidateQueries({ queryKey: ['lots'] });
      qc.setQueryData(['lots', lot.id], lot);
    },
  });
}
```

### 12.4 Optimistic update

Production order da actual quantity yozish — auto-save:

```ts
useMutation({
  mutationFn: api.production.updateInput,
  onMutate: async (vars) => {
    await qc.cancelQueries({ queryKey: ['production-orders', vars.orderId] });
    const prev = qc.getQueryData(['production-orders', vars.orderId]);
    qc.setQueryData(['production-orders', vars.orderId], (old) => /* update */);
    return { prev };
  },
  onError: (err, vars, ctx) => {
    qc.setQueryData(['production-orders', vars.orderId], ctx.prev);  // rollback
  },
  onSettled: (data, err, vars) => {
    qc.invalidateQueries({ queryKey: ['production-orders', vars.orderId] });
  },
});
```

---

## 13. Forma va validatsiya (RHF + Zod)

### 13.1 Schema misol

```ts
import { z } from 'zod';
import Decimal from 'decimal.js';

const decimalString = (label: string) =>
  z.string().refine(v => {
    try { return new Decimal(v).gte(0); } catch { return false; }
  }, { message: `${label} musbat decimal bo'lishi kerak` });

export const ReceiveLineSchema = z.object({
  purchaseOrderLineId: z.string().uuid(),
  quantity: decimalString('Quantity'),
  unitCost: decimalString('Unit cost'),
  supplierLotRef: z.string().min(1, 'Supplier ref kerak'),
  productionDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
});

export const ReceiveSchema = z.object({
  receivedAt: z.string().datetime(),
  warehouseId: z.string().uuid(),
  lines: z.array(ReceiveLineSchema).min(1),
  notes: z.string().optional(),
});

export type ReceiveForm = z.infer<typeof ReceiveSchema>;
```

### 13.2 RHF setup

```tsx
const form = useForm<ReceiveForm>({
  resolver: zodResolver(ReceiveSchema),
  defaultValues: { lines: [] },
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'lines',
});
```

### 13.3 Cross-field validation

PO line uchun: `receivedQty <= orderedQty - alreadyReceivedQty`

```ts
ReceiveLineSchema.refine(
  (line, ctx) => {
    const max = parseFloat(ctx.parent.maxAllowed);
    return new Decimal(line.quantity).lte(max);
  },
  { message: "Qabul qilingan miqdor qoldiqdan ko'p bo'lmasligi kerak" }
);
```

### 13.4 Forma state ni saqlash

Submit xatosida forma o'chmasligi kerak. RHF default behavior — bu shart.
Lekin agar siz `reset()` chaqirsangiz, ehtiyot bo'ling.

---

## 14. Pul va miqdor matematika (decimal.js)

### 14.1 Helperlar

```ts
import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_EVEN });

export function dec(v: string | number): Decimal {
  return new Decimal(v);
}

export function money(amount: string, currency: 'UZS' | 'USD' = 'UZS'): string {
  const n = new Decimal(amount);
  if (currency === 'UZS') return `${n.toDecimalPlaces(0).toNumber().toLocaleString('en-US')} UZS`;
  return `$${n.toDecimalPlaces(2).toNumber().toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function qty(amount: string, uom: string): string {
  return `${new Decimal(amount).toFixed(3)} ${uom}`;
}

export function pct(amount: string): string {
  return `${new Decimal(amount).toFixed(2)}%`;
}

// Yield: actualOutput / sum(meat-input actualQuantities) × 100
export function calcYield(actualOutput: string, meatInputs: string[]): string {
  const total = meatInputs.reduce((s, x) => s.plus(x), new Decimal(0));
  if (total.eq(0)) return '0.00';
  return new Decimal(actualOutput).div(total).times(100).toFixed(2);
}

// Tannarx roll-up
export function calcUnitCost(consumedLots: { quantity: string; unitCost: string }[], outputQty: string): string {
  const totalCost = consumedLots.reduce(
    (s, l) => s.plus(new Decimal(l.quantity).times(l.unitCost)),
    new Decimal(0)
  );
  return totalCost.div(outputQty).toFixed(2);
}
```

### 14.2 Formatlash qoidalari

| Tip | Aniqlik | Format |
|-----|---------|--------|
| UZS | 0 ta o'nlik | `1,234,567 UZS` |
| USD | 2 ta o'nlik | `$1,234.56` |
| Quantity | 3 ta o'nlik | `100.000 KG` |
| Yield % | 2 ta o'nlik | `96.00%` |

### 14.3 Yield formulasi (muhim!)

```
yieldPercent = actualOutput / sum(actual mass of meat-type inputs) × 100
```

**Tuz va ziravorlar yield denominator ga KIRMAYDI** — ular massa emas, mazza.
Buni hisob-kitobda yodda tuting.

---

## 15. Sahifalar (har bir ekranni qurish)

Quyidagi har bir bo'limda: **Maqsad → Layout → Asosiy elementlar → API chaqiriqlari → Edge case lar.**

---

### 15.1 Login

**Maqsad:** Foydalanuvchi tenant ga kirishi.

**Layout:** Split — chap (hero, dark gradient) + o'ng (forma, oq fon).

**Elementlar:**
- Email input (default: `prod@andijan-meat.uz`)
- Password input
- "Remember device for 7 days" checkbox
- Submit tugma — `<Icon arrow_right /> Sign in`
- Demo accounts ro'yxati (har biri rol pill bilan)

**API:** `POST /auth/login` → JWT memory ga, `/dashboard` ga redirect.

**Edge case:**
- Xato login: forma ostida `field__error` ko'rsatish, forma tozalanmaydi
- Loading: tugma `disabled`, spinner

---

### 15.2 Dashboard

**Maqsad:** Bir qarashda korxona holati. ADMIN va PRODUCTION_MANAGER lar uchun bosh sahifa.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Greeting + Date  +   [Export] [+ New PRD]       │
├─────────────────────────────────────────────────┤
│ [Stat 1] [Stat 2] [Stat 3] [Stat 4]              │
├──────────────────────────────────┬──────────────┤
│ Production output (14d bar chart)│ Activity feed│
├──────────────────────────────────┼──────────────┤
│ Lots expiring this week          │ Active PRD   │
└──────────────────────────────────┴──────────────┘
```

**4 ta stat card:**
1. Stock-on-hand value (brand)
2. Lots expiring (7d) (amber)
3. Active production orders (green)
4. Outstanding AR (blue)

**Bar chart:** 14 kunlik production output, height = `(kg / max) * 130px`

**API:** `GET /reports/dashboard`, `GET /lots/expiring?withinDays=7`, `GET /production-orders?status=IN_PROGRESS,DRAFT`

**Edge:** Loading skeleton, agar 0 expiring — empty state.

---

### 15.3 Inventory — Lots Grid

**Maqsad:** Bu **ilovaning eng muhim ekrani**. Har bir partiya, har bir kg ko'rinadi.

**Elementlar:**
- Filter chip lar:
  - Status (All / Available / Quarantine / Expired)
  - Warehouse (All / CS-A / FG-A / PROD-1)
  - Toggle: "Has stock", "Expiring < 14d"
- Search bar (lotNumber, supplierLotRef)
- Tugmalar: Filters · 2 / Export CSV / Adjust stock

**Jadval ustunlari:**
| ☐ | Lot Number | Product | Warehouse | Status | Current Qty | Unit Cost | Expiry | Source | ⋮ |

**Vizual indikatorlar:**
- Days to expiry < 0 → qizil **EXPIRED** pill
- 0–7 kun → to'q sariq "expiring soon"
- 8–14 kun → sariq
- QUARANTINE → ko'k badge

**Hatti-harakat:**
- Row click → `/inventory/lots/:id`
- URL state: `?status=...&warehouseId=...&page=2&sort=expiryDate:asc`
- Server-side pagination + sort + filter
- Skeleton loading
- Empty state: "No lots match your filters."

**API:** `GET /lots?status=...&warehouseId=...&q=...&sort=...&page=...`

**Tuzoqlar:**
- `daysToExpiry` ni har render da hisoblamang — bir marta `useMemo` bilan
- Currency ni server javobidan **olmang** — har doim tenant default ni o'qing

---

### 15.4 Lot Detail

**Maqsad:** Bitta partiyaning to'liq holati: metadata, harakatlar, traceability.

**Header:**
- Lot number (mono font)
- Product name
- Status pill + Expiry pill yonma-yon
- Action tugmalar (rolga qarab): Print label / Adjust quantity / Write off

**Detail meta (4 ta):**
- Current Qty
- Initial Qty (soft)
- Unit Cost
- Total Value = currentQty × unitCost

**Tabs:**
1. **Overview** — barcha metadata + qoldiq progress bar
2. **Movements** — barcha StockMovement timeline tartibida
3. **Traceability** — backward tree (parent lots → recursively)

**Movements timeline elementi:**
```
[icon]  RECEIPT                         +100.000 KG
        2 May 2026, 08:00 · Dilshod R · Ref: PO-2026-0008    @ 65,000 UZS/KG
        Received from supplier, temp -2°C
```

**Movement tone xarita:**
| Type | Tone | Icon |
|------|------|------|
| RECEIPT | green | truck |
| PRODUCTION_INPUT | amber | minus |
| PRODUCTION_OUTPUT | green | plus |
| SALE | blue | cart |
| ADJUSTMENT | slate | edit |
| WRITE_OFF | red | trash |

**API:**
- `GET /lots/:id`
- `GET /lots/:id/movements`
- `GET /lots/:id/trace?direction=backward` (Traceability tab)

---

### 15.5 Expiring Soon

**Maqsad:** Yaroqlilik muddati tugayotgan partiyalarni guruhlab ko'rsatish.

**Layout:** 3 ta card (bucket):
1. Already expired (qizil pill)
2. 0–7 days (sariq)
3. 8–14 days (sariq)

Har bir card ichida jadval: Lot / Product / Warehouse / Qty / Value / Expiry.

**Action:** Bulk select → Write off selected.

**API:** `GET /lots/expiring?withinDays=14`

---

### 15.6 Purchase Orders (PO List)

**Layout:** filter chip lar + search + jadval + pagination.

**Ustunlar:** PO Number / Supplier / Status / Lines / Order Date / Expected / Total / ⋮

**API:** `GET /purchase-orders?status=...&supplierId=...&from=...&to=...`

---

### 15.7 PO Detail + Receive Goods

**Header:** Supplier nomi, status pill, dates.

**Detail meta:** Subtotal / Lines / Currency / Created by

**Order lines jadval:**
| Product | Ordered | Received | Progress | Unit Price | Line Total |

**Receive goods flow** (faqat status `SUBMITTED` yoki `PARTIALLY_RECEIVED` bo'lganda ko'rinadi):

Har bir ochiq line uchun forma:
- **Quantity received** (default = remainder, max = remainder)
- **Unit cost** (default = PO line price, tahrirlanadi)
- **Supplier lot ref** (matn)
- **Production date** (date)
- **Expiry date** — `productionDate + product.shelfLifeDays`
- **Warehouse** (select)

**Live tugma:** "Total received value" yangilanib turadi.

**Submit:** `POST /purchase-orders/:id/receive` → success toast → PO detail ga qaytish.

**Tuzoqlar:**
- Received qty > ordered qty bo'lmasligi kerak
- decimal.js, parseFloat emas
- Submit fail bo'lsa, forma state saqlanishi kerak

---

### 15.8 Production Orders List

**Ustunlar:** Order / Recipe / Status / Planned / Actual / Yield / Scheduled / Created by / ⋮

**Yield ustuni:** COMPLETED bo'lsa — green pill `96.0%`, aks holda `—`.

**Row click** → ProductionDetail (status ga qarab mode tanlanadi).

---

### 15.9 Production Order Detail (eng katta ekran — 3 mode)

#### 15.9.1 DRAFT mode

**Header:** Order #, recipe name, status pill, version pill.

**Detail meta:**
- Planned output (tahrirlanadigan)
- Expected yield (resept dan)
- Recipe scale (× factor)
- Created by

**Planned consumption jadval:** resept × scale ni live ko'rsatish (read-only).

**Asosiy tugma:** **"Start production"** → `POST /production-orders/:id/start`

#### 15.9.2 IN_PROGRESS mode (KILLER SCREEN)

Bu ilovaning eng murakkab UX si. Ehtiyotkorlik bilan quring.

**Header:**
- Order # + recipe + status + **elapsed time clock** (yashil pulsing dot bilan)
- Actions: Pause / Cancel / **Complete production**

**Detail meta:**
- Planned output
- Inputs consumed (kg, live)
- Running cost (UZS, live)
- Recipe code + version

**Asosiy layout (2 ustun):**

```
┌──────────────────────────────────┬─────────────────────┐
│ Ingredient consumption table     │ FIFO suggestions    │
│ ─ Beef Trim 80/20  [actual] ⓘ  │  Lot 1  [Use 14kg]  │
│ ─ Beef Fat                      │  Lot 2  [Use ...]   │
│ ─ Salt          [pending]       │                     │
│ ─ Black Pepper  [pending]       ├─────────────────────┤
│                                  │ Running totals      │
│                                  │  Inputs:    34 kg   │
│                                  │  Cost:    1.9M UZS  │
│                                  │  Proj. yield: ...   │
└──────────────────────────────────┴─────────────────────┘
```

**Har bir ingredient row:**
- Product name + SKU
- Planned: "42.500 kg"
- Actual input (`<input>` qutisi, KG suffix bilan)
- Variance chip (focused row da):
  - `<5%` → green "OK"
  - `5–10%` → amber "+7.2% vs plan"
  - `>10%` → red "+12% over plan"
- Consumed lot lar — chip lar (`BEEF-TRIM-2026-05-001 · 28kg`)
- Save indicator: green "Saved" yoki slate "Pending"

**Behavior:**
- Input ga focus → o'ng panelda **suggested lots** ochiladi
  (`GET /production-orders/:id/suggest-lots?productId=X&quantity=Y`)
- Operator value yozadi → **debounced auto-save** (500ms blur)
- `PATCH /production-orders/:id/inputs/:inputId` (optimistic + rollback)
- Operator override qilsa, notes ga "Override: lot Y instead of suggested X" yoziladi

**Suggest panel:**
- Sarlavha: `⚡ FIFO suggestions for BEEF-TRIM-80`
- "Need 14.500 kg more · sorted by oldest expiry"
- Har bir lot card:
  - Lot number + expiry pill
  - Available, Exp date, Warehouse
  - "Use 14.500 kg" tugma

**Cumulative card (right rail):**
- Inputs consumed
- Total input cost
- Projected output = `inputsConsumedMass × yieldPercent / 100`
- Projected unit cost
- Lot consumption progress barlari

**Complete production tugmasi modal ochadi:**
- Actual output qty (kg) — majburiy
- Output lot number (auto-suggest, tahrirlanadi)
- Expiry date (auto-suggest)
- Output warehouse (default FG-A)
- Live preview: yield %, unit output cost
- Submit → `POST /production-orders/:id/complete`

**Atomic operatsiya backend tomonida:**
1. Validate — har bir required input `actualQuantity` bor
2. Validate — `actualOutputQuantity > 0`
3. Post `PRODUCTION_INPUT` movement (signed minus)
4. Output Lot yaratish (rolled-up cost, parentLotIds)
5. Post `PRODUCTION_OUTPUT` movement (signed plus)
6. yieldPercent, totalInputCost, unitOutputCost ni saqlash
7. status = COMPLETED

#### 15.9.3 COMPLETED mode (read-only insights)

**3 ta katta stat card:**
- **Yield** (green) — `96.0%` + planned → actual
- **Cost** (brand) — `67,708 UZS / kg` + total input cost
- **Output lot** (blue) — clickable link

**Planned vs actual jadval:** har bir ingredient uchun planned, actual, variance chip, consumed lots, cost.

**Tugmalar:** Print / View movements / View traceability.

---

### 15.10 Sales Orders

**Ustunlar:** SO Number / Customer / Type / Status / Lines / Order date / Promised / Total / Margin / ⋮

**Margin ustuni:** Faqat DELIVERED status uchun ko'rinadi (`+235,000 UZS` green pill).
Boshqa statuslar uchun `—`.

---

### 15.11 Sales Order Detail (allocation)

**Header:** Customer + customer-type pill + status pill.

**Detail meta:** Subtotal / Tax (12%) / Total / Margin

**Layout (2 ustun):**

```
┌──────────────────────────────────┬─────────────────────┐
│ Order lines · allocation         │ FG lots panel       │
│ Product / Qty / Price / Allocated│ FIFO suggestions    │
│ MINCE  20kg  92,500  Lot fg-001  │  Lot fg-001 [Allocate]│
│                                  │  Lot fg-002 [...]   │
└──────────────────────────────────┴─────────────────────┘
```

**Lifecycle stepper:** DRAFT → CONFIRMED → PICKED → DELIVERED → INVOICED.

**Status bo'yicha actionlar:**
- DRAFT → Edit, Confirm
- CONFIRMED → Pick
- PICKED → Deliver (modal)
- DELIVERED → Invoice
- INVOICED → Record payment

**API:**
- `POST /sales-orders/:id/confirm` (FIFO allocation)
- `PATCH /sales-orders/:id/lines/:lineId` (manual override)
- `POST /sales-orders/:id/pick`
- `POST /sales-orders/:id/deliver`

**Tuzoq:** "Available stock" boshqa CONFIRMED orderlarga allocate qilinganidan
tashqari — `currentQuantity - sum(reservations)`.

---

### 15.12 Reports

**Layout:** 6 ta katta card (clickable):
1. Inventory valuation (brand)
2. Yield by recipe (green)
3. Expiry aging (amber)
4. Sales margin (blue)
5. Traceability (purple)
6. Accounts receivable (green)

**Pastida:** "Yield by recipe — last 30 days" jadval, recipe bo'yicha runs, planned, actual, avg yield, trend bar.

---

### 15.13 Traceability

**Filter card:** Lot select + Direction (Backward/Forward) + Depth.

**Tree view:** Tayyor lot dan boshlanadi, uning parent lot lari rekursiv ochiladi.
Har bir node clickable — drill down mumkin.

**Right rail:**
- Summary card: parent lots count, suppliers count, earliest receipt, total cost
- "Suppliers in this batch" ro'yxati (avatar + name + kg)

**API:** `GET /lots/:id/trace?direction=backward&depth=5`

---

### 15.14 Stub sahifalar

Quyidagilar hozircha standart CRUD list:
- **Warehouses** — code, name, type
- **Products** — sku, name, type, category, uom, shelf life
- **Recipes** — code, name, version, output, expected yield
- **Customers** — code, name, type, payment terms
- **Invoices** — invoice #, customer, sales order, dates, total, paid, outstanding, status

Har biri uchun: search bar + jadval + pagination + "Add" tugma.

---

## 16. Tayyor bo'lganini bilish (Definition of Done)

Har bir feature uchun:

1. ✅ TypeScript strict mode — 0 ta xato
2. ✅ ESLint o'tadi
3. ✅ Loading, empty, error state lar implement qilingan
4. ✅ Forma submit dan oldin validate qiladi va field-level errorlarni ko'rsatadi
5. ✅ MSW da 400ms latency bilan to'g'ri ishlaydi
6. ✅ Non-trivial logikalar (cost calc, FIFO, yield) test bilan qoplangan
7. ✅ Klaviatura accessibility:
   - Tab orqali yura olinadi
   - Esc modal yopadi
   - Focus ko'rinadi
   - Modal ichida focus trap
   - Modal yopilganda focus tiklash

---

## 17. Test strategiyasi

### 17.1 Unit testlar (Vitest)

Quyidagilar uchun **majburiy**:

```ts
describe('calcUnitCost', () => {
  it('rolls up multi-lot consumption', () => {
    expect(calcUnitCost([
      { quantity: '60.000', unitCost: '65000.00' },
      { quantity: '12.000', unitCost: '32000.00' },
    ], '72.000')).toBe('59500.00');
  });
});

describe('calcYield', () => {
  it('excludes spices from denominator', () => {
    // 72 / (60 + 12) * 100 = 100 emas — yield 100% bo'lmaydi
    // chunki actualOutput = 96 kg, meat input = 100 kg
    expect(calcYield('96.000', ['85.000', '15.000'])).toBe('96.00');
  });
});

describe('FIFO suggestion', () => {
  it('orders by expiry date asc', () => {
    const lots = [
      { id: 'a', expiryDate: '2026-05-15', currentQuantity: '50' },
      { id: 'b', expiryDate: '2026-05-10', currentQuantity: '50' },
    ];
    expect(suggestFIFO(lots, '30')).toEqual([{ lotId: 'b', useQuantity: '30' }]);
  });
});
```

### 17.2 Component testlar (RTL)

Critical UX uchun:

```tsx
test('production order Complete button is disabled until all required inputs are set', () => {
  render(<InProgressMode order={partiallyFilledOrder} />);
  expect(screen.getByRole('button', { name: /Complete production/i })).toBeDisabled();
});
```

### 17.3 Coverage maqsad

- 80%+ overall
- 100% — money/qty/yield helper lari
- Mute ishtirok etadigan flow lar — happy path + 1 edge case

---

## 18. Bosqichma-bosqich reja (5 phase)

### Phase 0 — Foundation (1 hafta)

- [ ] Repo skeleton (folder structure)
- [ ] Vite + TypeScript + ESLint + Prettier
- [ ] `npm run dev / build / test / lint` ishlaydi
- [ ] MSW handler lari + seed yuklash
- [ ] `/login` — email/password (parol tekshirilmaydi)
- [ ] JWT memory ga (localStorage emas)
- [ ] `/` — Welcome message + tenant nomi
- [ ] Logout
- [ ] Hamma TypeScript turi `contracts/` da

**Acceptance:**
```
npm install && npm run dev
```
→ `prod@andijan-meat.uz` bilan login → "Welcome, Botir Karimov" → logout

### Phase 1 — Inventory Grid + Lot Detail (2 hafta)

- [ ] `/inventory/lots` — TanStack Table + URL state + filterlar
- [ ] Visual indicators (expiry, status)
- [ ] `/inventory/lots/:id` — header + tabs (Overview, Movements, Traceability)
- [ ] Adjust / Write-off modallari
- [ ] `/inventory/expiring` — bucketed list

### Phase 2 — Receiving Goods (1.5 hafta)

- [ ] `/purchase/orders` — list
- [ ] `/purchase/orders/:id` — detail
- [ ] Receive goods flow (multi-line forma, RHF + useFieldArray)
- [ ] `/purchase/orders/new` — yangi PO

### Phase 3 — Production Order screen (3 hafta — eng qiyini)

- [ ] `/production/orders` — list
- [ ] `/production/orders/new` — DRAFT yaratish + planned consumption preview
- [ ] DRAFT mode — Start tugma
- [ ] IN_PROGRESS mode — input table, suggest panel, auto-save, variance, cumulative card
- [ ] Complete modal
- [ ] COMPLETED mode — yield/cost/output stats
- [ ] `/recipes` CRUD (versionable)

### Phase 4 — Sales (2 hafta)

- [ ] `/customers` CRUD
- [ ] `/sales/orders` list + create
- [ ] Confirm flow (allocation override panel)
- [ ] Pick / Deliver / Invoice / Payment

### Phase 5 — Reports & Polish (1.5 hafta)

- [ ] Dashboard (`/`)
- [ ] `/reports/yield`
- [ ] `/reports/inventory-valuation`
- [ ] `/reports/traceability` (clickable graph)
- [ ] Accessibility pass
- [ ] Empty/error/loading consistency

---

## 19. Tez-tez uchraydigan xatolar (Pitfallar)

### 19.1 Tannarx hisobi

❌ **Noto'g'ri:** Hozirgi qoldiq lot ning unitCost ini olish.
✅ **To'g'ri:** Iste'mol momentidagi snapshotni `consumedLots` ichida saqlash.

### 19.2 Yield denominatori

❌ **Noto'g'ri:** Hamma input larni qo'shish.
✅ **To'g'ri:** Faqat `Beef`, `Pork`, `Lamb` kategoriyalarini. Salt, pepper kirmaydi.

### 19.3 Stock movement timing

❌ **Noto'g'ri:** DRAFT/IN_PROGRESS state da movement post qilish.
✅ **To'g'ri:** Faqat `COMPLETED` ga o'tishida atomic.

### 19.4 Sales order sale movement

❌ **Noto'g'ri:** CONFIRM da `SALE` movement.
✅ **To'g'ri:** Faqat `DELIVER` da.

### 19.5 Filter state

❌ **Noto'g'ri:** Faqat `useState` ichida.
✅ **To'g'ri:** URL search params da. Foydalanuvchi link share qila olsin.

### 19.6 `parseFloat` ishlatish

❌ **TAQIQLANGAN.** Qiymatlar string sifatida keladi, `decimal.js` orqali parse qiling.

### 19.7 `useEffect` orqali fetch

❌ **TAQIQLANGAN.** Faqat TanStack Query.

### 19.8 Komponent kattaligi

200 qatordan oshmasin. Production IN_PROGRESS mode juda osongina 500 qator bo'ladi
— uni `<InputRow>`, `<LotSuggestPanel>`, `<CumulativeCard>` ga bo'ling.

### 19.9 Race condition (auto-save)

Ikki marta tez yozsangiz, eski value yangidan keyin saqlanib qolishi mumkin.
Yechim: har input row uchun **single mutation queue**. Avvalgisi tugamasdan
keyingisi boshlanmasin yoki keyingi avvalgisini cancel qilsin.

### 19.10 EXPIRED lot ni ishlatish

Allocate yoki consume qilish — `BUSINESS_RULE_VIOLATION`. UI da bu lotlarni
disable qiling, suggest panel ga chiqarmang.

---

## 20. Foydali komandalar va tezkor referans

### 20.1 npm script lar

```bash
npm install              # bog'liqliklarni o'rnatish
npm run dev              # Vite dev server
npm run build            # production build
npm run preview          # build ni preview qilish
npm run lint             # ESLint
npm run test             # Vitest
npm run test -- --watch  # watch mode
```

### 20.2 Tezkor formulalar

```
yieldPercent     = actualOutput / sum(meat actual inputs) × 100
unitOutputCost   = sum(consumedQty × consumedUnitCost) / actualOutputQuantity
totalValue       = currentQuantity × unitCost
daysToExpiry     = (expiryDate - today) / 86400000  → Math.ceil
margin           = totalAmount - totalCogs
availableStock   = currentQuantity - sum(reservations on CONFIRMED)
```

### 20.3 Status tarjima

| EN | UZ |
|----|----|
| Available | Mavjud |
| Quarantine | Karantin |
| Expired | Muddati o'tgan |
| Depleted | Tugagan |
| Written off | Hisobdan chiqarilgan |
| Draft | Qoralama |
| In progress | Jarayonda |
| Completed | Tugallangan |
| Submitted | Yuborilgan |
| Partial | Qisman |
| Confirmed | Tasdiqlangan |
| Picked | Yig'ilgan |
| Delivered | Yetkazilgan |
| Invoiced | Hisob-fakturalangan |

> **Default UI tili:** Inglizcha (brif shunday belgilagan). i18n stretch maqsad —
> ru / uz / en.

### 20.4 Tezkor seed ma'lumotlar

| Element | Qiymat |
|---------|--------|
| Tenant | Andijan Meat Co (`t-andijan-001`) |
| Foydalanuvchilar | 5 ta (har rol uchun bittadan) |
| Omborlar | 4 ta — CS-A, PROD-1, FG-A, SHIP |
| Mahsulotlar | 11 ta (8 raw + 3 finished good) |
| Lot lar | 8 ta (7 raw + 1 finished) |
| Yetkazib beruvchilar | 3 ta — Sultanov Xojadod, Andijan Beef Farm, Tashkent Spice Co |
| Mijozlar | 4 ta — Korzinka, Makro, Plov Center, Fergana Distributors |
| Production orders | 3 ta — bittadan har status (DRAFT, IN_PROGRESS, COMPLETED) |
| Sales orders | 4 ta — turli status |
| Recipes | 2 ta — Mince 80/20 va Lula Kebab |

### 20.5 Brendning ranglari

```
Asosiy brend:    #DC2626 (meat-red)
Sidebar:         #0B1220 (deep navy)
Background:      #F8FAFC (almost white)
Text:            #0F172A (slate-900)
Muted:           #64748B (slate-500)
Border:          #E2E8F0 (slate-200)
```

---

## 21. Yakuniy maslahat

1. **Brifni 3 marta o'qing.** Birinchisida — umumiy. Ikkinchisida — domain.
   Uchinchisida — har bir entity ichidagi maydonlar.
2. **`mock-data.json` ni JSON viewer da oching va bitta to'liq oqimni ko'zlar
   bilan kuzatib chiqing:** PO → goods receipt → lots → production order →
   finished lot → sales order → invoice → payment.
3. **Phase 0 ni yaxshilab quring.** Folder structure, contracts, MSW skeleton —
   keyingi hammasi shularga tayanib quriladi.
4. **Birinchi 3 hafta — sekin.** Tezlikdan ko'ra intizom va testlar muhim.
5. **30 daqiqadan ko'p stuck bo'lsangiz** — mentor ga yozing. Bir kun yo'qotmang.
6. **Drift checking:** Har hafta `tsc --noEmit` to'liq toza bo'lishi shart.

---

**Omad. Bu loyiha 3 oy davomida sizga real ERP qurish, real domain bilan ishlash,
real intizom bilan kod yozishni o'rgatadi. Tezlik emas — chuqurlik.**

— Hujjat versiyasi: 1.0 · 2026-05-05
