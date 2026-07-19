import { useQuery } from "@tanstack/react-query";
import {
  CACHE_KEY_DASHBOARD,
  CACHE_KEY_TRACEABILITY,
  CACHE_KEY_VALUATION,
  CACHE_KEY_YIELD,
} from "../constants.reports";
import reportsService from "../services/reportsService";
import type {
  DashboardReport,
  TraceabilityReport,
  TraceDirection,
  ValuationParams,
  ValuationReport,
  YieldReport,
  YieldReportParams,
} from "../types/reports";

export const useDashboard = () =>
  useQuery<DashboardReport, Error>({
    queryKey: CACHE_KEY_DASHBOARD,
    queryFn: reportsService.dashboard,
  });

export const useYieldReport = (params: YieldReportParams) =>
  useQuery<YieldReport | null, Error>({
    queryKey: CACHE_KEY_YIELD(params),
    queryFn: () => reportsService.yield(params),
  });

export const useInventoryValuation = (params: ValuationParams) =>
  useQuery<ValuationReport | null, Error>({
    queryKey: CACHE_KEY_VALUATION(params),
    queryFn: () => reportsService.valuation(params),
  });

export const useTraceability = (lotId: string, direction: TraceDirection) =>
  useQuery<TraceabilityReport | null, Error>({
    queryKey: CACHE_KEY_TRACEABILITY(lotId, direction),
    queryFn: () => reportsService.traceability(lotId, direction),
    enabled: !!lotId,
  });
