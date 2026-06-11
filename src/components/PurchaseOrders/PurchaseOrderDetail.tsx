import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import useGoodsReceipts from "../../hooks/useGoodsReceipts";
import useProducts from "../../hooks/useProducts";
import usePurchaseOrder from "../../hooks/usePurchaseOrder";
import useSuppliers from "../../hooks/useSuppliers";
import useWarehouse from "../../hooks/useWarehouse";
import formatDate from "../../utilties/formatDate";
import { gte, remaining } from "../../utilties/money";
import BackButton from "../common/BackButton";
import Status from "../common/StatusBadge";

function PurchaseOrderDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = usePurchaseOrder(id || "");
  const { data: receipts = [] } = useGoodsReceipts(id || "");
  const { data: suppliers = [] } = useSuppliers();
  const { data: warehouses = [] } = useWarehouse();
  const { data: products = [] } = useProducts();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  if (!order) return <p>Not found</p>;

  const supplier = suppliers.find((s) => s.id === order.supplierId);
  const warehouse = warehouses.find((w) => w.id === order.warehouseId);
  const productName = (pid: string) =>
    products.find((p) => p.id === pid)?.name ?? pid;

  const fullyReceived =
    order.status === "RECEIVED" ||
    order.lines.every((l) => gte(l.receivedQuantity, l.orderedQuantity));

  return (
    <div className="">
      <BackButton />
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">{order.poNumber}</p>
        {!fullyReceived && order.status !== "CANCELLED" && (
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate(`/purchase-orders/${order.id}/receive`)}
          >
            {t("poDetail.receiveGoods")}
          </Button>
        )}
      </div>

      <div className="bg-white w-full rounded-2xl border border-border mt-3 p-[25px_20px]">
        <div className="flex gap-3 items-center">
          <p className="text-xl font-semibold">{order.poNumber}</p>
          <Status status={order.status} />
        </div>
        <div className="grid grid-cols-4 mt-3 text-gray-500">
          <div className="col">
            <p>{t("poDetail.supplier")}</p>
            <p className="text-black mt-2">{supplier?.name ?? order.supplierId}</p>
          </div>
          <div className="col">
            <p>{t("poDetail.warehouse")}</p>
            <p className="text-black mt-2">
              {warehouse?.name ?? order.warehouseId}
            </p>
          </div>
          <div className="col">
            <p>{t("poDetail.expectedDate")}</p>
            <p className="text-black mt-2">{formatDate(order.expectedDate)}</p>
          </div>
          <div className="col">
            <p>{t("poDetail.total")}</p>
            <p className="text-black mt-2">
              {order.totalAmount} {order.currency}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] mt-4 gap-3">
        {/* Lines */}
        <div className="bg-white rounded-xl border border-border">
          <div className="border-b border-border py-[15px]">
            <p className="pl-[25px]">{t("poDetail.lines")}</p>
          </div>
          <div className="p-[15px_20px] text-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-500 pb-2 border-b border-border">
              <p>{t("poDetail.product")}</p>
              <p className="text-right">{t("poDetail.ordered")}</p>
              <p className="text-right">{t("poDetail.received")}</p>
              <p className="text-right">{t("poDetail.remaining")}</p>
            </div>
            {order.lines.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] py-2 border-b border-border last:border-0"
              >
                <p className="font-medium">{productName(l.productId)}</p>
                <p className="text-right">
                  {l.orderedQuantity} {l.uom}
                </p>
                <p className="text-right">{l.receivedQuantity}</p>
                <p className="text-right font-semibold">
                  {remaining(l.orderedQuantity, l.receivedQuantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt history */}
        <div className="bg-white rounded-xl border border-border">
          <div className="border-b border-border py-[15px] flex justify-between px-[25px]">
            <p>{t("poDetail.history")}</p>
            <p className="text-gray-500 text-sm">
              {receipts.length} {t("poDetail.receipts")}
            </p>
          </div>
          <div className="p-[20px]">
            {receipts.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("poDetail.noReceipts")}</p>
            ) : (
              <div className="border-l-2 border-border pl-3 flex flex-col gap-4">
                {receipts.map((r) => (
                  <div key={r.id}>
                    <p className="font-semibold text-sm">{r.receiptNumber}</p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(r.receivedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderDetail;
