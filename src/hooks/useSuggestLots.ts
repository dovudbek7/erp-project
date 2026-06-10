import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_SUGGEST_LOTS } from "../constants.production";
import productionService from "../services/productionService";
import { type SuggestLotsResponse } from "../types/production";

// Fetches FEFO lot suggestions for an input row. `enabled` lets the caller
// defer the request until the side panel actually opens.
const useSuggestLots = (
  orderId: string,
  productId: string,
  quantity: string,
  enabled: boolean,
) => {
  return useQuery<SuggestLotsResponse, Error>({
    queryKey: CACHE_KEY_SUGGEST_LOTS(orderId, productId, quantity),
    queryFn: () => productionService.suggestLots(orderId, productId, quantity),
    enabled: enabled && !!orderId && !!productId,
  });
};

export default useSuggestLots;
