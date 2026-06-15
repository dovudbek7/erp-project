import type { SalesOrderWithLines } from "../../types/sales";
import { HeaderCard, LinesCard } from "./SalesOrderParts";

interface Props {
  order: SalesOrderWithLines;
  customerName: string;
  productName: (id: string) => string;
  // INVOICED/SHIPPED/CANCELLED reuse this read-only summary.
  terminalNote?: string;
}

function DeliveredView({
  order,
  customerName,
  productName,
  terminalNote,
}: Props) {
  return (
    <div>
      <HeaderCard order={order} customerName={customerName} />
      <LinesCard
        lines={order.lines}
        productName={productName}
        showAllocations
      />
      <p className="text-xs text-gray-400 mt-2">
        {terminalNote ??
          "Delivered. COGS and gross margin are now final. Invoicing is handled in the next phase."}
      </p>
    </div>
  );
}

export default DeliveredView;
