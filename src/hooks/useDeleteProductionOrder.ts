import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_PRODUCTION_ORDERS } from "../constants.production";
import productionService from "../services/productionService";

const useDeleteProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => productionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

export default useDeleteProductionOrder;
