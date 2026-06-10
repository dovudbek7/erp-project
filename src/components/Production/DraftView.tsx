import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Input,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import type { Product } from "../../types";
import type { ProductionOrderWithDetail } from "../../types/production";
import useUpdateProductionOrder from "../../hooks/useUpdateProductionOrder";
import useStartProduction from "../../hooks/useStartProduction";
import useDeleteProductionOrder from "../../hooks/useDeleteProductionOrder";
import ProductionStatusBadge from "./ProductionStatusBadge";

interface Props {
  order: ProductionOrderWithDetail;
  productsById: Map<string, Product>;
}

function DraftView({ order, productsById }: Props) {
  const navigate = useNavigate();
  const update = useUpdateProductionOrder(order.id);
  const start = useStartProduction(order.id);
  const remove = useDeleteProductionOrder();

  const [editing, setEditing] = useState(false);
  const [planned, setPlanned] = useState(order.plannedOutputQuantity);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const savePlanned = () => {
    update.mutate(
      { plannedOutputQuantity: planned },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white border border-border rounded-2xl p-[25px]">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
          <ProductionStatusBadge status={order.status} />
        </div>
        <p className="text-gray-500 mt-1">
          {order.recipe?.name}{" "}
          <span className="text-gray-400">(v{order.recipeVersion})</span>
        </p>

        <div className="mt-5 flex items-end gap-3">
          <div>
            <p className="text-gray-500 text-sm">Planned output</p>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={planned}
                  onChange={(e) => setPlanned(e.target.value)}
                  sx={{ width: 120 }}
                  autoFocus
                />
                <span className="text-gray-500">{order.plannedOutputUom}</span>
                <IconButton
                  size="small"
                  color="success"
                  onClick={savePlanned}
                  disabled={update.isPending}
                >
                  <FiCheck />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setPlanned(order.plannedOutputQuantity);
                    setEditing(false);
                  }}
                >
                  <FiX />
                </IconButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">
                  {order.plannedOutputQuantity} {order.plannedOutputUom}
                </p>
                <IconButton size="small" onClick={() => setEditing(true)}>
                  <FiEdit2 />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inputs (read-only in draft) */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="border-b border-border px-[25px] py-[15px]">
          <p className="font-semibold">Inputs</p>
        </div>
        <Paper elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Planned quantity</TableCell>
                <TableCell>UOM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.inputs.map((input) => (
                <TableRow key={input.id}>
                  <TableCell>
                    {productsById.get(input.productId)?.name ?? input.productId}
                  </TableCell>
                  <TableCell align="right">{input.plannedQuantity}</TableCell>
                  <TableCell>{input.plannedUom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => setConfirmStart(true)}
        >
          Start production
        </Button>
        <Button
          variant="outlined"
          startIcon={<FiTrash2 />}
          color="inherit"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </div>

      {/* Start confirmation */}
      <Dialog open={confirmStart} onClose={() => setConfirmStart(false)}>
        <DialogTitle>Start production?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This moves <strong>{order.orderNumber}</strong> to In progress.
            You'll record actual quantities and lots from there. Inventory is
            only changed when you complete the order.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStart(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={start.isPending}
            onClick={() =>
              start.mutate(undefined, {
                onSuccess: () => setConfirmStart(false),
              })
            }
          >
            {start.isPending ? "Starting…" : "Start production"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete draft order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes <strong>{order.orderNumber}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(order.id, {
                onSuccess: () => navigate("/production/orders"),
              })
            }
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DraftView;
