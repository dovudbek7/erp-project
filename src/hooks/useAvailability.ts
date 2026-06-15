import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_AVAILABILITY } from "../constants.sales";
import priceListService from "../services/priceListService";
import type { AvailabilityResponse } from "../types/sales";

const useAvailability = (productId: string, enabled = true) => {
  return useQuery<AvailabilityResponse, Error>({
    queryKey: CACHE_KEY_AVAILABILITY(productId),
    queryFn: () => priceListService.availability(productId),
    enabled: enabled && !!productId,
  });
};

export default useAvailability;
