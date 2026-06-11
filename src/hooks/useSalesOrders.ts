import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_SALES_ORDERS } from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type { SalesOrder } from "../types";

interface Params {
  status?: string;
  customerId?: string;
}

const useSalesOrders = (params: Params = {}) => {
  return useQuery<SalesOrder[], Error>({
    queryKey: [...CACHE_KEY_SALES_ORDERS, params],
    queryFn: () => salesOrderService.list(params),
  });
};

export default useSalesOrders;
