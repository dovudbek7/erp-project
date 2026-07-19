import { axiosInstance } from "./apiClient";
import { adaptLot, adaptStockMovement } from "./adapters";

const lotService = {
  getAll: () =>
    axiosInstance.get<any[]>("lots").then((r) => r.data.map(adaptLot)),

  get: (id: string) =>
    axiosInstance.get<any>(`lots/${id}`).then((r) => adaptLot(r.data)),

  getMovements: (id: string) =>
    axiosInstance.get<any[]>(`lots/${id}/stock-movements`)
      .then((r) => r.data.map(adaptStockMovement)),

  post: (data: any) =>
    axiosInstance.post<any>("lots", {
      lot_number: Number(data.lotNumber ?? data.lot_number ?? Date.now()),
      product_id: Number(data.productId ?? data.product_id),
      warehouse_id: Number(data.warehouseId ?? data.warehouse_id),
      status: (data.status ?? "available").toLowerCase(),
      source: (data.source ?? "purchase").toLowerCase(),
      unit_cost: Number(data.unitCost ?? data.unit_cost ?? 0),
      initial_qty: Number(data.initialQuantity ?? data.initial_qty ?? 0),
      current_qty: Number(data.currentQuantity ?? data.current_qty ?? 0),
      expires_at: data.expiryDate ?? data.expires_at,
      currency: (data.currency ?? "UZS").toUpperCase(),
      received_at: data.receivedAt ?? data.received_at ?? new Date().toISOString(),
    }).then((r) => adaptLot(r.data)),

  put: (id: string, data: any) =>
    axiosInstance.put<any>(`lots/${id}`, data).then((r) => adaptLot(r.data)),

  del: (id: string) =>
    axiosInstance.delete(`lots/${id}`).then((r) => r.data),
};

export default lotService;
