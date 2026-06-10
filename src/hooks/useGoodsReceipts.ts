import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_GOODS_RECEIPTS } from "../constants";
import APICLIENT from "../services/apiClient";
import { type GoodsReceipt } from "../types";

const useGoodsReceipts = (poId: string) => {
  return useQuery<GoodsReceipt[], Error>({
    queryKey: CACHE_KEY_GOODS_RECEIPTS(poId),
    queryFn: new APICLIENT<GoodsReceipt>(
      `goods-receipts?purchaseOrderId=${poId}`,
    ).getAll,
    enabled: !!poId,
  });
};

export default useGoodsReceipts;
