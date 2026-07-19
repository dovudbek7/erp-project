import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_PRODUCTION_ORDER,
  CACHE_KEY_PRODUCTION_ORDERS,
  CACHE_KEY_RECIPE,
  CACHE_KEY_RECIPES,
  CACHE_KEY_SUGGEST_LOTS,
} from "../constants.production";
import productionService from "../services/productionService";
import recipeService from "../services/recipeService";
import type { ProductionOrder, Recipe } from "../types";
import type {
  CompleteProductionPayload,
  CreateProductionOrderPayload,
  CreateRecipePayload,
  ProductionOrderWithDetail,
  RecipeWithIngredients,
  SuggestLotsResponse,
} from "../types/production";

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const useRecipes = () =>
  useQuery<Recipe[], Error>({ queryKey: CACHE_KEY_RECIPES, queryFn: recipeService.list });

export const useRecipe = (id: string) =>
  useQuery<RecipeWithIngredients, Error>({
    queryKey: CACHE_KEY_RECIPE(id),
    queryFn: () => recipeService.get(id),
    enabled: !!id,
  });

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation<RecipeWithIngredients, Error, CreateRecipePayload>({
    mutationFn: (payload) => recipeService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_RECIPES }),
  });
};

export const useUpdateRecipe = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<RecipeWithIngredients, Error, CreateRecipePayload>({
    mutationFn: (payload) => recipeService.newVersion(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_RECIPES }),
  });
};

// ─── Production Orders ────────────────────────────────────────────────────────

interface ListParams { status?: string; recipeId?: string }

export const useProductionOrders = (params: ListParams = {}) =>
  useQuery<ProductionOrder[], Error>({
    queryKey: [...CACHE_KEY_PRODUCTION_ORDERS, params],
    queryFn: () => productionService.list(params),
  });

export const useProductionOrder = (id: string) =>
  useQuery<ProductionOrderWithDetail, Error>({
    queryKey: CACHE_KEY_PRODUCTION_ORDER(id),
    queryFn: () => productionService.get(id),
    enabled: !!id,
  });

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductionOrderWithDetail, Error, CreateProductionOrderPayload>({
    mutationFn: (payload) => productionService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS }),
  });
};

export const useUpdateProductionOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProductionOrderWithDetail, Error, { plannedOutputQuantity?: string; notes?: string | null }>({
    mutationFn: (payload) => productionService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_PRODUCTION_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

export const useDeleteProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => productionService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS }),
  });
};

export const useStartProduction = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProductionOrderWithDetail, Error, void>({
    mutationFn: () => productionService.start(id),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_PRODUCTION_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

export const useCompleteProduction = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProductionOrderWithDetail, Error, CompleteProductionPayload>({
    mutationFn: (payload) => productionService.complete(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_PRODUCTION_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTION_ORDERS });
    },
  });
};

// ─── Lot Suggestions ──────────────────────────────────────────────────────────

export const useSuggestLots = (
  orderId: string,
  productId: string,
  quantity: string,
  enabled: boolean,
) =>
  useQuery<SuggestLotsResponse, Error>({
    queryKey: CACHE_KEY_SUGGEST_LOTS(orderId, productId, quantity),
    queryFn: () => Promise.resolve({ suggestions: [] } as SuggestLotsResponse),
    enabled: enabled && !!orderId && !!productId,
  });
