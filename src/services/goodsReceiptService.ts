// Replaced by receivePurchaseOrder in purchaseOrderService.ts — stub
import type { GoodsReceipt } from "../types";

const goodsReceiptService = {
  getAll: () => Promise.resolve([] as GoodsReceipt[]),
  get: () => Promise.resolve(null),
  post: () => Promise.resolve(null),
  del: () => Promise.resolve(null),
};
export default goodsReceiptService;
