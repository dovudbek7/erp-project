// Display formatting helpers for reports. Underlying values are decimal
// strings — these are for presentation only.

const uzs = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// Compact money for KPI cards: "4 222 800 UZS".
export const formatMoney = (v: string | number, currency = "UZS") =>
  `${uzs.format(Math.round(Number(v))).replace(/,/g, " ")} ${currency}`;

export const formatNumber = (v: string | number, digits = 0) =>
  Number(v).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

// "May 3" style short date for chart ticks.
export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
