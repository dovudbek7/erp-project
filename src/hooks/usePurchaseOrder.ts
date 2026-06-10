import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PURCHASE_ORDER } from "../constants";
import APICLIENT from "../services/apiClient";
import { type PurchaseOrderWithLines } from "../types";

const usePurchaseOrder = (id: string) => {
  return useQuery<PurchaseOrderWithLines, Error>({
    queryKey: CACHE_KEY_PURCHASE_ORDER(id),
    queryFn: new APICLIENT<PurchaseOrderWithLines>(`purchase-orders/${id}`).get,
    enabled: !!id,
  });
};

export default usePurchaseOrder;
