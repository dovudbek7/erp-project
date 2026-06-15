import { Button } from "@mui/material";
import { useState } from "react";
import useConfirmSalesOrder from "../../hooks/useConfirmSalesOrder";
import type { AllocatedLot } from "../../types";
import type { SalesOrderWithLines } from "../../types/sales";
import { useToast } from "../common/ToastContext";
import AllocationPanel from "./AllocationPanel";
import { HeaderCard } from "./SalesOrderParts";

interface Props {
  order: SalesOrderWithLines;
  customerName: string;
  productName: (id: string) => string;
}

// Merge new lots into existing, deduping by lotId (new wins).
const mergeLots = (existing: AllocatedLot[], incoming: AllocatedLot[]) => {
  const byId = new Map(existing.map((a) => [a.lotId, a]));
  incoming.forEach((a) => byId.set(a.lotId, a));
  return Array.from(byId.values());
};

function DraftView({ order, customerName, productName }: Props) {
  const toast = useToast();
  const { mutate, isPending } = useConfirmSalesOrder(order.id);
  const [alloc, setAlloc] = useState<Record<string, AllocatedLot[]>>({});
  const [panelLine, setPanelLine] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const allAllocated = order.lines.every((l) => (alloc[l.id]?.length ?? 0) > 0);

  const confirm = () => {
    const lines = order.lines.map((l) => ({
      lineId: l.id,
      allocatedLots: alloc[l.id] ?? [],
    }));
    mutate(
      { lines },
      {
        onSuccess: () => toast.success("Order confirmed"),
        onError: () => toast.error("Failed to confirm order"),
      },
    );
  };

  return (
    <div>
      <HeaderCard order={order} customerName={customerName} />

      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mt-4 items-start">
        {/* Lines + allocate */}
        <div className="bg-white rounded-xl border border-border">
          <div className="border-b border-border py-[15px] px-[25px]">
            <p>Allocate lots (FEFO)</p>
          </div>
          <div className="p-[15px_20px] text-sm flex flex-col gap-3">
            {order.lines.map((l) => {
              const picked = alloc[l.id] ?? [];
              return (
                <div
                  key={l.id}
                  className={`border rounded-xl p-3 ${
                    panelLine === l.id ? "border-blue-400" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{productName(l.productId)}</p>
                      <p className="text-gray-500 text-xs">
                        Ordered {l.orderedQuantity} {l.uom}
                      </p>
                    </div>
                    <Button
                      size="small"
                      variant={picked.length ? "outlined" : "contained"}
                      onClick={() =>
                        setPanelLine(panelLine === l.id ? null : l.id)
                      }
                    >
                      {picked.length ? "Re-allocate" : "Allocate"}
                    </Button>
                  </div>
                  {picked.length > 0 && (
                    <div className="mt-2 pl-2 border-l-2 border-border text-xs text-gray-600">
                      {picked.map((a) => (
                        <p key={a.lotId}>
                          {a.lotId} · {a.quantity} @ {a.unitCost}
                        </p>
                      ))}
                      {overrides[l.id] && (
                        <p className="text-amber-600 mt-1">{overrides[l.id]}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestion side panel */}
        <div className="sticky top-4">
          {panelLine ? (
            (() => {
              const line = order.lines.find((l) => l.id === panelLine)!;
              return (
                <AllocationPanel
                  orderId={order.id}
                  lineId={line.id}
                  productId={line.productId}
                  productName={productName(line.productId)}
                  quantity={line.orderedQuantity}
                  onClose={() => setPanelLine(null)}
                  onUse={(lots, override) => {
                    setAlloc((prev) => ({
                      ...prev,
                      [line.id]: mergeLots(prev[line.id] ?? [], lots),
                    }));
                    if (override)
                      setOverrides((prev) => ({ ...prev, [line.id]: override }));
                  }}
                />
              );
            })()
          ) : (
            <div className="bg-white border border-border rounded-2xl p-5 text-sm text-gray-400">
              Select a line to see FEFO lot suggestions.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          variant="contained"
          color="error"
          size="large"
          disabled={isPending || !allAllocated}
          onClick={confirm}
        >
          Confirm order
        </Button>
      </div>
      {!allAllocated && (
        <p className="text-right text-xs text-gray-400 mt-1">
          Allocate every line to confirm.
        </p>
      )}
    </div>
  );
}

export default DraftView;
