import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
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

const ProductionStatusBadge = ({
  status,
}: {
  status: ProductionOrderStatus;
}) => {
  const { t } = useTranslation();
  return (
    <Chip
      label={t(`production.status${status}`)}
      color={COLORS[status] ?? "default"}
      variant="outlined"
      size="small"
      sx={{ fontWeight: "bold" }}
    />
  );
};

export default ProductionStatusBadge;
