import type { Product, SalesOrderLine } from "../../types";
import type { SalesOrderWithLines } from "../../types/sales";
import formatDate from "../../utilties/formatDate";
import { displayCogs, displayMargin } from "./salesUtils";
import SalesStatusBadge from "./SalesStatusBadge";

export const HeaderCard = ({
  order,
  customerName,
}: {
  order: SalesOrderWithLines;
  customerName: string;
}) => (
  <div className="bg-white w-full rounded-2xl border border-border p-[25px_20px]">
    <div className="flex gap-3 items-center">
      <p className="text-xl font-semibold">{order.orderNumber}</p>
      <SalesStatusBadge status={order.status} />
    </div>
    <div className="grid grid-cols-4 gap-4 mt-3 text-gray-500 text-sm">
      <div>
        <p>Customer</p>
        <p className="text-black mt-1">{customerName}</p>
      </div>
      <div>
        <p>Order date</p>
        <p className="text-black mt-1">{formatDate(order.orderDate)}</p>
      </div>
      <div>
        <p>Promised</p>
        <p className="text-black mt-1">{formatDate(order.promisedDate)}</p>
      </div>
      <div>
        <p>Total</p>
        <p className="text-black mt-1">
          {order.totalAmount} {order.currency}
        </p>
      </div>
      <div>
        <p>Subtotal</p>
        <p className="text-black mt-1">{order.subtotal}</p>
      </div>
      <div>
        <p>Tax</p>
        <p className="text-black mt-1">{order.taxAmount}</p>
      </div>
      <div>
        <p>COGS</p>
        <p className="text-black mt-1">{displayCogs(order)}</p>
      </div>
      <div>
        <p>Gross margin</p>
        <p className="text-black mt-1 font-semibold">{displayMargin(order)}</p>
      </div>
    </div>
  </div>
);

export const LinesCard = ({
  lines,
  productName,
  showAllocations,
}: {
  lines: SalesOrderLine[];
  productName: (id: string) => string;
  showAllocations?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-border mt-4">
    <div className="border-b border-border py-[15px]">
      <p className="pl-[25px]">Line items</p>
    </div>
    <div className="p-[15px_20px] text-sm">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-500 pb-2 border-b border-border">
        <p>Product</p>
        <p className="text-right">Ordered</p>
        <p className="text-right">Unit price</p>
        <p className="text-right">Line total</p>
      </div>
      {lines.map((l) => (
        <div
          key={l.id}
          className="py-2 border-b border-border last:border-0"
        >
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
            <p className="font-medium">{productName(l.productId)}</p>
            <p className="text-right">
              {l.orderedQuantity} {l.uom}
            </p>
            <p className="text-right">{l.unitPrice}</p>
            <p className="text-right">{l.lineTotal}</p>
          </div>
          {showAllocations && l.allocatedLots.length > 0 && (
            <div className="mt-1 pl-2 border-l-2 border-border text-xs text-gray-500">
              {l.allocatedLots.map((a) => (
                <p key={a.lotId}>
                  {a.lotId} · {a.quantity} @ {a.unitCost}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const productMap = (products: Product[]) => {
  const m = new Map(products.map((p) => [p.id, p.name]));
  return (id: string) => m.get(id) ?? id;
};
