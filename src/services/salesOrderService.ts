import axios from "axios";
import type { SalesOrder } from "../types";
import type {
  ConfirmSalesOrderPayload,
  CreateSalesOrderPayload,
  DeliverSalesOrderPayload,
  SalesOrderWithLines,
  SuggestAllocationsResponse,
} from "../types/sales";

// Local axios instance (mirrors services/apiClient.ts) so this file owns the
// sales-order endpoints without editing the shared apiClient.
const api = axios.create({ baseURL: "/api/" });

interface ListParams {
  status?: string;
  customerId?: string;
}

const salesOrderService = {
  list: (params: ListParams = {}) =>
    api.get<SalesOrder[]>("sales-orders", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<SalesOrderWithLines>(`sales-orders/${id}`).then((r) => r.data),

  create: (payload: CreateSalesOrderPayload) =>
    api
      .post<SalesOrderWithLines>("sales-orders", payload)
      .then((r) => r.data),

  confirm: (id: string, payload: ConfirmSalesOrderPayload) =>
    api
      .post<SalesOrderWithLines>(`sales-orders/${id}/confirm`, payload)
      .then((r) => r.data),

  pick: (id: string) =>
    api.post<SalesOrderWithLines>(`sales-orders/${id}/pick`).then((r) => r.data),

  deliver: (id: string, payload: DeliverSalesOrderPayload) =>
    api
      .post<SalesOrderWithLines>(`sales-orders/${id}/deliver`, payload)
      .then((r) => r.data),

  suggestAllocations: (
    orderId: string,
    lineId: string,
    productId: string,
    quantity: string,
  ) =>
    api
      .get<SuggestAllocationsResponse>(
        `sales-orders/${orderId}/suggest-allocations`,
        { params: { lineId, productId, quantity } },
      )
      .then((r) => r.data),
};

export default salesOrderService;
