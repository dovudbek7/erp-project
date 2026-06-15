import { Button, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { CACHE_KEY_PURCHASE_ORDERS } from "../../constants";
import useGridSelection from "../../hooks/useGridSelection";
import usePurchaseOrders from "../../hooks/usePurchaseOrders";
import formatDate from "../../utilties/formatDate";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";
import Status from "../common/StatusBadge";

function PurchaseOrders() {
  const { data = [], isLoading, error } = usePurchaseOrders();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const paginationModel = { page: 0, pageSize: 5 };
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const columns: GridColDef[] = [
    {
      field: "poNumber",
      headerName: t("poPage.colPoNumber"),
      flex: 1,
      renderCell: (params) => (
        <Link to={`/purchase-orders/${params.id}`}>{params.row.poNumber}</Link>
      ),
    },
    { field: "supplierId", headerName: t("poPage.colSupplier"), flex: 1 },
    { field: "warehouseId", headerName: t("poPage.colWarehouse"), flex: 1 },
    {
      field: "status",
      headerName: t("poPage.colStatus"),
      flex: 1,
      renderCell: (params) => <Status status={params.value} />,
    },
    {
      field: "orderDate",
      headerName: t("poPage.colOrderDate"),
      flex: 1,
      renderCell: (param) => <p>{formatDate(param.value)}</p>,
    },
    {
      field: "expectedDate",
      headerName: t("poPage.colExpected"),
      flex: 1,
      renderCell: (param) => <p>{formatDate(param.value)}</p>,
    },
    {
      field: "totalAmount",
      headerName: t("poPage.colTotal"),
      flex: 1,
      renderCell: (param) => (
        <p>
          {param.value} {param.row.currency}
        </p>
      ),
    },
  ];

  if (isLoading) return <p>{t("common.loading")}</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="">
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">{t("poPage.name")}</h2>
          <p className="text-gray-400">{t("poPage.desc")}</p>
        </div>
        <div className="">
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate("/purchase-orders/new")}
          >
            + {t("poPage.createButton")}
          </Button>
        </div>
      </div>
      <div className="mt-5">
        <DeleteSelectedBar
          selectedIds={selectedIds}
          endpoint="purchase-orders"
          queryKey={CACHE_KEY_PURCHASE_ORDERS}
          label="order"
          onDone={clear}
        />
        <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
          <DataGrid
            style={{ borderRadius: "20px" }}
            rows={data}
            getRowId={(row) => row.id}
            onRowClick={(params) => navigate(`/purchase-orders/${params.id}`)}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 15]}
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

export default PurchaseOrders;
