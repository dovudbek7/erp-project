import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_TRACEABILITY } from "../constants.reports";
import reportsService from "../services/reportsService";
import {
  type TraceabilityReport,
  type TraceDirection,
} from "../types/reports";

const useTraceability = (lotId: string, direction: TraceDirection) =>
  useQuery<TraceabilityReport, Error>({
    queryKey: CACHE_KEY_TRACEABILITY(lotId, direction),
    queryFn: () => reportsService.traceability(lotId, direction),
    enabled: !!lotId,
  });

export default useTraceability;
