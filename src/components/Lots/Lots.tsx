import { Button, Chip, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import { Link, useNavigate } from "react-router";
import useLots from "../../hooks/useLots";
import { useTranslation } from "react-i18next";
import ExpiryBadge from "../common/ExpiryBadge";
import Status from "../common/StatusBadge";
function Lots() {
  const { data, error, isLoading } = useLots();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "lotNumber",
      headerName: "Lot Number",
      flex: 1,
      renderCell(params) {
        return <Link to={`/lots/${params.id}`}>{params.row.lotNumber}</Link>;
      },
    },
    { field: "productId", headerName: "Product", flex: 1 },
    {
      field: "warehouseId",
      headerName: "Warehouse",
    },
    {
      field: "status",
      headerName: "Status",
      description: "This column has a value getter and is not sortable.",
      flex: 1,
      renderCell: (params) => {
        return <Status status={params.value} />;
      },
    },
    {
      field: "unitCost",
      headerName: "Unit Cost",
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} UZS</p>;
      },
    },
    {
      field: "currentQuantity",
      headerName: "Current QTY",
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} KG</p>;
      },
    },

    {
      field: "expiryDate",
      headerName: "Expiry Date",
      flex: 1,
      renderCell: (param) => {
        return (
          <div className="flex flex-col items-center justify-center text-center pt-2">
            <ExpiryBadge expiryDate={param.row.expiryDate} />
            <p className="text-gray-400 text-[12px] text-sm  top-9 ">
              {param.value}
            </p>
          </div>
        );
      },
    },
    {
      field: "source",
      headerName: "Source",
      flex: 1,
      renderCell: (param) => {
        return <Chip label={param.value} size="small" variant="outlined" />;
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div className="">
        <div className="flex justify-between">
          <div className="">
            <h2 className="text-3xl font-bold ">{t("lotsPage.name")}</h2>
            <p className="text-gray-400">{t("lotsPage.desc")}</p>
          </div>
          <div className="">
            <Button variant="contained" color="error">
              + {t("actions.addButton")}
            </Button>
          </div>
        </div>
        {data ? (
          <div className="mt-5 shadow shadow-md">
            <Paper sx={{ height: "auto" }}>
              <DataGrid
                rows={data || []}
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`/lots/${params.id}`)}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
              />
            </Paper>
          </div>
        ) : (
          <p className="mt-5">No Lots Found</p>
        )}
      </div>
    </>
  );
}

export default Lots;
