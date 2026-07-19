import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CACHE_KEY_LOTS,
  CACHE_KEY_LOTS_DETAIL,
  CACHE_KEY_PRODUCTS,
  CACHE_KEY_PRODUCTS_DETAIL,
  CACHE_KEY_WAREHOUSE,
  STOCK_MOVEMENTS,
} from "../constants";
import lotService from "../services/lotService";
import productService from "../services/productService";
import warehouseService from "../services/warehouseService";
import type { Lot, Product, StockMovement, Warehouse } from "../types";

// ─── Products ────────────────────────────────────────────────────────────────

export const useProducts = () =>
  useQuery<Product[], Error>({ queryKey: CACHE_KEY_PRODUCTS, queryFn: productService.getAll });

export const useProductsDetail = (id: string) =>
  useQuery<Product, Error>({
    queryKey: [CACHE_KEY_PRODUCTS_DETAIL, id],
    queryFn: () => productService.get(id),
    enabled: !!id,
  });

// ─── Lots ─────────────────────────────────────────────────────────────────────

export const useLots = () =>
  useQuery<Lot[], Error>({ queryKey: CACHE_KEY_LOTS, queryFn: lotService.getAll });

export const useLotsDetail = (id: string) =>
  useQuery<Lot, Error>({
    queryKey: [CACHE_KEY_LOTS_DETAIL, id],
    queryFn: () => lotService.get(id),
    enabled: !!id,
  });

export const useMovements = (lotId: string) =>
  useQuery<StockMovement[], Error>({
    queryKey: [...STOCK_MOVEMENTS, lotId],
    queryFn: () => lotService.getMovements(lotId),
    enabled: !!lotId,
  });

// ─── Warehouse ────────────────────────────────────────────────────────────────

export const useWarehouse = () =>
  useQuery<Warehouse[], Error>({ queryKey: CACHE_KEY_WAREHOUSE, queryFn: warehouseService.getAll });

export const useAddWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation<Warehouse, Error, Partial<Warehouse>>({
    mutationFn: warehouseService.post,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_WAREHOUSE }),
  });
};
