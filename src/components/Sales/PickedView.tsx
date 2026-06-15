import { Button } from "@mui/material";
import { useState } from "react";
import type { SalesOrderWithLines } from "../../types/sales";
import DeliverModal from "./DeliverModal";
import { HeaderCard, LinesCard } from "./SalesOrderParts";

interface Props {
  order: SalesOrderWithLines;
  customerName: string;
  productName: (id: string) => string;
}

function PickedView({ order, customerName, productName }: Props) {
  const [deliverOpen, setDeliverOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span />
        <Button
          variant="contained"
          color="error"
          onClick={() => setDeliverOpen(true)}
        >
          Deliver
        </Button>
      </div>
      <HeaderCard order={order} customerName={customerName} />
      <LinesCard
        lines={order.lines}
        productName={productName}
        showAllocations
      />
      <DeliverModal
        orderId={order.id}
        open={deliverOpen}
        onClose={() => setDeliverOpen(false)}
      />
    </div>
  );
}

export default PickedView;
