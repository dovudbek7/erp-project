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
import { useTranslation } from "react-i18next";
import useProductionOrders from "../../hooks/useProductionOrders";
import useRecipes from "../../hooks/useRecipes";
import formatDate from "../../utilties/formatDate";
import type { ProductionOrderStatus } from "../../types";
import { CACHE_KEY_PRODUCTION_ORDERS } from "../../constants.production";
import useGridSelection from "../../hooks/useGridSelection";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";
import ProductionStatusBadge from "./ProductionStatusBadge";

const STATUSES: ProductionOrderStatus[] = [
  "DRAFT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function ProductionOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>("");
  const { data = [], error, isLoading } = useProductionOrders(
    status ? { status } : {},
  );
  const { data: recipes = [] } = useRecipes();
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const recipeName = useMemo(() => {
    const m = new Map(recipes.map((r) => [r.id, r.name]));
    return (id: string) => m.get(id) ?? id;
  }, [recipes]);

  const columns: GridColDef[] = [
    {
      field: "orderNumber",
      headerName: t("production.colOrder"),
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
      headerName: t("production.colRecipe"),
      flex: 1.4,
      valueGetter: (_v, row) => recipeName(row.recipeId),
    },
    {
      field: "status",
      headerName: t("production.colStatus"),
      flex: 1,
      renderCell: (p) => <ProductionStatusBadge status={p.value} />,
    },
    {
      field: "plannedOutputQuantity",
      headerName: t("production.colPlanned"),
      flex: 1,
      renderCell: (p) => (
        <span>
          {p.value} {p.row.plannedOutputUom}
        </span>
      ),
    },
    {
      field: "actualOutputQuantity",
      headerName: t("production.colActual"),
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
      headerName: t("production.colScheduled"),
      flex: 1,
      valueGetter: (v) => formatDate(v),
    },
    {
      field: "yieldPercent",
      headerName: t("production.colYield"),
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
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t("production.ordersTitle")}</h2>
          <p className="text-gray-400">{t("production.ordersDesc")}</p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/production/orders/new")}
        >
          + {t("production.newOrder")}
        </Button>
      </div>

      <div className="mt-5 flex gap-3">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="po-status-filter">
            {t("production.statusFilter")}
          </InputLabel>
          <Select
            labelId="po-status-filter"
            label={t("production.statusFilter")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">{t("production.all")}</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`production.status${s}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-5">
        <DeleteSelectedBar
          selectedIds={selectedIds}
          endpoint="production-orders"
          queryKey={CACHE_KEY_PRODUCTION_ORDERS}
          label="order"
          onDone={clear}
        />
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
            slots={{ toolbar: DataGridToolbar }}
            checkboxSelection
            onRowSelectionModelChange={onRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
          />
        </Paper>
      </div>
    </div>
  );
}

export default ProductionOrders;
