import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_DASHBOARD } from "../constants.reports";
import reportsService from "../services/reportsService";
import { type DashboardReport } from "../types/reports";

const useDashboard = () =>
  useQuery<DashboardReport, Error>({
    queryKey: CACHE_KEY_DASHBOARD,
    queryFn: reportsService.dashboard,
  });

export default useDashboard;
