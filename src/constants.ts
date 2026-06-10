export const CACHE_KEY_LOTS = ["lots"];
export const CACHE_KEY_LOTS_DETAIL = "lotsDetail";
export const CACHE_KEY_WAREHOUSE = ["warehouse"];
export const CACHE_KEY_PRODUCTS = ["products"];
export const CACHE_KEY_PRODUCTS_DETAIL = ["products_detail"];
export const STOCK_MOVEMENTS = ["stock_movements"];
export const CACHE_TENANT = ["tenant"];

export const CACHE_KEY_PURCHASE_ORDERS = ["purchase-orders"];
export const CACHE_KEY_PURCHASE_ORDER = (id: string) => ["purchase-orders", id];
export const CACHE_KEY_GOODS_RECEIPTS = (poId: string) => [
  "goods-receipts",
  poId,
];
export const CACHE_KEY_SUPPLIERS = ["suppliers"];
