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
      <DialogTitle>Complete production — {order.orderNumber}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-5 pt-2">
          <TextField
            label="Actual output (KG)"
            type="number"
            value={actualOutput}
            onChange={(e) => setActualOutput(e.target.value)}
            required
          />

          <TextField
            label="Output lot number"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            helperText="Auto-suggested — editable"
            required
          />

          <TextField
            label="Expiry date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={
              outputProduct?.shelfLifeDays
                ? `From shelf life of ${outputProduct.shelfLifeDays} days`
                : undefined
            }
            required
          />

          <FormControl fullWidth>
            <InputLabel id="out-wh-label">Output warehouse</InputLabel>
            <Select
              labelId="out-wh-label"
              label="Output warehouse"
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
            label="Notes"
            multiline
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Live preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 bg-gray-50">
              <p className="text-gray-500 text-sm">Yield</p>
              <p className="text-2xl font-bold">{fmtPct(previewYield)}%</p>
              <p className="text-gray-400 text-xs">
                {actualOutput || 0} / {meatMass.toFixed(3)} kg meat input
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-gray-50">
              <p className="text-gray-500 text-sm">Unit output cost</p>
              <p className="text-2xl font-bold">{fmtMoney(previewUnitCost)}</p>
              <p className="text-gray-400 text-xs">
                total input {fmtMoney(inputCostTotal)}
              </p>
            </div>
          </div>

          {complete.isError && (
            <p className="text-red-500 text-sm">
              Could not complete the order. Try again.
            </p>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          disabled={!valid || complete.isPending}
          onClick={submit}
        >
          {complete.isPending ? "Completing…" : "Complete production"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompleteModal;
