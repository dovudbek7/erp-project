import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_GOODS_RECEIPTS,
  CACHE_KEY_LOTS,
  CACHE_KEY_PURCHASE_ORDER,
  CACHE_KEY_PURCHASE_ORDERS,
  CACHE_KEY_SUPPLIERS,
} from "../constants";
import purchaseOrderService, { receivePurchaseOrder } from "../services/purchaseOrderService";
import supplierService from "../services/supplierService";
import type {
  CreatePurchaseOrderPayload,
  GoodsReceipt,
  PurchaseOrder,
  PurchaseOrderWithLines,
  ReceiveGoodsPayload,
  Supplier,
} from "../types";
import { add, gte, gt, qty } from "../utilties/money";

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const useSuppliers = () =>
  useQuery<Supplier[], Error>({ queryKey: CACHE_KEY_SUPPLIERS, queryFn: supplierService.getAll });

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const usePurchaseOrders = () =>
  useQuery<PurchaseOrder[], Error>({
    queryKey: CACHE_KEY_PURCHASE_ORDERS,
    queryFn: purchaseOrderService.getAll,
  });

export const usePurchaseOrder = (id: string) =>
  useQuery<PurchaseOrderWithLines, Error>({
    queryKey: CACHE_KEY_PURCHASE_ORDER(id),
    queryFn: () => purchaseOrderService.get(id),
    enabled: !!id,
  });

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<PurchaseOrder, Error, CreatePurchaseOrderPayload>({
    mutationFn: (payload) =>
      purchaseOrderService.post(payload as unknown as Partial<PurchaseOrder>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_PURCHASE_ORDERS }),
  });
};

// ─── Goods Receipts ───────────────────────────────────────────────────────────

export const useGoodsReceipts = (poId: string) =>
  useQuery<GoodsReceipt[], Error>({
    queryKey: CACHE_KEY_GOODS_RECEIPTS(poId),
    queryFn: () => Promise.resolve([] as GoodsReceipt[]),
    enabled: !!poId,
  });

interface ReceiveContext { prev?: PurchaseOrderWithLines }

export const useReceiveGoods = (poId: string) => {
  const queryClient = useQueryClient();
  const detailKey = CACHE_KEY_PURCHASE_ORDER(poId);

  return useMutation<any, Error, ReceiveGoodsPayload, ReceiveContext>({
    mutationFn: (payload) =>
      receivePurchaseOrder(poId, {
        received_at: new Date().toISOString(),
        items: payload.lines.map((l) => ({
          purchase_order_item_id: Number(l.purchaseOrderLineId),
          received: Number(l.quantity),
          expires_at: l.expiryDate ?? undefined,
        })),
      }),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const prev = queryClient.getQueryData<PurchaseOrderWithLines>(detailKey);
      if (prev) {
        const lines = prev.lines.map((ln) => {
          const recv = payload.lines.find((p) => p.purchaseOrderLineId === ln.id);
          return recv ? { ...ln, receivedQuantity: qty(add(ln.receivedQuantity, recv.quantity)) } : ln;
        });
        const allFull = lines.every((l) => gte(l.receivedQuantity, l.orderedQuantity));
        const anyRecv = lines.some((l) => gt(l.receivedQuantity, 0));
        queryClient.setQueryData<PurchaseOrderWithLines>(detailKey, {
          ...prev,
          lines,
          status: allFull ? "RECEIVED" : anyRecv ? "PARTIALLY_RECEIVED" : prev.status,
        });
      }
      return { prev };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(detailKey, ctx.prev);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PURCHASE_ORDERS });
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_GOODS_RECEIPTS(poId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_LOTS });
    },
  });
};
