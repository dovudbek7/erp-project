import { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
} from "@mui/material";
import { FiPackage } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import useInventoryValuation from "../../hooks/useInventoryValuation";
import useWarehouse from "../../hooks/useWarehouse";
import DelayedSkeleton from "../common/DelayedSkeleton";
import EmptyState from "../common/EmptyState";
import { formatMoney } from "./reportsUtils";
import type { ProductType } from "../../types";
import BackButton from "../common/BackButton";

const TYPE_KEYS: Record<string, string> = {
  RAW_MATERIAL: "reports.rawMaterial",
  PACKAGING: "reports.packaging",
  FINISHED_GOOD: "reports.finishedGood",
};

function InventoryValuation() {
  const { t } = useTranslation();
  const { data: warehouses = [] } = useWarehouse();
  const [warehouseId, setWarehouseId] = useState("");
  const [productType, setProductType] = useState<string>("");

  const { data, error, isLoading } = useInventoryValuation({
    warehouseId: warehouseId || undefined,
    productType: (productType || undefined) as ProductType | undefined,
  });

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold">{t("reports.valuationTitle")}</h1>
      <p className="text-gray-400">{t("reports.valuationDesc")}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="iv-wh">{t("reports.warehouse")}</InputLabel>
          <Select
            labelId="iv-wh"
            label={t("reports.warehouse")}
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <MenuItem value="">{t("reports.allWarehouses")}</MenuItem>
            {warehouses.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name} ({w.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="iv-type">{t("reports.productType")}</InputLabel>
          <Select
            labelId="iv-type"
            label={t("reports.productType")}
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <MenuItem value="">{t("reports.allTypes")}</MenuItem>
            {Object.entries(TYPE_KEYS).map(([v, key]) => (
              <MenuItem key={v} value={v}>
                {t(key)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {error && (
        <p className="text-red-600 mt-4" role="alert">
          {t("reports.valuationError")}: {error.message}
        </p>
      )}

      <div className="mt-5 bg-white border border-border rounded-2xl p-5">
        <DelayedSkeleton
          loading={isLoading}
          skeleton={<Skeleton variant="rounded" height={200} />}
        >
          {data && data.rows.length === 0 && (
            <EmptyState
              title={t("reports.noMatch")}
              description={t("reports.noMatchDesc")}
              icon={<FiPackage />}
            />
          )}
          {data && data.rows.length > 0 && (
            <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={t("reports.valuationTitle")}>
              <caption className="sr-only">{t("reports.valuationDesc")}</caption>
              <thead>
                <tr className="text-left text-gray-500 border-b border-border">
                  <th scope="col" className="py-2 font-medium">{t("reports.warehouse")}</th>
                  <th scope="col" className="py-2 font-medium">{t("reports.productType")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.lots")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.qty")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.value")}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr
                    key={`${r.warehouseId}-${r.productType}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2 font-medium">{r.warehouseName}</td>
                    <td className="py-2 text-gray-600">
                      {TYPE_KEYS[r.productType]
                        ? t(TYPE_KEYS[r.productType])
                        : r.productType}
                    </td>
                    <td className="py-2 text-right">{r.lotCount}</td>
                    <td className="py-2 text-right">{r.totalQuantity}</td>
                    <td className="py-2 text-right font-medium">
                      {formatMoney(r.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2" colSpan={4}>
                    {t("reports.grandTotal")}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(data.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
            </div>
          )}
        </DelayedSkeleton>
      </div>
    </div>
  );
}

export default InventoryValuation;
