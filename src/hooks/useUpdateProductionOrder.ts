import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_PRODUCTION_ORDER,
  CACHE_KEY_PRODUCTION_ORDERS,
} from "../constants.production";
import productionService from "../services/productionService";
import { type ProductionOrderWithDetail } from "../types/production";

interface Payload {
  plannedOutputQuantity?: string;
  notes?: string | null;
}

const useUpdateProductionOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProductionOrderWithDetail, Error, Payload>({
    mutationFn: (payload) => productionService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_PRODUCTION_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

export default useUpdateProductionOrder;
