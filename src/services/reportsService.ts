import { axiosInstance } from "./apiClient";
import type { DashboardReport } from "../types/reports";

interface BackendDashboard {
  stock_on_hand: number;
  lots_expiring_soon: number;
  active_production: number;
  todays_output: number;
  outstanding_ar: number;
  production_output: Record<string, string>;
  lots_expiring_this_week: Array<{
    lot_number: number;
    product: string;
    quantity: number;
    uom: string;
    expires_at: string;
    status: string;
  }>;
}

function adaptDashboard(d: BackendDashboard): DashboardReport {
  return {
    stockOnHandValue: String(d.stock_on_hand ?? 0),
    activeProductionOrders: d.active_production ?? 0,
    todayProductionOutput: String(d.todays_output ?? 0),
    outstandingAR: String(d.outstanding_ar ?? 0),
    currency: "UZS",
    lotsExpiringSoon: (d.lots_expiring_this_week ?? []).map((l) => ({
      lotId: String(l.lot_number),
      lotNumber: String(l.lot_number),
      productId: "",
      productName: l.product,
      warehouseId: "",
      currentQuantity: String(l.quantity),
      uom: l.uom,
      expiryDate: l.expires_at,
      daysToExpiry: 0,
      value: "0",
    })),
    productionOutput30d: Object.entries(d.production_output ?? {}).map(([date, qty]) => ({
      date,
      quantity: Number(qty),
    })),
  };
}

const reportsService = {
  dashboard: () =>
    axiosInstance.get<BackendDashboard>("dashboard").then((r) => adaptDashboard(r.data)),

  // Not in backend
  yield: (_params?: any) => Promise.resolve(null),
  valuation: (_params?: any) => Promise.resolve(null),
  traceability: (_lotId?: string, _dir?: any) => Promise.resolve(null),
};

export default reportsService;
