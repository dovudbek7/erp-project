import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { CACHE_KEY_SALES_ORDERS } from "../../constants.sales";
import useCustomers from "../../hooks/useCustomers";
import useGridSelection from "../../hooks/useGridSelection";
import useSalesOrders from "../../hooks/useSalesOrders";
import type { SalesOrder, SalesOrderStatus } from "../../types";
import formatDate from "../../utilties/formatDate";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";
import { displayMargin } from "./salesUtils";
import SalesStatusBadge from "./SalesStatusBadge";

const STATUSES: SalesOrderStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PICKED",
  "DELIVERED",
  "INVOICED",
  "CANCELLED",
];

function SalesOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const { data = [], isLoading, error } = useSalesOrders({
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
  });
  const { data: customers = [] } = useCustomers();
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const customerName = useMemo(() => {
    const m = new Map(customers.map((c) => [c.id, c.name]));
    return (id: string) => m.get(id) ?? id;
  }, [customers]);

  const columns: GridColDef<SalesOrder>[] = [
    {
      field: "orderNumber",
      headerName: t("sales.list.colOrderNumber"),
      flex: 1,
      renderCell: (p) => (
        <Link
          to={`/sales/orders/${p.id}`}
          className="text-blue-600 font-medium"
        >
          {p.row.orderNumber}
        </Link>
      ),
    },
    {
      field: "customerId",
      headerName: t("sales.list.colCustomer"),
      flex: 1.3,
      valueGetter: (_v, row) => customerName(row.customerId),
    },
    {
      field: "status",
      headerName: t("sales.list.colStatus"),
      flex: 1,
      renderCell: (p) => <SalesStatusBadge status={p.value} />,
    },
    {
      field: "totalAmount",
      headerName: t("sales.list.colTotal"),
      flex: 1,
      renderCell: (p) => (
        <span>
          {p.value} {p.row.currency}
        </span>
      ),
    },
    {
      field: "orderDate",
      headerName: t("sales.list.colOrderDate"),
      flex: 1,
      renderCell: (p) => <span>{formatDate(p.value)}</span>,
    },
    {
      field: "grossMargin",
      headerName: t("sales.list.colMargin"),
      flex: 1,
      renderCell: (p) => <span>{displayMargin(p.row)}</span>,
    },
  ];

  if (isLoading) return <p>{t("common.loading")}</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t("sales.list.title")}</h2>
          <p className="text-gray-400">{t("sales.list.subtitle")}</p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/sales/orders/new")}
        >
          {t("sales.list.new")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <FormControl size="small" className="w-full sm:w-auto sm:min-w-[180px]">
          <InputLabel id="so-status">{t("sales.list.status")}</InputLabel>
          <Select
            labelId="so-status"
            label={t("sales.list.status")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">{t("sales.list.all")}</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`enums.${s}`, { defaultValue: s })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="w-full sm:w-auto sm:min-w-[220px]">
          <InputLabel id="so-customer">{t("sales.list.customer")}</InputLabel>
          <Select
            labelId="so-customer"
            label={t("sales.list.customer")}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <MenuItem value="">{t("sales.list.all")}</MenuItem>
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-4">
        <DeleteSelectedBar
          selectedIds={selectedIds}
          endpoint="sales-orders"
          queryKey={CACHE_KEY_SALES_ORDERS}
          label={t("sales.list.orderLabel")}
          onDone={clear}
        />
        <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
          <DataGrid
            style={{ borderRadius: "20px" }}
            rows={data}
            getRowId={(row) => row.id}
            onRowClick={(p) => navigate(`/sales/orders/${p.id}`)}
            columns={columns}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 20]}
            sx={{ border: 0 }}
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

export default SalesOrders;
