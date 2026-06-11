import { Button } from "@mui/material";
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
              onSuccess: () => toast.success("Order picked"),
              onError: () => toast.error("Failed to pick order"),
            })
          }
        >
          Pick
        </Button>
      </div>
      <HeaderCard order={order} customerName={customerName} />
      <LinesCard
        lines={order.lines}
        productName={productName}
        showAllocations
      />
      <p className="text-xs text-gray-400 mt-2">
        Lots are reserved. Stock is not drawn down until delivery.
      </p>
    </div>
  );
}

export default ConfirmedView;
