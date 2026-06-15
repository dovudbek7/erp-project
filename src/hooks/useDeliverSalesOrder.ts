import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_LOTS } from "../constants";
import {
  CACHE_KEY_SALES_ORDER,
  CACHE_KEY_SALES_ORDERS,
} from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type {
  DeliverSalesOrderPayload,
  SalesOrderWithLines,
} from "../types/sales";

const useDeliverSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, DeliverSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.deliver(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_LOTS });
    },
  });
};

export default useDeliverSalesOrder;
