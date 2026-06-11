import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_SALES_ORDER,
  CACHE_KEY_SALES_ORDERS,
} from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type { SalesOrderWithLines } from "../types/sales";

const usePickSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, void>({
    mutationFn: () => salesOrderService.pick(id),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
    },
  });
};

export default usePickSalesOrder;
