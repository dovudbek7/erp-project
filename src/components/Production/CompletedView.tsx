import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Lot, Product } from "../../types";
import type { ProductionOrderWithDetail } from "../../types/production";
import useLots from "../../hooks/useLots";
import useUsers from "../../hooks/useUsers";
import formatDate from "../../utilties/formatDate";
import { fmtMoney, variancePercent } from "./productionUtils";

interface Props {
  order: ProductionOrderWithDetail;
  productsById: Map<string, Product>;
}

function CompletedView({ order, productsById }: Props) {
  const { t } = useTranslation();
  const { data: users = [] } = useUsers();
  const { data: allLots = [] } = useLots();
  const [traceOpen, setTraceOpen] = useState(false);

  const lotsById = useMemo(() => {
    const m = new Map<string, Lot>();
    allLots.forEach((l) => m.set(l.id, l));
    // The freshly created output lot may not be in the static lots list.
    if (order.outputLot) m.set(order.outputLot.id, order.outputLot);
    return m;
  }, [allLots, order.outputLot]);

  const completedByName =
    users.find((u) => u.id === order.completedBy)?.fullName ??
    order.completedBy ??
    "—";

  const outputProductName = order.outputLot
    ? productsById.get(order.outputLot.productId)?.name
    : order.recipe
      ? productsById.get(order.recipe.outputProductId)?.name
      : undefined;

  // Parent (consumed) lots → output lot, for the traceability view.
  const parentLots =
    order.outputLot?.parentLotIds.map((id) => lotsById.get(id)).filter(Boolean) ??
    [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white border border-border rounded-2xl p-[25px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
              <Chip
                label={t("production.statusCOMPLETED")}
                color="success"
                size="small"
              />
            </div>
            <p className="text-gray-500 mt-1">
              {order.recipe?.name} · {t("production.completed")}{" "}
              {formatDate(order.completedAt)} · {t("production.completedBy")}{" "}
              {completedByName}
            </p>
          </div>
          <Button variant="outlined" onClick={() => setTraceOpen(true)}>
            {t("production.viewTraceability")}
          </Button>
        </div>
      </div>

      {/* Three insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">{t("production.yield")}</p>
          <p className="text-3xl font-bold mt-1">{order.yieldPercent}%</p>
          <p className="text-gray-400 text-sm mt-2">
            {t("production.plannedKg")} {order.plannedOutputQuantity} kg →{" "}
            {t("production.actualKg")} {order.actualOutputQuantity} kg
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {t("production.recipeTarget")} {order.recipe?.expectedYieldPercent}%
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">{t("production.cost")}</p>
          <p className="text-3xl font-bold mt-1">
            {fmtMoney(order.unitOutputCost ?? 0)}
          </p>
          <p className="text-gray-400 text-sm mt-2">{t("production.perKg")}</p>
          <p className="text-gray-400 text-xs mt-1">
            {t("production.totalInput")} {fmtMoney(order.totalInputCost ?? 0)}
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <p className="text-gray-500 text-sm">{t("production.output")}</p>
          <p className="text-lg font-bold mt-1">
            {order.outputLot?.lotNumber ?? "—"}
          </p>
          <p className="text-gray-400 text-sm mt-1">{outputProductName}</p>
          {order.outputLot && (
            <Link
              to={`/lots/${order.outputLot.id}`}
              className="text-blue-600 text-sm inline-block mt-2"
            >
              {t("production.viewLot")}
            </Link>
          )}
        </div>
      </div>

      {/* Planned vs actual */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="border-b border-border px-4 md:px-[25px] py-[15px]">
          <p className="font-semibold">{t("production.plannedVsActual")}</p>
        </div>
        <Paper elevation={0}>
          <Table aria-label={t("production.plannedVsActual")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("production.product")}</TableCell>
                <TableCell align="right">{t("production.planned")}</TableCell>
                <TableCell align="right">{t("production.actualCol")}</TableCell>
                <TableCell align="right">{t("production.variance")}</TableCell>
                <TableCell>{t("production.lotsCol")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.inputs.map((input) => {
                const v = variancePercent(
                  input.plannedQuantity,
                  input.actualQuantity,
                );
                const flagged = v !== null && Math.abs(v) > 5;
                return (
                  <TableRow key={input.id}>
                    <TableCell>
                      {productsById.get(input.productId)?.name ??
                        input.productId}
                    </TableCell>
                    <TableCell align="right">{input.plannedQuantity}</TableCell>
                    <TableCell align="right">
                      {input.actualQuantity ?? "—"}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={flagged ? "text-amber-600 font-semibold" : ""}
                    >
                      {v === null
                        ? "—"
                        : `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </div>

      {/* Stock movements created by this order */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="border-b border-border px-4 md:px-[25px] py-[15px]">
          <p className="font-semibold">{t("production.stockMovements")}</p>
          <p className="text-gray-400 text-xs">
            {t("production.movementsHint")}
          </p>
        </div>
        <Paper elevation={0}>
          <Table aria-label={t("production.stockMovements")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("production.type")}</TableCell>
                <TableCell>{t("production.lot")}</TableCell>
                <TableCell align="right">{t("production.quantity")}</TableCell>
                <TableCell align="right">
                  {t("production.totalCostCol")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Chip
                      size="small"
                      label={m.type.replace("PRODUCTION_", "")}
                      color={
                        m.type === "PRODUCTION_OUTPUT" ? "success" : "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {lotsById.get(m.lotId)?.lotNumber ?? m.lotId}
                  </TableCell>
                  <TableCell
                    align="right"
                    className={
                      Number(m.quantity) < 0 ? "text-error" : "text-success"
                    }
                  >
                    {m.quantity} {m.uom}
                  </TableCell>
                  <TableCell align="right">{m.totalCost}</TableCell>
                </TableRow>
              ))}
              {order.movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-gray-400">
                    {t("production.noMovements")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </div>

      {/* Traceability modal: parents → output */}
      <Dialog
        open={traceOpen}
        onClose={() => setTraceOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {t("production.traceModalTitle")} — {order.outputLot?.lotNumber}
        </DialogTitle>
        <DialogContent>
          <div className="flex items-center gap-6 py-4">
            {/* Input lots */}
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-gray-500 text-sm">
                {t("production.consumedLots")}
              </p>
              {parentLots.map((lot) => (
                <div
                  key={lot!.id}
                  className="border border-border rounded-xl p-3"
                >
                  <p className="font-medium text-sm">{lot!.lotNumber}</p>
                  <p className="text-gray-400 text-xs">
                    {productsById.get(lot!.productId)?.name} · exp{" "}
                    {formatDate(lot!.expiryDate)}
                  </p>
                </div>
              ))}
              {parentLots.length === 0 && (
                <p className="text-gray-400 text-sm">
                  {t("production.noParents")}
                </p>
              )}
            </div>

            <FiArrowRight className="text-2xl text-gray-400 shrink-0" />

            {/* Output lot */}
            <div className="flex-1">
              <p className="text-gray-500 text-sm">
                {t("production.outputLot")}
              </p>
              {order.outputLot && (
                <div className="border-2 border-green-500 rounded-xl p-3 mt-2">
                  <p className="font-semibold">{order.outputLot.lotNumber}</p>
                  <p className="text-gray-400 text-xs">{outputProductName}</p>
                  <p className="text-sm mt-2">
                    {order.outputLot.currentQuantity} {order.outputLot.uom} @{" "}
                    {order.outputLot.unitCost}/{order.outputLot.uom}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    exp {formatDate(order.outputLot.expiryDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompletedView;
