import { Button, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import usePurchaseOrders from "../../hooks/usePurchaseOrders";
import formatDate from "../../utilties/formatDate";
import Status from "../common/StatusBadge";

function PurchaseOrders() {
  const { data = [], isLoading, error } = usePurchaseOrders();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const paginationModel = { page: 0, pageSize: 5 };

  const columns: GridColDef[] = [
    {
      field: "poNumber",
      headerName: "PO Number",
      flex: 1,
      renderCell: (params) => (
        <Link to={`/purchase-orders/${params.id}`}>{params.row.poNumber}</Link>
      ),
    },
    { field: "supplierId", headerName: "Supplier", flex: 1 },
    { field: "warehouseId", headerName: "Warehouse", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Status status={params.value} />,
    },
    {
      field: "orderDate",
      headerName: "Order Date",
      flex: 1,
      renderCell: (param) => <p>{formatDate(param.value)}</p>,
    },
    {
      field: "expectedDate",
      headerName: "Expected",
      flex: 1,
      renderCell: (param) => <p>{formatDate(param.value)}</p>,
    },
    {
      field: "totalAmount",
      headerName: "Total",
      flex: 1,
      renderCell: (param) => (
        <p>
          {param.value} {param.row.currency}
        </p>
      ),
    },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="">
      <div className="flex justify-between">
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
      <div className="mt-5 shadow shadow-md">
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
          />
        </Paper>
      </div>
    </div>
  );
}

export default PurchaseOrders;
