import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Input,
} from "@mui/material";
import { FiClock } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { ConsumedLot, Lot, Product } from "../../types";
import type { ProductionOrderWithDetail } from "../../types/production";
import useLots from "../../hooks/useLots";
import formatDate from "../../utilties/formatDate";
import ProductionStatusBadge from "./ProductionStatusBadge";
import SuggestLotsPanel from "./SuggestLotsPanel";
import CompleteModal from "./CompleteModal";
import useInputAutoSave, { type SaveState } from "./useInputAutoSave";
import {
  fmtMoney,
  fmtQty,
  inputCost,
  lotConsumedQty,
  totalActualMass,
  totalCost,
  variancePercent,
} from "./productionUtils";

interface Props {
  order: ProductionOrderWithDetail;
  productsById: Map<string, Product>;
}

// ─── Elapsed clock since startedAt ───────────────────────────
function useElapsed(startedAt: string | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!startedAt) return "—";
  const secs = Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
  );
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function SaveIndicator({ state }: { state?: SaveState }) {
  const { t } = useTranslation();
  if (!state) return null;
  if (state === "saving")
    return (
      <span className="text-gray-400 text-xs flex items-center gap-1">
        <CircularProgress size={10} /> {t("production.saving")}
      </span>
    );
  if (state === "saved")
    return <span className="text-green-600 text-xs">✓ {t("production.saved")}</span>;
  return <span className="text-red-500 text-xs">{t("production.saveFailed")}</span>;
}

function VarianceChip({
  planned,
  actual,
}: {
  planned: string;
  actual: string | null;
}) {
  const { t } = useTranslation();
  const v = variancePercent(planned, actual);
  if (v === null || Math.abs(v) <= 5) return null;
  const sign = v > 0 ? "+" : "";
  return (
    <Chip
      size="small"
      color={Math.abs(v) > 15 ? "error" : "warning"}
      label={`⚠ ${sign}${v.toFixed(0)}% ${
        v > 0 ? t("production.over") : t("production.under")
      }`}
    />
  );
}

