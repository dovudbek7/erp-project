import { axiosInstance } from "./apiClient";
import { adaptPurchaseOrder } from "./adapters";
import type { PurchaseOrderWithLines } from "../types";

const purchaseOrderService = {
  getAll: () =>
    axiosInstance.get<any[]>("purchase-orders")
      .then((r) => r.data.map(adaptPurchaseOrder)),

  get: (po_number: string) =>
    axiosInstance.get<any>(`purchase-orders/${po_number}`)
      .then((r) => adaptPurchaseOrder(r.data)),

  post: (data: any) =>
    axiosInstance.post<any>("purchase-orders", {
      supplier_id: Number(data.supplierId),
      warehouse_id: Number(data.warehouseId),
      status: "ordered",
      expected_date: data.expectedDate,
      currency: data.currency ?? "UZS",
      items: (data.lines ?? []).map((l: any) => ({
        product_id: Number(l.productId),
        ordered: Number(l.orderedQuantity),
        unit_price: Number(l.unitPrice),
      })),
    }).then((r) => adaptPurchaseOrder(r.data)),

  del: (po_number: string) =>
    axiosInstance.delete(`purchase-orders/${po_number}`).then((r) => r.data),
};

export const receivePurchaseOrder = (
  po_number: string,
  payload: {
    received_at: string;
    items: Array<{
      purchase_order_item_id: number;
      received: number;
      expires_at?: string;
    }>;
  }
) =>
  axiosInstance
    .post(`purchase-orders/${po_number}/receive`, payload)
    .then((r) => r.data);

export default purchaseOrderService;
