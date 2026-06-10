import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PURCHASE_ORDERS } from "../constants";
import purchaseOrderService from "../services/purchaseOrderService";
import { type PurchaseOrder } from "../types";

const usePurchaseOrders = () => {
  return useQuery<PurchaseOrder[], Error>({
    queryKey: CACHE_KEY_PURCHASE_ORDERS,
    queryFn: purchaseOrderService.getAll,
  });
};

export default usePurchaseOrders;
