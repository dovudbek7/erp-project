import { useMemo, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router";
import useProductionOrders from "../../hooks/useProductionOrders";
import useRecipes from "../../hooks/useRecipes";
import formatDate from "../../utilties/formatDate";
import type { ProductionOrderStatus } from "../../types";
import ProductionStatusBadge from "./ProductionStatusBadge";

const STATUSES: ProductionOrderStatus[] = [
  "DRAFT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function ProductionOrders() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const { data = [], error, isLoading } = useProductionOrders(
    status ? { status } : {},
  );
  const { data: recipes = [] } = useRecipes();

  const recipeName = useMemo(() => {
    const m = new Map(recipes.map((r) => [r.id, r.name]));
    return (id: string) => m.get(id) ?? id;
  }, [recipes]);

  const columns: GridColDef[] = [
    {
      field: "orderNumber",
      headerName: "Order #",
      flex: 1,
      renderCell: (p) => (
        <Link
          to={`/production/orders/${p.id}`}
          className="text-blue-600 font-medium"
        >
          {p.row.orderNumber}
        </Link>
      ),
    },
    {
      field: "recipeId",
      headerName: "Recipe",
      flex: 1.4,
      valueGetter: (_v, row) => recipeName(row.recipeId),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (p) => <ProductionStatusBadge status={p.value} />,
    },
    {
      field: "plannedOutputQuantity",
      headerName: "Planned output",
      flex: 1,
      renderCell: (p) => (
        <span>
          {p.value} {p.row.plannedOutputUom}
        </span>
      ),
    },
    {
      field: "actualOutputQuantity",
      headerName: "Actual output",
      flex: 1,
      renderCell: (p) =>
        p.value ? (
          <span>
            {p.value} {p.row.plannedOutputUom}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      field: "scheduledFor",
      headerName: "Scheduled",
      flex: 1,
      valueGetter: (v) => formatDate(v),
    },
    {
      field: "yieldPercent",
      headerName: "Yield",
      flex: 0.8,
      renderCell: (p) =>
        p.value ? (
          <span className="font-medium">{p.value}%</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Production orders</h2>
          <p className="text-gray-400">
            Plan, run and close out production batches.
          </p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/production/orders/new")}
        >
          + New production order
        </Button>
      </div>

      <div className="mt-5 flex gap-3">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="po-status-filter">Status</InputLabel>
          <Select
            labelId="po-status-filter"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-5 shadow-md">
        <Paper style={{ borderRadius: "20px" }}>
          <DataGrid
            style={{ borderRadius: "20px" }}
            rows={data}
            loading={isLoading}
            getRowId={(row) => row.id}
            columns={columns}
            onRowClick={(p) => navigate(`/production/orders/${p.id}`)}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25]}
            sx={{ border: 0, cursor: "pointer" }}
            showToolbar
          />
        </Paper>
      </div>
    </div>
  );
}

export default ProductionOrders;
