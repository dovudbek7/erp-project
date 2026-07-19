import { axiosInstance } from "./apiClient";
import { adaptRecipe } from "./adapters";
import type { Recipe } from "../types";
import type { RecipeWithIngredients, CreateRecipePayload } from "../types/production";

const recipeService = {
  list: () =>
    axiosInstance.get<any[]>("recipes").then((r) => r.data.map(adaptRecipe)),

  get: (code: string) =>
    axiosInstance.get<any>(`recipes/${code}`).then((r) => adaptRecipe(r.data)),

  create: (payload: CreateRecipePayload) =>
    axiosInstance.post<any>("recipes", {
      name: payload.name,
      output_product_id: Number(payload.outputProductId),
      output_qty: payload.outputQuantity,
      output_uom: payload.outputUom,
      target_yield_percent: payload.expectedYieldPercent,
      status: "active",
      notes: payload.notes ?? null,
      ingredients: (payload.ingredients ?? []).map((ing) => ({
        product_id: Number(ing.productId),
        quantity: Number(ing.quantity),
        uom: ing.uom,
        optional: ing.isOptional ?? false,
      })),
    }).then((r) => adaptRecipe(r.data)),

  update: (code: string, payload: Partial<CreateRecipePayload>) =>
    axiosInstance.put<any>(`recipes/${code}`, {
      name: payload.name,
      output_product_id: payload.outputProductId ? Number(payload.outputProductId) : undefined,
      output_qty: payload.outputQuantity,
      output_uom: payload.outputUom,
      target_yield_percent: payload.expectedYieldPercent,
      notes: payload.notes ?? null,
      ingredients: (payload.ingredients ?? []).map((ing) => ({
        product_id: Number(ing.productId),
        quantity: Number(ing.quantity),
        uom: ing.uom,
        optional: ing.isOptional ?? false,
      })),
    }).then((r) => adaptRecipe(r.data)),

  // newVersion → update (backend has no versioning)
  newVersion: (code: string, payload: CreateRecipePayload) =>
    recipeService.update(code, payload),

  remove: (code: string) =>
    axiosInstance.delete(`recipes/${code}`).then((r) => r.data),
};

export default recipeService;
