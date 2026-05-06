# Course project — Meat Processing ERP (frontend)

Welcome. This is the brief for the project you'll build over the coming months.
Read it once end-to-end before you write any code. The goal isn't to ship features
fast — it's to **build something real, with real domain complexity, the way
software is built in industry**: contract-first, type-safe, multi-tenant, testable.

You will build the **frontend** of a multi-tenant ERP for a meat processing factory.
You'll work against a mock backend (MSW + the seed data we provide) so you can ship
end-to-end UX without waiting for the API. When the real backend lands later, your
code should keep working with at most a configuration change.

---

## What you're building (in one paragraph)

A small meat processing company in Andijan receives raw materials (beef, pork, lamb,
spices, packaging) from suppliers, grinds and seasons and packages them into finished
products like beef mince and lula kebab, and sells those finished products to retailers,
wholesalers, and restaurants. Every kilo of raw material has a cost; every kilo of
finished product has a *rolled-up* cost based on the lots it was made from. The owner
needs to know what stock they have, what's about to expire, what each finished batch
cost to make, who they sold it to, and how much profit they made. Your job is to build
the UI that makes all of that flow.

---

## What's provided

Three companion documents:

- **`DOMAIN.md`** — the entities, enums, and business rules. The ground truth.
- **`API.md`** — every REST endpoint with request/response shapes.
- **`mock-data.json`** — a coherent seed dataset (1 tenant, 5 users, 8 lots, 3 production
  orders in different states, sales orders, invoices, payments). All quantities and
  movements reconcile. Use this as the basis for your mock backend.

Read `DOMAIN.md` first. Then `API.md`. Then open `mock-data.json` and trace one full
flow with your eyes: PO → goods receipt → lots → production order → finished lot →
sales order → invoice → payment.

---

## Tech stack (non-negotiable)

- **React 18 + TypeScript** (strict mode, no `any` without a comment justifying it)
- **Vite** as the build tool
- **TanStack Query** for server state (`@tanstack/react-query`)
- **TanStack Table v8** for data grids (`@tanstack/react-table`)
- **MUI v6** for components and theming
- **React Hook Form** + **Zod** for forms and validation
- **MSW** (Mock Service Worker) for the mock backend
- **decimal.js** for all money and quantity math — never use `number` for these
- **date-fns** for date math
- **Vitest + React Testing Library** for tests
- **ESLint + Prettier** with strict rules

We chose this stack because it's exactly what the MGK ELD frontend uses. Treat this
project as practice for shipping inside a real React/TS monorepo.

---

## Project structure (you'll set this up in Phase 0)

```
meat-erp-frontend/
├── src/
│   ├── api/                  # API client wrappers
│   │   ├── client.ts         # axios instance with auth interceptor
│   │   └── endpoints/        # one file per resource
│   ├── contracts/            # TypeScript types matching DOMAIN.md
│   │   ├── enums.ts
│   │   ├── entities.ts
│   │   └── api-payloads.ts
│   ├── mocks/                # MSW handlers + seed loading
│   │   ├── handlers/
│   │   ├── store.ts          # in-memory data store
│   │   └── seed.ts
│   ├── features/             # one folder per domain area
│   │   ├── auth/
│   │   ├── inventory/
│   │   ├── purchase/
│   │   ├── production/
│   │   ├── sales/
│   │   └── reports/
│   ├── shared/               # cross-cutting components
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── routes/               # route definitions
│   ├── theme/                # MUI theme
│   └── App.tsx
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The `contracts/` folder is sacred. It's the TypeScript expression of `DOMAIN.md` and
`API.md`. When the real backend lands, this folder either matches or you've found a bug.

---

## How we work

### Branch and PR discipline
- One branch per phase, named like `phase-2-inventory`.
- Open a draft PR on day 1 of each phase so I can comment as you go.
- Each PR description must list: what's done, what's not, what you're unsure about.
- I'll review at the end of each phase. Don't merge until I approve.

### Commits
- Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`).
- Small commits. If a commit message needs "and" in it, it's two commits.

