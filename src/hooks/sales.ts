import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_LOTS } from "../constants";
import {
  CACHE_KEY_AVAILABILITY,
  CACHE_KEY_CUSTOMERS,
  CACHE_KEY_PRICE_LIST,
  CACHE_KEY_SALES_ORDER,
  CACHE_KEY_SALES_ORDERS,
  CACHE_KEY_SUGGEST_ALLOCATIONS,
} from "../constants.sales";
import customerService from "../services/customerService";
import priceListService from "../services/priceListService";
import salesOrderService from "../services/salesOrderService";
import type { Customer, SalesOrder } from "../types";
import type {
  AvailabilityResponse,
  ConfirmSalesOrderPayload,
  CreateSalesOrderPayload,
  DeliverSalesOrderPayload,
  PriceListWithItems,
  SalesOrderWithLines,
  SuggestAllocationsResponse,
} from "../types/sales";

// ─── Customers ────────────────────────────────────────────────────────────────

export const useCustomers = () =>
  useQuery<Customer[], Error>({
    queryKey: CACHE_KEY_CUSTOMERS,
    queryFn: () => customerService.list(),
  });

// ─── Price / Availability ─────────────────────────────────────────────────────

export const usePriceList = (id: string) =>
  useQuery<PriceListWithItems | null, Error>({
    queryKey: CACHE_KEY_PRICE_LIST(id),
    queryFn: () => priceListService.get(id),
    enabled: !!id,
  });

export const useAvailability = (productId: string, enabled = true) =>
  useQuery<AvailabilityResponse, Error>({
    queryKey: CACHE_KEY_AVAILABILITY(productId),
    queryFn: () => priceListService.availability(productId),
    enabled: enabled && !!productId,
  });

export const useSuggestAllocations = (
  orderId: string,
  lineId: string,
  productId: string,
  quantity: string,
  enabled: boolean,
) =>
  useQuery<SuggestAllocationsResponse, Error>({
    queryKey: CACHE_KEY_SUGGEST_ALLOCATIONS(orderId, lineId, productId, quantity),
    queryFn: () => salesOrderService.suggestAllocations(orderId, lineId, productId, quantity || "0"),
    enabled: enabled && !!orderId && !!productId,
  });

// ─── Sales Orders ─────────────────────────────────────────────────────────────

interface ListParams { status?: string; customerId?: string }

export const useSalesOrders = (params: ListParams = {}) =>
  useQuery<SalesOrder[], Error>({
    queryKey: [...CACHE_KEY_SALES_ORDERS, params],
    queryFn: () => salesOrderService.list(params),
  });

export const useSalesOrder = (id: string) =>
  useQuery<SalesOrderWithLines, Error>({
    queryKey: CACHE_KEY_SALES_ORDER(id),
    queryFn: () => salesOrderService.get(id),
    enabled: !!id,
  });

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, CreateSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS }),
  });
};

export const useConfirmSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, ConfirmSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.confirm(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

export const usePickSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, void>({
    mutationFn: () => salesOrderService.pick(id),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
    },
  });
};

export const useDeliverSalesOrder = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<SalesOrderWithLines, Error, DeliverSalesOrderPayload>({
    mutationFn: (payload) => salesOrderService.deliver(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CACHE_KEY_SALES_ORDER(id), data);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_SALES_ORDERS });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_LOTS });
    },
  });
};
