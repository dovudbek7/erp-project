import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_SUGGEST_ALLOCATIONS } from "../constants.sales";
import salesOrderService from "../services/salesOrderService";
import type { SuggestAllocationsResponse } from "../types/sales";

const useSuggestAllocations = (
  orderId: string,
  lineId: string,
  productId: string,
  quantity: string,
  enabled: boolean,
) => {
  return useQuery<SuggestAllocationsResponse, Error>({
    queryKey: CACHE_KEY_SUGGEST_ALLOCATIONS(
      orderId,
      lineId,
      productId,
      quantity,
    ),
    queryFn: () =>
      salesOrderService.suggestAllocations(
        orderId,
        lineId,
        productId,
        quantity || "0",
      ),
    enabled: enabled && !!orderId && !!productId,
  });
};

export default useSuggestAllocations;
