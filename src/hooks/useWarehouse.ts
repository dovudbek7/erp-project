import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_WAREHOUSE } from "../constants";
import { type warehouse } from "../types";

import warehouseService from "../services/warehouseService";

const useWarehouse = () => {
  return useQuery<warehouse[], Error>({
    queryKey: CACHE_KEY_WAREHOUSE,
    queryFn: warehouseService.getAll,
  });
};

export default useWarehouse;