function InProgressView({ order, productsById }: Props) {
  const { t } = useTranslation();
  const elapsed = useElapsed(order.startedAt);
  const { save, flushAll, status } = useInputAutoSave(order.id);
  const { data: allLots = [] } = useLots();
  const lotsById = useMemo(() => {
    const m = new Map<string, Lot>();
    allLots.forEach((l) => m.set(l.id, l));
    return m;
  }, [allLots]);

  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  // Local text-field state for actual quantities (server-confirmed values
  // live in the query cache). Seeded once from the order.
  const [actuals, setActuals] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      order.inputs.map((i) => [i.id, i.actualQuantity ?? ""]),
    ),
  );

  const onActualChange = (inputId: string, value: string) => {
    setActuals((p) => ({ ...p, [inputId]: value }));
    save(inputId, { actualQuantity: value === "" ? null : value });
  };

  const onUseLots = (
    inputId: string,
    lots: ConsumedLot[],
    override?: string,
  ) => {
    const total = lotConsumedQty(lots).toString();
    setActuals((p) => ({ ...p, [inputId]: fmtQty(total) }));
    save(inputId, {
      consumedLots: lots,
      actualQuantity: fmtQty(total),
      ...(override ? { notes: override } : {}),
    });
    setActiveInputId(null);
  };

  const activeInput = order.inputs.find((i) => i.id === activeInputId);

  // Cumulative summary.
  const massSoFar = totalActualMass(order.inputs);
  const costSoFar = totalCost(order.inputs);

  // Lots consumed across all inputs, aggregated by lot.
  const consumedByLot = useMemo(() => {
    const m = new Map<string, number>();
    order.inputs.forEach((i) =>
      i.consumedLots.forEach((cl) => {
        m.set(cl.lotId, (m.get(cl.lotId) ?? 0) + Number(cl.quantity));
      }),
    );
    return m;
  }, [order.inputs]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with elapsed clock */}
      <div className="bg-white border border-border rounded-2xl p-[25px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
              <ProductionStatusBadge status={order.status} />
            </div>
            <p className="text-gray-500 mt-1">
              {order.recipe?.name} · {t("production.started")}{" "}
              {formatDate(order.startedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs flex items-center gap-1 justify-end">
              <FiClock /> {t("production.elapsed")}
            </p>
            <p className="text-3xl font-mono font-bold tabular-nums">
              {elapsed}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        {/* Inputs table */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="border-b border-border px-4 md:px-[25px] py-[15px]">
            <p className="font-semibold">{t("production.inputs")}</p>
            <p className="text-gray-400 text-xs">
              {t("production.inputsHint")}
            </p>
          </div>

          <div className="divide-y divide-border">
            {order.inputs.map((input) => {
              const product = productsById.get(input.productId);
              const isActive = activeInputId === input.id;
              return (
                <div
                  key={input.id}
                  className={`px-4 md:px-[25px] py-4 ${isActive ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {product?.name ?? input.productId}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {t("production.planned")} {input.plannedQuantity}{" "}
                        {input.plannedUom}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder={t("production.actual")}
                        value={actuals[input.id] ?? ""}
                        onFocus={() => setActiveInputId(input.id)}
                        onChange={(e) =>
                          onActualChange(input.id, e.target.value)
                        }
                        sx={{ width: 110 }}
                      />
                      <span className="text-gray-500 text-sm w-8">
                        {input.plannedUom}
                      </span>
                    </div>

                    <div className="w-40 flex justify-end items-center gap-2">
                      <VarianceChip
                        planned={input.plannedQuantity}
                        actual={input.actualQuantity}
                      />
                      <SaveIndicator state={status[input.id]} />
                    </div>
                  </div>

                  {/* Consumed lots for this row */}
                  {input.consumedLots.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {input.consumedLots.map((cl) => (
                        <Chip
                          key={cl.lotId}
                          size="small"
                          variant="outlined"
                          label={`${
                            lotsById.get(cl.lotId)?.lotNumber ?? cl.lotId
                          }: ${cl.quantity}`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 self-center">
                        {t("production.cost")} {fmtMoney(inputCost(input))}
                      </span>
                    </div>
                  )}

                  {input.notes && (
                    <p className="text-xs text-amber-600 mt-1">{input.notes}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 md:px-[25px] py-4 border-t border-border">
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={async () => {
                await flushAll();
                setCompleteOpen(true);
              }}
            >
              {t("production.completeProduction")}
            </Button>
          </div>
        </div>

        {/* Right column: suggest panel (when active) + summary */}
        <div className="flex flex-col gap-5 sticky top-0">
          {activeInput && (
            <SuggestLotsPanel
              orderId={order.id}
              productId={activeInput.productId}
              productName={
                productsById.get(activeInput.productId)?.name ??
                activeInput.productId
              }
              quantity={
                actuals[activeInput.id] || activeInput.plannedQuantity
              }
              onUse={(lots, override) =>
                onUseLots(activeInput.id, lots, override)
              }
              onClose={() => setActiveInputId(null)}
            />
          )}

          {/* Cumulative summary */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="font-semibold mb-4">{t("production.batchSoFar")}</p>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">{t("production.totalMass")}</span>
              <span className="font-semibold">{fmtQty(massSoFar)} kg</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-500">{t("production.totalCost")}</span>
              <span className="font-semibold">{fmtMoney(costSoFar)}</span>
            </div>

            <p className="text-gray-500 text-sm mb-2">
              {t("production.lotsConsuming")}
            </p>
            {consumedByLot.size === 0 && (
              <p className="text-gray-400 text-sm">
                {t("production.noLotsYet")}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {Array.from(consumedByLot.entries()).map(([lotId, used]) => {
                const lot = lotsById.get(lotId);
                const original = lot ? Number(lot.currentQuantity) + used : used;
                const pct = original > 0 ? (used / original) * 100 : 0;
                return (
                  <div key={lotId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">
                        {lot?.lotNumber ?? lotId}
                      </span>
                      <span className="text-gray-500">
                        {fmtQty(used)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CompleteModal
        order={order}
        productsById={productsById}
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
      />
    </div>
  );
}

export default InProgressView;