### Definition of done (every feature)
1. TypeScript compiles in strict mode with no errors.
2. ESLint passes.
3. Loading, empty, and error states are designed and implemented (don't skip these).
4. Forms validate before submission and show field-level errors.
5. The feature works correctly with simulated 400ms latency in MSW.
6. Tests cover the non-trivial logic (cost calculations, FIFO suggestion, etc.).
7. The feature is keyboard-accessible (can tab through, escape closes modals,
   focus is visible). WCAG basics — this matters. ERP users live on the keyboard.

---

## Phases

The project is split into five phases. Each ends with a working, demoable slice.
Don't skip ahead. Each phase teaches you something the next one assumes.

---

### Phase 0 — Foundation (1 week)

Goal: a project skeleton that can compile, lint, test, and serve a "Hello world"
page protected by a working login flow against MSW.

**Deliverables:**
- Repo set up with the structure above.
- `npm run dev`, `npm run build`, `npm run test`, `npm run lint` all work.
- MSW intercepts requests and serves from the seed data.
- `/login` page with email + password (use seed users — passwords don't need to be real).
- After login, JWT stored in memory (NOT localStorage; we'll discuss why).
- A protected `/` route that shows the logged-in user's name and tenant name.
- Sign out button that clears auth and redirects to login.
- All entity TypeScript types in `contracts/` matching `DOMAIN.md` exactly.

**Acceptance:**
- I can clone the repo, run `npm install && npm run dev`, log in as
  `prod@andijan-meat.uz`, see "Welcome, Botir Karimov" on the home page, log out.
- `tsc --noEmit` passes.

---

### Phase 1 — Inventory Grid + Lot Detail (2 weeks)

Goal: the central inventory view. The most important screen in the app.

**Deliverables:**

1. **`/inventory/lots` — Lot grid (the killer screen)**
   - TanStack Table with columns: Lot Number, Product, Warehouse, Status,
     Current Qty, UOM, Unit Cost, Expiry, Days to Expiry, Source.
   - Server-side pagination, sorting, filtering (don't fetch everything).
   - Filter sidebar: product type, warehouse, status (multi-select), expiry range,
     "has stock" toggle.
   - Free-text search bar (matches lotNumber and supplierLotRef).
   - Visual indicators:
     - Days to expiry < 0: red "EXPIRED" pill.
     - 0–7 days: orange "Expiring soon".
     - 8–14 days: yellow.
     - QUARANTINE status: blue badge.
   - Row click → navigate to `/inventory/lots/:id`.
   - URL state: filters and pagination must be in the URL so a user can share a link.
   - Empty state: "No lots match your filters."
   - Skeleton loading state.

2. **`/inventory/lots/:id` — Lot detail page**
   - Header: lot number, product name, status pill, current qty, unit cost.
   - Tabs:
     - **Overview**: all metadata (production date, expiry, supplier ref, parent lots if any).
     - **Movements**: timeline of all stock movements for this lot (oldest first).
       Show: date, type (with icon), signed quantity, who performed it, reference
       (link to the PO/PRD/SO that caused it).
     - **Traceability**: backward tree view (`/lots/:id/trace?direction=backward`).
       For finished-goods lots: show parent raw lots recursively. Each node clickable.
   - Actions in header (visible based on role):
     - "Adjust quantity" → modal with form (signed delta + reason code + notes).
     - "Write off" → modal.

3. **`/inventory/expiring` — Expiring soon dashboard widget + page**
   - Calls `GET /lots/expiring?withinDays=7`.
   - Simple list grouped by days-to-expiry bucket.

**Stretch (do if time):**
- Bulk select rows in the grid → bulk write-off modal.
- Export current filtered view to CSV.

**What you're learning:**
Server-driven tables (don't fetch the whole list — paginate and filter on the server).
URL-as-state. Detail pages with tabs. Optimistic UI for adjustments.

**Common traps to avoid:**
- Don't store filter state only in component state. Use the URL.
- Don't compute "days to expiry" on every render — derive once per row.
- Don't trust server-supplied currency in formatting — always read tenant default.

---

### Phase 2 — Receiving Goods (1.5 weeks)

Goal: turn supplier deliveries into lots in the system.

**Deliverables:**

1. **`/purchase/orders` — PO list**
   - Grid: PO number, supplier, status, expected date, total, # lines.
   - Status filter, supplier filter, date range filter.

2. **`/purchase/orders/:id` — PO detail**
   - Header with status, supplier, dates, total.
   - Lines table: product, ordered qty, received qty (with progress bar),
     unit price, line total.
   - Action button: **"Receive goods"** (only visible if status is SUBMITTED or
     PARTIALLY_RECEIVED).

3. **Receive goods flow (the meatiest form in this phase)**
   - Modal or dedicated page (your call — argue your choice in the PR).
   - For each PO line that still has `orderedQty > receivedQty`:
     - Quantity received (default = remainder, editable, must be ≤ remainder)
     - Unit cost (default = PO unit price, editable — operator can adjust if invoice differs)
     - Supplier lot reference (text)
     - Production date (date picker)
     - Expiry date (date picker — auto-suggest based on `product.shelfLifeDays` from production date)
   - The operator may be receiving a partial PO — handle "leave for later" properly.
   - Show "Total received value" live as the form fills.
   - On submit: `POST /purchase-orders/:id/receive` → success toast → navigate back
     to PO detail with new state.

4. **`/purchase/orders/new` — Create PO**
   - Header: supplier (autocomplete), warehouse (select), expected date.
   - Lines: product autocomplete, ordered qty, unit price.
     - When you pick a product, auto-fill the UOM.
   - Live total calculation.
   - Save as draft, or submit immediately.

**What you're learning:**
Multi-line forms with React Hook Form `useFieldArray`. Form state that depends on
fetched data (the PO lines). Optimistic + rollback updates.

**Common traps:**
- Don't let received qty exceed ordered qty (validate).
- All decimal math goes through decimal.js. Never `parseFloat`.
- A failed `/receive` mutation must restore the form state, not lose the user's input.

---

### Phase 3 — Production Order screen (3 weeks — the hardest)

Goal: the screen the production manager actually uses every day. This is the
single most important screen in the app and where you'll learn the most.

**Deliverables:**

1. **`/production/orders` — Production order list**
   - Grid with status pill, planned vs actual output, yield %, recipe name.

2. **`/production/orders/new` — Create production order**
   - Form: recipe (autocomplete), planned output qty, target warehouse, scheduled date.
   - When the recipe and quantity are picked, **show a live preview** of the planned
     consumption (recipe ingredient quantities × scale factor). This is read-only.
   - Submit creates a DRAFT.

3. **`/production/orders/:id` — Production order screen (THE killer screen)**

   The UX changes by status. Three modes:

   **DRAFT mode:**
   - Header: order number, recipe name, status, planned output (editable).
   - Inputs table: product, planned quantity, planned UOM (read-only).
   - Big primary action: **"Start production"** → confirms → status IN_PROGRESS.
   - Edit/delete buttons.

   **IN_PROGRESS mode (the hardest UX):**
   - Header: order number, recipe, started time, **elapsed time clock**.
   - Inputs table — for each ingredient row:
     - Planned quantity (read-only)
     - **Actual quantity input** (operator types or scans)
     - When focused, side panel opens showing **suggested lots**
       (`GET /production-orders/:id/suggest-lots?productId=X&quantity=Y`):
       - Lot number, available qty, expiry date, unit cost.
       - "Use" button per row.
       - Pre-fills `consumedLots` for the input.
     - Save indicator (debounced auto-save via PATCH on each input).
   - **Variance indicator**: if actual differs from planned by more than 5%, show a
     warning chip ("⚠ +12% over plan").
   - Cumulative summary card on the right:
     - Total mass of inputs consumed so far
     - Total cost so far
     - Lots being consumed (with mini bar showing % used per lot)
   - Bottom action: **"Complete production"** opens a modal:
     - Required: actual output qty (kg)
     - Output lot number (auto-suggested, editable)
     - Expiry date (auto from product.shelfLifeDays)
     - Output warehouse (default the production warehouse, but typically operator
       changes to FG warehouse — pre-select FG-A from seed)
     - Live preview of yield % and unit output cost
     - Submit → `POST /production-orders/:id/complete`.

   **COMPLETED mode (read-only with insights):**
   - Header: status, completion time, completed by.
   - Three cards:
     - **Yield**: planned X kg → actual Y kg (Z% yield)
     - **Cost**: total input cost / unit output cost
     - **Output**: link to the finished lot it created
   - Inputs table showing planned vs actual with variance highlighted.
   - Link to view stock movements created by this order.
   - "View traceability" button → opens forward-trace view of the output lot.

4. **Recipe management — `/recipes`, `/recipes/:id`, `/recipes/new`**
   - Standard CRUD. Recipe form is a multi-line form with ingredient rows.
   - Editing creates a new version (don't mutate published recipes).

**What you're learning:**
- Forms that change shape based on entity state (DRAFT/IN_PROGRESS/COMPLETED).
- Debounced auto-save with optimistic updates.
- Live derived values (yield %, cost) computed on the client during data entry.
- Domain-driven UI: the screen mirrors how the production manager actually thinks.

**Common traps:**
- Don't post stock movements until completion. The DRAFT and IN_PROGRESS states
  hold operator input but DO NOT change inventory yet.
- The yield calculation: `actualOutput / sum(actualInputs of meat-type ingredients)`.
  Spices and salt don't count toward yield denominator (they're seasoning, not mass input).
- When the operator overrides the lot suggestion, log the override in `notes`.
- Auto-save means you'll have race conditions. Use a single mutation queue per input row.

---

### Phase 4 — Sales (2 weeks)

Goal: get finished goods out the door, invoice the customer, get paid.

**Deliverables:**

1. **`/customers`, `/customers/:id`, `/customers/new`** — standard CRUD.

2. **`/sales/orders` — sales order list** (grid + filters).

3. **`/sales/orders/new` — create sales order**
   - Customer autocomplete. When picked, auto-load their price list.
   - Lines: product autocomplete (FINISHED_GOOD only). Auto-fill price from the
     customer's price list. Quantity input.
   - Live: subtotal, tax (12% UZS), total.
   - Live: **stock availability per line** (red if not enough finished-goods stock).
   - Save as DRAFT.

4. **Sales order detail** — actions per status:
   - DRAFT: edit, confirm.
   - **Confirm flow**: when the user clicks "Confirm", the system suggests FIFO
     lot allocations per line (call the suggest endpoint). Show a side panel
     where the user can either accept the suggestion or manually override which
     lots to allocate. On submit: status → CONFIRMED, lots are reserved.
   - CONFIRMED: pick.
   - PICKED: deliver (modal with delivered date, notes). On deliver, COGS and
     gross margin become visible.
   - DELIVERED: invoice (auto-create or via "Generate invoice" button).
   - INVOICED: record payment.

5. **`/invoices` and `/invoices/:id`**
   - List with status filter, customer filter, overdue filter.
   - Detail: outstanding amount, payment history, "Record payment" action.

**What you're learning:**
- Cross-feature data flow: sales order pricing depends on customer's price list.
- Live stock availability: how to query inventory while the user types quantities.
- State machines in the UI (sales order has 6 statuses with allowed transitions).

**Common traps:**
- "Available stock" must subtract qty already allocated to other CONFIRMED orders,
  not just look at currentQuantity.
- Don't post SALE movements on confirm — only on deliver.
- Margin in the UI is not real until DELIVERED. Show "—" before then, not zero.

---

### Phase 5 — Reports & Polish (1.5 weeks)

Goal: dashboards, traceability, accessibility pass.

**Deliverables:**

1. **`/` — Dashboard**
   - Calls `GET /reports/dashboard`.
   - Cards: stock-on-hand value, lots expiring soon, active production orders,
     today's production output, outstanding AR.
   - Chart: last 30 days of production output (use Recharts).
   - "Lots expiring this week" widget (clickable rows).

2. **`/reports/yield`** — yield report by recipe and date range.

3. **`/reports/inventory-valuation`** — valuation by warehouse and product type.

4. **`/reports/traceability`** — pick a lot (autocomplete), pick direction (backward
   or forward), show the tree as a clickable graph. This is the "if there's a
   recall, what do we do" screen.

5. **Accessibility pass:**
   - All interactive elements keyboard-reachable.
   - All form inputs have associated labels.
   - Color is not the only signal (status badges have text + color + sometimes icon).
   - All modals trap focus and restore it on close.
   - All data tables have `<caption>` or aria-label.

6. **Polish:**
   - Consistent empty states across the app.
   - Consistent error toast styling.
   - Loading skeletons feel snappy (don't show after < 200ms).

---

## Things I'll be looking for in code review

These are deal-breakers — fix them before asking for review:

1. **Tenant isolation in MSW**: every handler filters by tenantId from the JWT.
   This trains you for the real backend.
2. **No `any` without justification**. None.
3. **No `parseFloat` or arithmetic on string-typed decimals**. Use decimal.js.
4. **No `localStorage` for the JWT** (we'll discuss).
5. **No `useEffect` for fetching data**. Always TanStack Query.
6. **No prop drilling beyond two levels**. Use context or composition.
7. **Forms don't lose state on validation errors**.
8. **Dates are timezone-aware**. The seed uses Asia/Tashkent. Don't accidentally
   render in UTC.
9. **Components under 200 lines**. If yours is bigger, split it.
10. **Tests for non-trivial logic**. Cost calculations, FIFO suggestions, yield math —
    these have unit tests, no exceptions.

---

## Stretch goals (after Phase 5, if you have time)

- Replace MSW with a real NestJS backend (you build it; this is the next project).
- Real-time updates: when the production screen is open and someone else updates an
  input, the UI reflects it (polling is fine; websockets is bonus).
- Mobile-friendly production order screen (operators use tablets).
- Telegram notifications for expiring lots (you call a webhook from MSW; later, real bot).
- Internationalization: ru/uz/en. The current MGK ELD frontend already does this —
  ask me for the pattern.
- PostgreSQL Row-Level Security as the tenant isolation mechanism (in the backend phase).

---

## How to ask questions

- For domain or business-rule questions: open a discussion in the repo. Don't guess.
- For "is this approach OK" questions: open a draft PR and tag me.
- For "I'm stuck for more than 30 minutes": ping me. Don't burn a day stuck.
- Read the existing seed data when in doubt — it's designed to demonstrate every flow.

You're going to make this app real over the next ~3 months. Take your time with each
phase. The goal is depth and discipline, not speed. The frontend you build here will
be the template for several real products you'll work on later.

Welcome aboard. Let's get started with Phase 0.
