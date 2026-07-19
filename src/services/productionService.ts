import { axiosInstance } from "./apiClient";
import { adaptProductionOrder } from "./adapters";
import type { ProductionOrder } from "../types";
import type { ProductionOrderWithDetail, CreateProductionOrderPayload } from "../types/production";

interface ListParams { status?: string; recipeId?: string; }

const productionService = {
  list: (params: ListParams = {}) =>
    axiosInstance.get<any[]>("production-orders", { params })
      .then((r) => r.data.map(adaptProductionOrder)),

  get: (prd_number: string) =>
    axiosInstance.get<any>(`production-orders/${prd_number}`)
      .then((r) => adaptProductionOrder(r.data)),

  create: (payload: CreateProductionOrderPayload) =>
    axiosInstance.post<any>("production-orders", {
      recipe_id: Number(payload.recipeId),
      warehouse_id: Number(payload.warehouseId),
      planned_output: Number(payload.plannedOutputQuantity),
      schedule_for: payload.scheduledFor,
      notes: payload.notes ?? null,
    }).then((r) => adaptProductionOrder(r.data)),

  update: (prd_number: string, payload: Partial<CreateProductionOrderPayload>) =>
    axiosInstance.put<any>(`production-orders/${prd_number}`, {
      recipe_id: payload.recipeId ? Number(payload.recipeId) : undefined,
      warehouse_id: payload.warehouseId ? Number(payload.warehouseId) : undefined,
      planned_output: payload.plannedOutputQuantity ? Number(payload.plannedOutputQuantity) : undefined,
      schedule_for: payload.scheduledFor,
      notes: payload.notes,
    }).then((r) => adaptProductionOrder(r.data)),

  remove: (prd_number: string) =>
    axiosInstance.delete(`production-orders/${prd_number}`).then((r) => r.data),

  start: (prd_number: string) =>
    axiosInstance.post<any>(`production-orders/${prd_number}/start`)
      .then((r) => adaptProductionOrder(r.data)),

  complete: (prd_number: string, payload: { actualOutputQuantity?: string; actual_output?: number }) => {
    const actual_output = payload.actual_output ??
      (payload.actualOutputQuantity ? Number(payload.actualOutputQuantity) : 0);
    return axiosInstance
      .post<any>(`production-orders/${prd_number}/complete`, { actual_output })
      .then((r) => adaptProductionOrder(r.data));
  },

  cancel: (prd_number: string) =>
    axiosInstance.post<any>(`production-orders/${prd_number}/cancel`)
      .then((r) => adaptProductionOrder(r.data)),

  // No backend endpoint for per-input patching — no-op
  patchInput: (_orderId: string, inputId: string, payload: any) =>
    Promise.resolve({ id: inputId, ...payload }),

  // No backend endpoint for lot suggestion
  suggestLots: (_orderId: string, _productId: string, _qty: string) =>
    Promise.resolve({ suggestions: [] }),
};

export default productionService;
