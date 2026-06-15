import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import usePickSalesOrder from "../../hooks/usePickSalesOrder";
import type { SalesOrderWithLines } from "../../types/sales";
import { useToast } from "../common/ToastContext";
import { HeaderCard, LinesCard } from "./SalesOrderParts";

interface Props {
  order: SalesOrderWithLines;
  customerName: string;
  productName: (id: string) => string;
}

function ConfirmedView({ order, customerName, productName }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const { mutate, isPending } = usePickSalesOrder(order.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span />
        <Button
          variant="contained"
          color="error"
          disabled={isPending}
          onClick={() =>
            mutate(undefined, {
              onSuccess: () => toast.success(t("sales.confirmed.pickedSuccess")),
              onError: () => toast.error(t("sales.confirmed.pickError")),
            })
          }
        >
          {t("sales.confirmed.pick")}
        </Button>
      </div>
      <HeaderCard order={order} customerName={customerName} />
      <LinesCard
        lines={order.lines}
        productName={productName}
        showAllocations
      />
      <p className="text-xs text-gray-400 mt-2">
        {t("sales.confirmed.reservedNote")}
      </p>
    </div>
  );
}

export default ConfirmedView;
