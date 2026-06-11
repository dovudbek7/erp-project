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
import { Link, useNavigate } from "react-router";
import { CACHE_KEY_SALES_ORDERS } from "../../constants.sales";
import useCustomers from "../../hooks/useCustomers";
import useGridSelection from "../../hooks/useGridSelection";
import useSalesOrders from "../../hooks/useSalesOrders";
import type { SalesOrder, SalesOrderStatus } from "../../types";
import formatDate from "../../utilties/formatDate";
import BackButton from "../common/BackButton";
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
      headerName: "Order #",
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
      headerName: "Customer",
      flex: 1.3,
      valueGetter: (_v, row) => customerName(row.customerId),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (p) => <SalesStatusBadge status={p.value} />,
    },
    {
      field: "totalAmount",
      headerName: "Total",
      flex: 1,
      renderCell: (p) => (
        <span>
          {p.value} {p.row.currency}
        </span>
      ),
    },
    {
      field: "orderDate",
      headerName: "Order date",
      flex: 1,
      renderCell: (p) => <span>{formatDate(p.value)}</span>,
    },
    {
      field: "grossMargin",
      headerName: "Margin",
      flex: 1,
      renderCell: (p) => <span>{displayMargin(p.row)}</span>,
    },
  ];

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <BackButton />
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Sales Orders</h2>
          <p className="text-gray-400">
            Customer orders for finished goods.
          </p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/sales/orders/new")}
        >
          + New sales order
        </Button>
      </div>

      <div className="flex gap-3 mt-5">
        <FormControl size="small" className="min-w-[180px]">
          <InputLabel id="so-status">Status</InputLabel>
          <Select
            labelId="so-status"
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

        <FormControl size="small" className="min-w-[220px]">
          <InputLabel id="so-customer">Customer</InputLabel>
          <Select
            labelId="so-customer"
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
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
          label="order"
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
