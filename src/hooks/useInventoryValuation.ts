import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_VALUATION } from "../constants.reports";
import reportsService from "../services/reportsService";
import { type ValuationReport, type ValuationParams } from "../types/reports";

const useInventoryValuation = (params: ValuationParams) =>
  useQuery<ValuationReport, Error>({
    queryKey: CACHE_KEY_VALUATION(params),
    queryFn: () => reportsService.valuation(params),
  });

export default useInventoryValuation;
