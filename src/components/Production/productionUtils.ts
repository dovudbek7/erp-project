import Decimal from "decimal.js";
import type { ProductionOrderInput, Product, ConsumedLot } from "../../types";

// Derived calculations for the production screens. All money/quantity
// values are decimal strings — never parseFloat them; route through Decimal.

export const MEAT_CATEGORIES = new Set(["Beef", "Pork", "Lamb"]);

const D = (v: string | number | null | undefined) => new Decimal(v || 0);

export const isMeat = (product?: Product | null) =>
  !!product && MEAT_CATEGORIES.has(product.category);

// Variance of actual vs planned, as a signed percentage number.
// null when there is no actual entered yet, or planned is zero.
export const variancePercent = (
  planned: string | null | undefined,
  actual: string | null | undefined,
): number | null => {
  if (actual === null || actual === undefined || actual === "") return null;
  const p = D(planned);
  if (p.isZero()) return null;
  return D(actual).minus(p).div(p).times(100).toNumber();
};

// Cost of a single input row from its consumed lots: Σ qty × unitCost.
export const inputCost = (input: ProductionOrderInput): Decimal =>
  input.consumedLots.reduce(
    (acc, cl) => acc.plus(D(cl.quantity).times(D(cl.unitCost))),
    new Decimal(0),
  );

export const lotConsumedQty = (lots: ConsumedLot[]): Decimal =>
  lots.reduce((acc, cl) => acc.plus(D(cl.quantity)), new Decimal(0));

// Total mass of inputs consumed so far (sum of actual quantities).
export const totalActualMass = (inputs: ProductionOrderInput[]): Decimal =>
  inputs.reduce((acc, i) => acc.plus(D(i.actualQuantity)), new Decimal(0));

// Total cost across all input rows so far.
export const totalCost = (inputs: ProductionOrderInput[]): Decimal =>
  inputs.reduce((acc, i) => acc.plus(inputCost(i)), new Decimal(0));

// Mass of MEAT-type inputs only — the yield denominator.
export const meatActualMass = (
  inputs: ProductionOrderInput[],
  productsById: Map<string, Product>,
): Decimal =>
  inputs.reduce((acc, i) => {
    const p = productsById.get(i.productId);
    return isMeat(p) ? acc.plus(D(i.actualQuantity)) : acc;
  }, new Decimal(0));

// yield % = actual output / meat input mass × 100
export const yieldPercent = (
  actualOutput: string | number,
  meatMass: Decimal,
): Decimal =>
  meatMass.greaterThan(0)
    ? D(actualOutput).div(meatMass).times(100)
    : new Decimal(0);

// unit output cost = total input cost / actual output
export const unitOutputCost = (
  totalInput: Decimal,
  actualOutput: string | number,
): Decimal =>
  D(actualOutput).greaterThan(0)
    ? totalInput.div(D(actualOutput))
    : new Decimal(0);

export const fmtMoney = (v: Decimal | string | number) =>
  D(v as never).toFixed(2);
export const fmtQty = (v: Decimal | string | number) =>
  D(v as never).toFixed(3);
export const fmtPct = (v: Decimal | string | number) =>
  D(v as never).toFixed(1);

// Add N days to an ISO/yyyy-mm-dd date → yyyy-mm-dd. For expiry suggestion.
export const addDays = (from: string, days: number): string => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
