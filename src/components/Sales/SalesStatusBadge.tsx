import { Chip } from "@mui/material";
import type { SalesOrderStatus } from "../../types";

type Color =
  | "default"
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "success"
  | "error";

const COLORS: Record<SalesOrderStatus, Color> = {
  DRAFT: "default",
  CONFIRMED: "info",
  PICKED: "warning",
  DELIVERED: "success",
  INVOICED: "primary",
  SHIPPED: "info",
  CANCELLED: "error",
};

const LABELS: Record<SalesOrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PICKED: "Picked",
  DELIVERED: "Delivered",
  INVOICED: "Invoiced",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

const SalesStatusBadge = ({ status }: { status: SalesOrderStatus }) => (
  <Chip
    label={LABELS[status] ?? status}
    color={COLORS[status] ?? "default"}
    variant="outlined"
    size="small"
    sx={{ fontWeight: "bold" }}
  />
);

export default SalesStatusBadge;
