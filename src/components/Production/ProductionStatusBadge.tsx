import { Chip } from "@mui/material";
import type { ProductionOrderStatus } from "../../types";

const COLORS: Record<
  ProductionOrderStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  DRAFT: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

const LABELS: Record<ProductionOrderStatus, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const ProductionStatusBadge = ({
  status,
}: {
  status: ProductionOrderStatus;
}) => (
  <Chip
    label={LABELS[status] ?? status}
    color={COLORS[status] ?? "default"}
    variant="outlined"
    size="small"
    sx={{ fontWeight: "bold" }}
  />
);

export default ProductionStatusBadge;
