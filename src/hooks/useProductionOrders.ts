import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PRODUCTION_ORDERS } from "../constants.production";
import productionService from "../services/productionService";
import { type ProductionOrder } from "../types";

interface Params {
  status?: string;
  recipeId?: string;
}

const useProductionOrders = (params: Params = {}) => {
  return useQuery<ProductionOrder[], Error>({
    queryKey: [...CACHE_KEY_PRODUCTION_ORDERS, params],
    queryFn: () => productionService.list(params),
  });
};

export default useProductionOrders;
