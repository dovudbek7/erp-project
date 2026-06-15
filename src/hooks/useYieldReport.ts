import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_YIELD } from "../constants.reports";
import reportsService from "../services/reportsService";
import { type YieldReport, type YieldReportParams } from "../types/reports";

const useYieldReport = (params: YieldReportParams) =>
  useQuery<YieldReport, Error>({
    queryKey: CACHE_KEY_YIELD(params),
    queryFn: () => reportsService.yield(params),
  });

export default useYieldReport;
