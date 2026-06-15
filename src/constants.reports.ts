// React-query cache keys for the reports screens.
import type {
  YieldReportParams,
  ValuationParams,
  TraceDirection,
} from "./types/reports";

export const CACHE_KEY_DASHBOARD = ["reports", "dashboard"];
export const CACHE_KEY_YIELD = (params: YieldReportParams) => [
  "reports",
  "yield",
  params,
];
export const CACHE_KEY_VALUATION = (params: ValuationParams) => [
  "reports",
  "valuation",
  params,
];
export const CACHE_KEY_TRACEABILITY = (
  lotId: string,
  direction: TraceDirection,
) => ["reports", "traceability", lotId, direction];
