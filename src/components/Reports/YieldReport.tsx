import { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
} from "@mui/material";
import { FiBarChart2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import useYieldReport from "../../hooks/useYieldReport";
import useRecipes from "../../hooks/useRecipes";
import DelayedSkeleton from "../common/DelayedSkeleton";
import EmptyState from "../common/EmptyState";
import { formatMoney } from "./reportsUtils";
import BackButton from "../common/BackButton";

function YieldReport() {
  const { t } = useTranslation();
  const { data: recipes = [] } = useRecipes();
  const [recipeId, setRecipeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, error, isLoading } = useYieldReport({
    recipeId: recipeId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold">{t("reports.yieldTitle")}</h1>
      <p className="text-gray-400">{t("reports.yieldDesc")}</p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="yr-recipe">{t("reports.recipe")}</InputLabel>
          <Select
            labelId="yr-recipe"
            label={t("reports.recipe")}
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
          >
            <MenuItem value="">{t("reports.allRecipes")}</MenuItem>
            {recipes.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="date"
          label={t("reports.from")}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label={t("reports.to")}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </div>

      {error && (
        <p className="text-red-600 mt-4" role="alert">
          {t("reports.yieldError")}: {error.message}
        </p>
      )}

      <div className="mt-5 bg-white border border-border rounded-2xl p-5">
        <DelayedSkeleton
          loading={isLoading}
          skeleton={<Skeleton variant="rounded" height={200} />}
        >
          {data && data.rows.length === 0 && (
            <EmptyState
              title={t("reports.noBatches")}
              description={t("reports.noBatchesDesc")}
              icon={<FiBarChart2 />}
            />
          )}
          {data && data.rows.length > 0 && (
            <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label={t("reports.yieldTitle")}>
              <caption className="sr-only">{t("reports.yieldDesc")}</caption>
              <thead>
                <tr className="text-left text-gray-500 border-b border-border">
                  <th scope="col" className="py-2 font-medium">{t("reports.recipe")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.batches")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.planned")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.actual")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.avgYield")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.target")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.variance")}</th>
                  <th scope="col" className="py-2 font-medium text-right">{t("reports.totalCost")}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => {
                  const v = Number(r.yieldVariance);
                  return (
                    <tr key={r.recipeId} className="border-b border-border last:border-0">
                      <td className="py-2 font-medium">{r.recipeName}</td>
                      <td className="py-2 text-right">{r.batches}</td>
                      <td className="py-2 text-right">{r.plannedOutput}</td>
                      <td className="py-2 text-right">{r.actualOutput}</td>
                      <td className="py-2 text-right font-semibold">
                        {r.avgYieldPercent}%
                      </td>
                      <td className="py-2 text-right text-gray-500">
                        {r.expectedYieldPercent}%
                      </td>
                      <td
                        className={`py-2 text-right font-medium ${
                          v < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {v > 0 ? "+" : ""}
                        {r.yieldVariance}%
                      </td>
                      <td className="py-2 text-right">
                        {formatMoney(r.totalCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </DelayedSkeleton>
      </div>

      {data && (
        <p className="text-gray-400 text-sm mt-3">
          {t("reports.batchesInRange", { count: data.batchCount })}
        </p>
      )}
    </div>
  );
}

export default YieldReport;
