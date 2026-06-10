import { Button, Chip, IconButton } from "@mui/material";
import { FiX } from "react-icons/fi";
import useSuggestLots from "../../hooks/useSuggestLots";
import ExpiryBadge from "../common/ExpiryBadge";
import type { ConsumedLot } from "../../types";
import type { SuggestedLot } from "../../types/production";

interface Props {
  orderId: string;
  productId: string;
  productName: string;
  // Quantity we want to source — drives the FEFO allocation.
  quantity: string;
  onUse: (lots: ConsumedLot[], override?: string) => void;
  onClose: () => void;
}

const toConsumed = (l: SuggestedLot): ConsumedLot => ({
  lotId: l.lotId,
  quantity: l.suggestedQuantity,
  unitCost: l.unitCost,
});

// Side panel that opens when an input row is focused. Shows FEFO lot
// suggestions and pre-fills the row's consumedLots when the operator
// picks one. Choosing a lot other than the top suggestion is treated as
// an override and recorded in the row's notes.
function SuggestLotsPanel({
  orderId,
  productId,
  productName,
  quantity,
  onUse,
  onClose,
}: Props) {
  const { data, isLoading } = useSuggestLots(
    orderId,
    productId,
    quantity || "0",
    true,
  );

  const suggestions = data?.suggestions ?? [];
  const top = suggestions.find((s) => Number(s.suggestedQuantity) > 0);

  const pickLot = (lot: SuggestedLot) => {
    // Default the take to the FEFO-suggested qty, falling back to whatever
    // is available if this lot wasn't part of the allocation.
    const consumed: ConsumedLot = {
      lotId: lot.lotId,
      quantity:
        Number(lot.suggestedQuantity) > 0
          ? lot.suggestedQuantity
          : lot.availableQuantity,
      unitCost: lot.unitCost,
    };
    const override =
      top && lot.lotId !== top.lotId
        ? `Operator override: used ${lot.lotNumber} instead of suggested ${top.lotNumber}`
        : undefined;
    onUse([consumed], override);
  };

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Suggested lots</p>
          <p className="text-gray-400 text-xs">{productName} · FEFO</p>
        </div>
        <IconButton size="small" onClick={onClose}>
          <FiX />
        </IconButton>
      </div>

      <div className="p-3 flex flex-col gap-2 max-h-[340px] overflow-y-auto">
        {isLoading && <p className="text-gray-400 text-sm">Loading…</p>}
        {!isLoading && suggestions.length === 0 && (
          <p className="text-gray-400 text-sm">No available lots.</p>
        )}

        {suggestions.map((lot) => (
          <div
            key={lot.lotId}
            className="border border-border rounded-xl p-3 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{lot.lotNumber}</span>
              {top && lot.lotId === top.lotId && (
                <Chip label="Best" color="success" size="small" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Avail: {lot.availableQuantity}</span>
              <ExpiryBadge expiryDate={lot.expiryDate} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {lot.unitCost} /unit
                {Number(lot.suggestedQuantity) > 0 && (
                  <span className="ml-2 text-gray-700">
                    take {lot.suggestedQuantity}
                  </span>
                )}
              </span>
              <Button size="small" variant="contained" onClick={() => pickLot(lot)}>
                Use
              </Button>
            </div>
          </div>
        ))}

        {suggestions.filter((s) => Number(s.suggestedQuantity) > 0).length >
          1 && (
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              onUse(
                suggestions
                  .filter((s) => Number(s.suggestedQuantity) > 0)
                  .map(toConsumed),
              )
            }
          >
            Use all suggested
          </Button>
        )}

        {data && Number(data.shortfall) > 0 && (
          <p className="text-amber-600 text-xs mt-1">
            ⚠ Shortfall of {data.shortfall} — not enough stock for the full
            quantity.
          </p>
        )}
      </div>
    </div>
  );
}

export default SuggestLotsPanel;
