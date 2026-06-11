import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PRICE_LIST } from "../constants.sales";
import priceListService from "../services/priceListService";
import type { PriceListWithItems } from "../types/sales";

const usePriceList = (id: string) => {
  return useQuery<PriceListWithItems, Error>({
    queryKey: CACHE_KEY_PRICE_LIST(id),
    queryFn: () => priceListService.get(id),
    enabled: !!id,
  });
};

export default usePriceList;
