// React-query cache keys for production + recipes.
// Separate file from constants.ts to avoid collisions with parallel work.
export const CACHE_KEY_PRODUCTION_ORDERS = ["production-orders"];
export const CACHE_KEY_PRODUCTION_ORDER = (id: string) => [
  "production-orders",
  id,
];
export const CACHE_KEY_SUGGEST_LOTS = (
  orderId: string,
  productId: string,
  quantity: string,
) => ["suggest-lots", orderId, productId, quantity];

export const CACHE_KEY_RECIPES = ["recipes"];
export const CACHE_KEY_RECIPE = (id: string) => ["recipes", id];

export const CACHE_KEY_USERS = ["users"];
