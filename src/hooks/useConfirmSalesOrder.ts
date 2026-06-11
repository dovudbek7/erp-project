import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_SALES_ORDER,
  CACHE_KEY_SALES_ORDERS,
} from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type {
  ConfirmSalesOrderPayload,
  SalesOrderWithLines,
} from "../types/sales";

const useConfirmSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, ConfirmSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.confirm(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
      // Reservations changed → refresh any availability lookups.
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

export default useConfirmSalesOrder;
