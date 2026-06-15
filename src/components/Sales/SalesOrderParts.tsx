import { useTranslation } from "react-i18next";
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
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white w-full rounded-2xl border border-border p-[25px_20px]">
      <div className="flex gap-3 items-center">
        <p className="text-xl font-semibold">{order.orderNumber}</p>
        <SalesStatusBadge status={order.status} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-gray-500 text-sm">
        <div>
          <p>{t("sales.detail.customer")}</p>
          <p className="text-black mt-1">{customerName}</p>
        </div>
        <div>
          <p>{t("sales.detail.orderDate")}</p>
          <p className="text-black mt-1">{formatDate(order.orderDate)}</p>
        </div>
        <div>
          <p>{t("sales.detail.promised")}</p>
          <p className="text-black mt-1">{formatDate(order.promisedDate)}</p>
        </div>
        <div>
          <p>{t("sales.detail.total")}</p>
          <p className="text-black mt-1">
            {order.totalAmount} {order.currency}
          </p>
        </div>
        <div>
          <p>{t("sales.detail.subtotal")}</p>
          <p className="text-black mt-1">{order.subtotal}</p>
        </div>
        <div>
          <p>{t("sales.detail.tax")}</p>
          <p className="text-black mt-1">{order.taxAmount}</p>
        </div>
        <div>
          <p>{t("sales.detail.cogs")}</p>
          <p className="text-black mt-1">{displayCogs(order)}</p>
        </div>
        <div>
          <p>{t("sales.detail.grossMargin")}</p>
          <p className="text-black mt-1 font-semibold">{displayMargin(order)}</p>
        </div>
      </div>
    </div>
  );
};

export const LinesCard = ({
  lines,
  productName,
  showAllocations,
}: {
  lines: SalesOrderLine[];
  productName: (id: string) => string;
  showAllocations?: boolean;
}) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white rounded-xl border border-border mt-4">
    <div className="border-b border-border py-[15px]">
      <p className="pl-[25px]">{t("sales.detail.lineItems")}</p>
    </div>
    <div className="p-[15px_20px] text-sm">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-500 pb-2 border-b border-border">
        <p>{t("sales.detail.product")}</p>
        <p className="text-right">{t("sales.detail.ordered")}</p>
        <p className="text-right">{t("sales.detail.unitPrice")}</p>
        <p className="text-right">{t("sales.detail.lineTotal")}</p>
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
};

export const productMap = (products: Product[]) => {
  const m = new Map(products.map((p) => [p.id, p.name]));
  return (id: string) => m.get(id) ?? id;
};
