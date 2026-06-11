// Request/response helper types for the sales-order screens.
// Base entity types (SalesOrder, SalesOrderLine, etc.) live in index.ts.
import type {
  AllocatedLot,
  PriceList,
  PriceListItem,
  SalesOrder,
  SalesOrderLine,
} from ".";

export type SalesOrderWithLines = SalesOrder & {
  lines: SalesOrderLine[];
};

export type PriceListWithItems = PriceList & {
  items: PriceListItem[];
};

export interface CreateSalesOrderLine {
  productId: string;
  orderedQuantity: string;
  uom: string;
  unitPrice: string;
}

export interface CreateSalesOrderPayload {
  customerId: string;
  warehouseId: string;
  orderDate: string;
  promisedDate: string;
  notes?: string | null;
  lines: CreateSalesOrderLine[];
}

export interface ConfirmLineAllocation {
  lineId: string;
  allocatedLots: AllocatedLot[];
}

export interface ConfirmSalesOrderPayload {
  lines: ConfirmLineAllocation[];
}

export interface DeliverSalesOrderPayload {
  deliveredDate: string;
  notes?: string | null;
}

// Mirrors SuggestedLot in types/production.ts. availableQuantity here is
// reservation-adjusted (on-hand minus qty reserved by other CONFIRMED/PICKED orders).
export interface SuggestedAllocation {
  lotId: string;
  lotNumber: string;
  availableQuantity: string;
  expiryDate: string;
  unitCost: string;
  warehouseId: string;
  suggestedQuantity: string;
}

export interface SuggestAllocationsResponse {
  productId: string;
  lineId?: string;
  requestedQuantity: string;
  shortfall: string;
  suggestions: SuggestedAllocation[];
}

export interface AvailabilityResponse {
  productId: string;
  onHand: string;
  reserved: string;
  available: string;
}
