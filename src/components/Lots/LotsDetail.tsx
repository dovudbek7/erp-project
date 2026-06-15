import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import useLotsDetail from "../../hooks/useLotsDetail";
import useMovements from "../../hooks/useMovements";
import formatDate from "../../utilties/formatDate";
import ExpiryBadge from "../common/ExpiryBadge";
import Status from "../common/StatusBadge";
import BackButton from "../common/BackButton";
import MovementIcon from "./MovementTypeIcon";

const StockMovements = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = useMovements(id || "");

  // console.log(data);
  return (
    <>
      <div className="bg-white w-full max-w-[800px] rounded-xl border border-border">
        <div className="border-b border-border py-[15px] flex justify-between items-center px-4 md:px-[25px]">
          <p className="">{t("lotsDetail.stockMovements")}</p>
          <p className="font-thing text-gray-500 text-sm">
            {t("lotsDetail.newFirst")} · {data?.length}{" "}
            {t("lotsDetail.entries")}
          </p>
        </div>
        <div className="p-[20px_20px]">
          <div className="border-l-2 border-border pl-3 flex flex-col gap-5 ">
            {data?.map((d) => (
              <div className="flex items-start justify-between" key={d.id}>
                <div className="flex items-start ">
                  <MovementIcon type={d?.type} />
                  <div className="pl-5">
                    <p className="font-semibold text-sm ">{d.type}</p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(d.performedAt)} · Ref: {d.referenceId}
                    </p>
                  </div>
                </div>
                <div className="">
                  <p
                    className={` ${Number(d.quantity) < 0 ? "text-error" : "text-success"}`}
                  >
                    {d.quantity} {d.uom}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const LDetail = () => {
  const { id } = useParams();

  const { t } = useTranslation();
  const { data } = useLotsDetail(id || "");
  return (
    <div className="bg-white max-w-[800px] rounded-xl border border-border">
      <div className="border-b border-border py-[15px]">
        <p className="pl-[25px]">{t("lotsDetail.detail")}</p>
      </div>
      <div className="p-[25px_20px] text-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("lotsDetail.productionDate")}</p>
          <p className="font-bold">{formatDate(data?.productionDate)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("lotsDetail.expiryDate")}</p>
          <p className="font-bold">{formatDate(data?.expiryDate)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("lotsDetail.receivedAt")}</p>
          <p className="font-bold">{formatDate(data?.receivedAt)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("lotsDetail.currency")}</p>
          <p className="font-bold">{data?.currency}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("lotsDetail.supplierLotRef")}</p>
          <p className="font-bold">{data?.supplierLotRef}</p>
        </div>
      </div>
    </div>
  );
};

function LotsDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data, error, isLoading } = useLotsDetail(id || "");

  if (isLoading) return <p>{t("common.loading")}</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div className="">
        <BackButton />
        <p className="text-xl font-semibold">{data?.lotNumber}</p>
        <div className="bg-white w-full rounded-2xl border border-border mt-3 p-[25px_20px]">
          <div className="flex gap-3 items-center">
            {" "}
            <p className="text-xl font-semibold">{data?.lotNumber}</p>
            <Status status={data?.status || ""} />
            <ExpiryBadge expiryDate={data?.expiryDate || ""} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3 text-gray-500">
            <div className="col ">
              <p className="">{t("lotsDetail.unitCost")}</p>
              <p className="text-black mt-2">
                {data?.currentQuantity} {data?.uom}
              </p>
            </div>
            <div className="col ">
              <p>{t("lotsDetail.initialQuantity")}</p>
              <p className="text-black mt-2">
                {data?.initialQuantity} {data?.uom}
              </p>
            </div>
            <div className="col ">
              <p>{t("lotsDetail.unitCost")}</p>
              <p className="text-black mt-2">
                {data?.unitCost} {data?.currency}{" "}
                <span className="text-gray-400 text-sm font-thin">
                  /{data?.uom}
                </span>
              </p>
            </div>
            <div className="col ">
              <p>{t("lotsDetail.totalVal")}</p>
              <p className="text-black mt-2">
                {Number(data?.unitCost) * Number(data?.initialQuantity)}{" "}
                {data?.currency}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] mt-4 gap-3">
          <StockMovements />
          <LDetail />
        </div>
      </div>
    </>
  );
}

export default LotsDetail;
