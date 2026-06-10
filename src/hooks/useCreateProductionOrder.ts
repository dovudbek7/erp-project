import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_PRODUCTION_ORDERS } from "../constants.production";
import productionService from "../services/productionService";
import {
  type CreateProductionOrderPayload,
  type ProductionOrderWithDetail,
} from "../types/production";

const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProductionOrderWithDetail,
    Error,
    CreateProductionOrderPayload
  >({
    mutationFn: (payload) => productionService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

export default useCreateProductionOrder;
