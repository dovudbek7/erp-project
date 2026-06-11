// Response types for the /reports/* endpoints. Separate file to avoid
// edit collisions with parallel work in src/types/index.ts.
import type { LotSource, LotStatus, ProductType } from ".";

export interface ExpiringLot {
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  warehouseId: string;
  currentQuantity: string;
  uom: string;
  expiryDate: string;
  daysToExpiry: number;
  value: string;
}

export interface DashboardReport {
  stockOnHandValue: string;
  lotsExpiringSoon: ExpiringLot[];
  activeProductionOrders: number;
  todayProductionOutput: string;
  outstandingAR: string;
  currency: string;
  productionOutput30d: { date: string; quantity: number }[];
}

export interface YieldRow {
  recipeId: string;
  recipeName: string;
  batches: number;
  plannedOutput: string;
  actualOutput: string;
  totalCost: string;
  avgYieldPercent: string;
  expectedYieldPercent: number;
  yieldVariance: string;
}

export interface YieldReport {
  rows: YieldRow[];
  batchCount: number;
}

export interface ValuationRow {
  warehouseId: string;
  warehouseName: string;
  productType: string;
  lotCount: number;
  totalQuantity: string;
  totalValue: string;
}

export interface ValuationReport {
  rows: ValuationRow[];
  grandTotal: string;
}

export type TraceDirection = "backward" | "forward";

export interface TraceNode {
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  warehouseId: string;
  quantity: string;
  uom: string;
  unitCost: string;
  expiryDate: string;
  source: LotSource;
  status: LotStatus;
  depth: number;
  children: TraceNode[];
}

export interface TraceabilityReport {
  direction: TraceDirection;
  root: TraceNode;
}

export interface YieldReportParams {
  recipeId?: string;
  from?: string;
  to?: string;
}

export interface ValuationParams {
  warehouseId?: string;
  productType?: ProductType;
}
