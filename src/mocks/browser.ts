import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { productionHandlers } from "./productionHandlers";
import { reportsHandlers } from "./reportsHandlers";
import { salesHandlers } from "./salesHandlers";

// Stateful handlers are spread first so their routes shadow the read-only
// routes in handlers.ts (first match wins in MSW). Sales/production/reports
// live in disjoint namespaces, so their relative order does not matter.
export const worker = setupWorker(
  ...salesHandlers,
  ...productionHandlers,
  ...reportsHandlers,
  ...handlers,
);
