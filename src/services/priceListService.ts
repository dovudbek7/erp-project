// No backend endpoint — stub
import type { AvailabilityResponse, PriceListWithItems } from "../types/sales";

const priceListService = {
  get: (_id: string): Promise<PriceListWithItems | null> => Promise.resolve(null),
  availability: (_productId: string): Promise<AvailabilityResponse> =>
    Promise.resolve({ productId: _productId, onHand: "0", reserved: "0", available: "0" }),
};
export default priceListService;
