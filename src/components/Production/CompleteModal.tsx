import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Product } from "../../types";
import type { ProductionOrderWithDetail } from "../../types/production";
import useWarehouse from "../../hooks/useWarehouse";
import useCompleteProduction from "../../hooks/useCompleteProduction";
import {
  addDays,
  fmtMoney,
  fmtPct,
  meatActualMass,
  totalCost,
  unitOutputCost,
  yieldPercent,
} from "./productionUtils";

interface Props {
  order: ProductionOrderWithDetail;
  productsById: Map<string, Product>;
  open: boolean;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

function CompleteModal({ order, productsById, open, onClose }: Props) {
  const { t } = useTranslation();
  const { data: warehouses = [] } = useWarehouse();
  const complete = useCompleteProduction(order.id);

  const outputProduct = order.recipe
    ? productsById.get(order.recipe.outputProductId)
    : undefined;

  const suggestedLotNumber = useMemo(() => {
    const sku = outputProduct?.sku ?? "FG";
    return `${sku}-${today().replace(/-/g, "")}-001`;
  }, [outputProduct]);

  const suggestedExpiry = outputProduct?.shelfLifeDays
    ? addDays(today(), outputProduct.shelfLifeDays)
    : addDays(today(), 7);

  const [actualOutput, setActualOutput] = useState(
    order.plannedOutputQuantity,
  );
  const [lotNumber, setLotNumber] = useState(suggestedLotNumber);
  const [expiryDate, setExpiryDate] = useState(suggestedExpiry);
  // Pre-select the finished-goods warehouse (FG-A) per the workflow.
  const [warehouseId, setWarehouseId] = useState(
    warehouses.find((w) => w.code === "FG-A")?.id ?? "wh-003",
  );
  const [notes, setNotes] = useState("");

  // Live derived preview.
  const meatMass = useMemo(
    () => meatActualMass(order.inputs, productsById),
    [order.inputs, productsById],
  );
  const inputCostTotal = useMemo(
    () => totalCost(order.inputs),
    [order.inputs],
  );
  const previewYield = yieldPercent(actualOutput || 0, meatMass);
  const previewUnitCost = unitOutputCost(inputCostTotal, actualOutput || 0);

  const submit = () => {
    complete.mutate(
      {
        actualOutputQuantity: actualOutput,
        outputLotNumber: lotNumber,
        expiryDate,
        outputWarehouseId: warehouseId,
        notes: notes || null,
      },
      { onSuccess: () => onClose() },
    );
  };

  const valid = Number(actualOutput) > 0 && !!lotNumber && !!expiryDate;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {t("production.completeTitle")} — {order.orderNumber}
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-5 pt-2">
          <TextField
            label={t("production.actualOutputKg")}
            type="number"
            value={actualOutput}
            onChange={(e) => setActualOutput(e.target.value)}
            required
          />

          <TextField
            label={t("production.outputLotNumber")}
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            helperText={t("production.autoSuggested")}
            required
          />

          <TextField
            label={t("production.expiryDate")}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={
              outputProduct?.shelfLifeDays
                ? t("production.fromShelfLife", {
                    days: outputProduct.shelfLifeDays,
                  })
                : undefined
            }
            required
          />

          <FormControl fullWidth>
            <InputLabel id="out-wh-label">
              {t("production.outputWarehouse")}
            </InputLabel>
            <Select
              labelId="out-wh-label"
              label={t("production.outputWarehouse")}
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t("production.notes")}
            multiline
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Live preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 bg-gray-50">
              <p className="text-gray-500 text-sm">{t("production.yield")}</p>
              <p className="text-2xl font-bold">{fmtPct(previewYield)}%</p>
              <p className="text-gray-400 text-xs">
                {actualOutput || 0} / {meatMass.toFixed(3)}{" "}
                {t("production.meatInput")}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-gray-50">
              <p className="text-gray-500 text-sm">
                {t("production.unitOutputCost")}
              </p>
              <p className="text-2xl font-bold">{fmtMoney(previewUnitCost)}</p>
              <p className="text-gray-400 text-xs">
                {t("production.totalInput")} {fmtMoney(inputCostTotal)}
              </p>
            </div>
          </div>

          {complete.isError && (
            <p className="text-red-500 text-sm" role="alert">
              {t("production.completeError")}
            </p>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("production.cancel")}</Button>
        <Button
          variant="contained"
          color="error"
          disabled={!valid || complete.isPending}
          onClick={submit}
        >
          {complete.isPending
            ? t("production.completing")
            : t("production.completeProduction")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompleteModal;
