import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_PURCHASE_ORDERS } from "../constants";
import purchaseOrderService from "../services/purchaseOrderService";
import {
  type CreatePurchaseOrderPayload,
  type PurchaseOrder,
} from "../types";

const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, CreatePurchaseOrderPayload>({
    mutationFn: (payload) =>
      purchaseOrderService.post(payload as unknown as Partial<PurchaseOrder>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PURCHASE_ORDERS });
    },
  });
};

export default useCreatePurchaseOrder;
