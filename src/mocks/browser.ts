import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { productionHandlers } from "./productionHandlers";

// Production handlers are spread first so their stateful routes shadow the
// read-only production/recipe routes in handlers.ts (first match wins in MSW).
export const worker = setupWorker(...productionHandlers, ...handlers);
