import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_SALES_ORDERS } from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type {
  CreateSalesOrderPayload,
  SalesOrderWithLines,
} from "../types/sales";

const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, CreateSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
    },
  });
};

export default useCreateSalesOrder;
