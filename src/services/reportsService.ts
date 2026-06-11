import axios from "axios";
import type {
  DashboardReport,
  YieldReport,
  YieldReportParams,
  ValuationReport,
  ValuationParams,
  TraceabilityReport,
  TraceDirection,
} from "../types/reports";

// Local axios instance so this file owns the /reports endpoints without
// editing the shared apiClient.
const api = axios.create({ baseURL: "/api/" });

const reportsService = {
  dashboard: () =>
    api.get<DashboardReport>("reports/dashboard").then((r) => r.data),

  yield: (params: YieldReportParams) =>
    api.get<YieldReport>("reports/yield", { params }).then((r) => r.data),

  valuation: (params: ValuationParams) =>
    api
      .get<ValuationReport>("reports/inventory-valuation", { params })
      .then((r) => r.data),

  traceability: (lotId: string, direction: TraceDirection) =>
    api
      .get<TraceabilityReport>("reports/traceability", {
        params: { lotId, direction },
      })
      .then((r) => r.data),
};

export default reportsService;
