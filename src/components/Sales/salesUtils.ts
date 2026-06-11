import type { AllocatedLot, SalesOrder } from "../../types";
import { add, money, mul, sub, sum } from "../../utilties/money";

export const TAX_RATE = "0.12"; // 12% UZS

interface LineLike {
  orderedQuantity: string;
  unitPrice: string;
}

export const subtotalOf = (lines: LineLike[]) =>
  money(sum(lines.map((l) => mul(l.orderedQuantity || 0, l.unitPrice || 0))));

export const taxOf = (subtotal: string) => money(mul(subtotal, TAX_RATE));

export const totalOf = (subtotal: string) =>
  money(add(subtotal, taxOf(subtotal)));

export const cogsOf = (allocs: AllocatedLot[]) =>
  money(sum(allocs.map((a) => mul(a.quantity || 0, a.unitCost || 0))));

export const marginOf = (subtotal: string, cogs: string) =>
  money(sub(subtotal, cogs));

// COGS / margin are not real until the order is DELIVERED. Show an em dash
// before then — never zero.
const SETTLED = new Set(["DELIVERED", "INVOICED"]);

export const displayCogs = (order: SalesOrder) =>
  SETTLED.has(order.status) && order.totalCogs != null
    ? order.totalCogs
    : "—";

export const displayMargin = (order: SalesOrder) =>
  SETTLED.has(order.status) && order.grossMargin != null
    ? order.grossMargin
    : "—";
