import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import useProductsDetail from "../../hooks/useProductsDetail";
import formatDate from "../../utilties/formatDate";

const Detail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data } = useProductsDetail(id || "");

  return (
    <div className="bg-white max-w-[800px] rounded-xl border border-border">
      <div className="border-b border-border py-[15px]">
        <p className="pl-[25px]">{t("productDetail.information")}</p>
      </div>
      <div className="p-[25px_20px] text-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("productDetail.category")}</p>
          <p className="font-bold">{data?.category}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("productDetail.shelfLife")}</p>
          <p className="font-bold">
            {data?.shelfLifeDays
              ? `${data?.shelfLifeDays} ${t("productDetail.days")}`
              : "—"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("productDetail.barcode")}</p>
          <p className="font-bold">{data?.barcode || "—"}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">{t("productDetail.createdAt")}</p>
          <p className="font-bold">{formatDate(data?.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

const Notes = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data } = useProductsDetail(id || "");

  return (
    <div className="bg-white max-w-[800px] rounded-xl border border-border">
      <div className="border-b border-border py-[15px]">
        <p className="pl-[25px]">{t("productDetail.notes")}</p>
      </div>
      <div className="p-[20px_25px] text-sm">
        <p className="text-gray-600">
          {data?.notes || t("productDetail.noNotes")}
        </p>
      </div>
    </div>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data, error, isLoading } = useProductsDetail(id || "");

  if (isLoading) return <p>Loading</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div className="">
        <p className="text-xl font-semibold">{data?.name}</p>
        <div className="bg-white w-full rounded-2xl border border-border mt-3 p-[25px_20px]">
          <div className="flex gap-3 items-center">
            <p className="text-xl font-semibold">{data?.name}</p>
            <Chip
              label={data?.type}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: "bold", textTransform: "capitalize" }}
            />
            <Chip
              label={
                data?.isActive
                  ? t("productDetail.active")
                  : t("productDetail.inactive")
              }
              color={data?.isActive ? "success" : "error"}
              variant="outlined"
              size="small"
              sx={{ fontWeight: "bold", textTransform: "capitalize" }}
            />
          </div>
          <div className="grid grid-cols-4 mt-3 text-gray-500">
            <div className="col">
              <p>{t("productDetail.sku")}</p>
              <p className="text-black mt-2">{data?.sku}</p>
            </div>
            <div className="col">
              <p>{t("productDetail.uom")}</p>
              <p className="text-black mt-2">{data?.uom}</p>
            </div>
            <div className="col">
              <p>{t("productDetail.category")}</p>
              <p className="text-black mt-2">{data?.category}</p>
            </div>
            <div className="col">
              <p>{t("productDetail.type")}</p>
              <p className="text-black mt-2">{data?.type}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] mt-4 gap-3">
          <Detail />
          <Notes />
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
