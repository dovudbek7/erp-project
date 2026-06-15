import axios from "axios";
import type {
  ProductionOrder,
  ProductionOrderInput,
} from "../types";
import type {
  ProductionOrderWithDetail,
  SuggestLotsResponse,
  PatchInputPayload,
  CompleteProductionPayload,
  CreateProductionOrderPayload,
} from "../types/production";

// Local axios instance (mirrors services/apiClient.ts) so this file owns
// the production endpoints without editing the shared apiClient.
const api = axios.create({ baseURL: "/api/" });

interface ListParams {
  status?: string;
  recipeId?: string;
}

const productionService = {
  list: (params: ListParams = {}) =>
    api
      .get<ProductionOrder[]>("production-orders", { params })
      .then((r) => r.data),

  get: (id: string) =>
    api
      .get<ProductionOrderWithDetail>(`production-orders/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductionOrderPayload) =>
    api
      .post<ProductionOrderWithDetail>("production-orders", payload)
      .then((r) => r.data),

  update: (
    id: string,
    payload: { plannedOutputQuantity?: string; notes?: string | null },
  ) =>
    api
      .patch<ProductionOrderWithDetail>(`production-orders/${id}`, payload)
      .then((r) => r.data),

  remove: (id: string) =>
    api.delete(`production-orders/${id}`).then((r) => r.data),

  start: (id: string) =>
    api
      .post<ProductionOrderWithDetail>(`production-orders/${id}/start`)
      .then((r) => r.data),

  complete: (id: string, payload: CompleteProductionPayload) =>
    api
      .post<ProductionOrderWithDetail>(
        `production-orders/${id}/complete`,
        payload,
      )
      .then((r) => r.data),

  patchInput: (orderId: string, inputId: string, payload: PatchInputPayload) =>
    api
      .patch<ProductionOrderInput>(
        `production-orders/${orderId}/inputs/${inputId}`,
        payload,
      )
      .then((r) => r.data),

  suggestLots: (orderId: string, productId: string, quantity: string) =>
    api
      .get<SuggestLotsResponse>(`production-orders/${orderId}/suggest-lots`, {
        params: { productId, quantity },
      })
      .then((r) => r.data),
};

export default productionService;
