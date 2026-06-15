import axios from "axios";
import type { AvailabilityResponse, PriceListWithItems } from "../types/sales";

const api = axios.create({ baseURL: "/api/" });

const priceListService = {
  get: (id: string) =>
    api.get<PriceListWithItems>(`price-lists/${id}`).then((r) => r.data),

  availability: (productId: string) =>
    api
      .get<AvailabilityResponse>("inventory/availability", {
        params: { productId },
      })
      .then((r) => r.data),
};

export default priceListService;
