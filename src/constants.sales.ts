// React-query cache keys for the sales-order spine.
// Separate file from constants.ts / constants.production.ts to avoid collisions.
export const CACHE_KEY_SALES_ORDERS = ["sales-orders"];
export const CACHE_KEY_SALES_ORDER = (id: string) => ["sales-orders", id];

export const CACHE_KEY_CUSTOMERS = ["customers"];
export const CACHE_KEY_PRICE_LIST = (id: string) => ["price-lists", id];

export const CACHE_KEY_AVAILABILITY = (productId: string) => [
  "availability",
  productId,
];
export const CACHE_KEY_SUGGEST_ALLOCATIONS = (
  orderId: string,
  lineId: string,
  productId: string,
  quantity: string,
) => ["suggest-allocations", orderId, lineId, productId, quantity];
