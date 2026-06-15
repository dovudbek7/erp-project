import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_GOODS_RECEIPTS,
  CACHE_KEY_LOTS,
  CACHE_KEY_PURCHASE_ORDER,
  CACHE_KEY_PURCHASE_ORDERS,
} from "../constants";
import APICLIENT from "../services/apiClient";
import {
  type GoodsReceiptWithLines,
  type PurchaseOrderWithLines,
  type ReceiveGoodsPayload,
} from "../types";
import { add, gte, gt, qty } from "../utilties/money";

interface Context {
  prev?: PurchaseOrderWithLines;
}

const useReceiveGoods = (poId: string) => {
  const queryClient = useQueryClient();
  const detailKey = CACHE_KEY_PURCHASE_ORDER(poId);

  return useMutation<
    GoodsReceiptWithLines,
    Error,
    ReceiveGoodsPayload,
    Context
  >({
    mutationFn: (payload) =>
      new APICLIENT<GoodsReceiptWithLines>(
        `purchase-orders/${poId}/receive`,
      ).post(payload as unknown as Partial<GoodsReceiptWithLines>),

    onMutate: async (payload) => {
      // 1. stop in-flight detail refetch from clobbering the optimistic write
      await queryClient.cancelQueries({ queryKey: detailKey });
      // 2. snapshot for rollback
      const prev = queryClient.getQueryData<PurchaseOrderWithLines>(detailKey);
      if (prev) {
        // 3. optimistically bump receivedQuantity + status
        const lines = prev.lines.map((ln) => {
          const recv = payload.lines.find(
            (p) => p.purchaseOrderLineId === ln.id,
          );
          return recv
            ? {
                ...ln,
                receivedQuantity: qty(add(ln.receivedQuantity, recv.quantity)),
              }
            : ln;
        });
        const allFull = lines.every((l) =>
          gte(l.receivedQuantity, l.orderedQuantity),
        );
        const anyRecv = lines.some((l) => gt(l.receivedQuantity, 0));
        queryClient.setQueryData<PurchaseOrderWithLines>(detailKey, {
          ...prev,
          lines,
          status: allFull
            ? "RECEIVED"
            : anyRecv
              ? "PARTIALLY_RECEIVED"
              : prev.status,
        });
      }
      return { prev };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(detailKey, ctx.prev);
    },

    onSettled: () => {
      // "purchase-orders" prefix cascades to both list and this detail
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PURCHASE_ORDERS });
      queryClient.invalidateQueries({
        queryKey: CACHE_KEY_GOODS_RECEIPTS(poId),
      });
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_LOTS });
    },
  });
};

export default useReceiveGoods;
