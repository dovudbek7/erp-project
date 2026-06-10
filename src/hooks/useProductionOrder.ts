import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PRODUCTION_ORDER } from "../constants.production";
import productionService from "../services/productionService";
import { type ProductionOrderWithDetail } from "../types/production";

const useProductionOrder = (id: string) => {
  return useQuery<ProductionOrderWithDetail, Error>({
    queryKey: CACHE_KEY_PRODUCTION_ORDER(id),
    queryFn: () => productionService.get(id),
    enabled: !!id,
  });
};

export default useProductionOrder;
