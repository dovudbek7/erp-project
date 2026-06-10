import Decimal from "decimal.js";

// All money/quantity values in the data model are decimal STRINGS.
// Never use parseFloat/Number on them — route every operation through here.

export const D = (v: string | number): Decimal => new Decimal(v || 0);

export const add = (a: string | number, b: string | number) =>
  D(a).plus(D(b)).toString();
export const sub = (a: string | number, b: string | number) =>
  D(a).minus(D(b)).toString();
export const mul = (a: string | number, b: string | number) =>
  D(a).times(D(b)).toString();

export const gt = (a: string | number, b: string | number) =>
  D(a).greaterThan(D(b));
export const gte = (a: string | number, b: string | number) =>
  D(a).greaterThanOrEqualTo(D(b));
export const lte = (a: string | number, b: string | number) =>
  D(a).lessThanOrEqualTo(D(b));
export const eq = (a: string | number, b: string | number) => D(a).equals(D(b));

// Sum an array of decimal strings.
export const sum = (xs: (string | number)[]) =>
  xs.reduce<Decimal>((acc, x) => acc.plus(D(x)), D(0)).toString();

// remaining = ordered - received
export const remaining = (ordered: string | number, received: string | number) =>
  sub(ordered, received);

// Format helpers — money to 2dp, quantity to 3dp (matches mock-data formatting).
export const money = (v: string | number) => D(v).toFixed(2); // "6500000.00"
export const qty = (v: string | number) => D(v).toFixed(3); // "100.000"
