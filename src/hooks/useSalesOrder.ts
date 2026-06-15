import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_SALES_ORDER } from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type { SalesOrderWithLines } from "../types/sales";

const useSalesOrder = (id: string) => {
  return useQuery<SalesOrderWithLines, Error>({
    queryKey: CACHE_KEY_SALES_ORDER(id),
    queryFn: () => salesOrderService.get(id),
    enabled: !!id,
  });
};

export default useSalesOrder;
