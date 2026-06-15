import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
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

const SalesStatusBadge = ({ status }: { status: SalesOrderStatus }) => {
  const { t } = useTranslation();
  return (
    <Chip
      label={t(`enums.${status}`, { defaultValue: status })}
      color={COLORS[status] ?? "default"}
      variant="outlined"
      size="small"
      sx={{ fontWeight: "bold" }}
    />
  );
};

export default SalesStatusBadge;
