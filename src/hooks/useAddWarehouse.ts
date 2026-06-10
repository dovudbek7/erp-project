import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_WAREHOUSE } from "../constants";
import { type Warehouse } from "../types";

import warehouseService from "../services/warehouseService";

const useAddWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation<Warehouse, Error, Partial<Warehouse>>({
    mutationFn: warehouseService.post,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_WAREHOUSE });
    },
  });
};

export default useAddWarehouse;
