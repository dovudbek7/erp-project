import { axiosInstance } from "./apiClient";
import { adaptSalesOrder } from "./adapters";
import type { CreateSalesOrderPayload, SalesOrderWithLines } from "../types/sales";

interface ListParams { status?: string; customerId?: string; }

const salesOrderService = {
  list: (params: ListParams = {}) =>
    axiosInstance.get<any[]>("sales-orders", { params })
      .then((r) => r.data.map(adaptSalesOrder)),

  get: (so_number: string) =>
    axiosInstance.get<any>(`sales-orders/${so_number}`)
      .then((r) => adaptSalesOrder(r.data)),

  create: (payload: CreateSalesOrderPayload) =>
    axiosInstance.post<any>("sales-orders", {
      customer_id: Number(payload.customerId),
      warehouse_id: Number(payload.warehouseId),
      promised_date: payload.promisedDate,
      notes: payload.notes ?? null,
      items: (payload.lines ?? []).map((l) => ({
        product_id: Number(l.productId),
        quantity: Number(l.orderedQuantity),
        unit_price: Number(l.unitPrice),
      })),
    }).then((r) => adaptSalesOrder(r.data)),

  update: (so_number: string, payload: Partial<CreateSalesOrderPayload>) =>
    axiosInstance.put<any>(`sales-orders/${so_number}`, {
      customer_id: payload.customerId ? Number(payload.customerId) : undefined,
      warehouse_id: payload.warehouseId ? Number(payload.warehouseId) : undefined,
      promised_date: payload.promisedDate,
      notes: payload.notes,
    }).then((r) => adaptSalesOrder(r.data)),

  confirm: (so_number: string, _payload?: any) =>
    axiosInstance.post<any>(`sales-orders/${so_number}/confirm`)
      .then((r) => adaptSalesOrder(r.data)),

  invoice: (so_number: string) =>
    axiosInstance.post<any>(`sales-orders/${so_number}/invoice`)
      .then((r) => adaptSalesOrder(r.data)),

  // map pick→confirm, deliver→invoice for backend compatibility
  pick: (so_number: string) =>
    axiosInstance.post<any>(`sales-orders/${so_number}/confirm`)
      .then((r) => adaptSalesOrder(r.data)),

  deliver: (so_number: string, _payload?: any) =>
    axiosInstance.post<any>(`sales-orders/${so_number}/invoice`)
      .then((r) => adaptSalesOrder(r.data)),

  cancel: (so_number: string) =>
    axiosInstance.post<any>(`sales-orders/${so_number}/cancel`)
      .then((r) => adaptSalesOrder(r.data)),

  remove: (so_number: string) =>
    axiosInstance.delete(`sales-orders/${so_number}`).then((r) => r.data),

  // Not in backend — return empty
  suggestAllocations: (_orderId?: string, _lineId?: string, _productId?: string, _qty?: string) =>
    Promise.resolve({
      productId: _productId ?? "", lineId: _lineId ?? "", requestedQuantity: _qty ?? "0", shortfall: "0", suggestions: [],
    }),
};

export default salesOrderService;
