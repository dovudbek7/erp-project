import { Button, colors, Paper } from "@mui/material";
import useLots from "../hooks/useLots";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import moment from "moment";
function Lots() {
  const { data, error, isLoading } = useLots();

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "lotNumber", headerName: "Lot Number", flex: 1 },
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
        const status = params.value;

        // Statusga qarab ranglarni belgilaymiz
        let color:
          | "default"
          | "primary"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "warning" = "default";

        if (status === "AVAILABLE") color = "success";
        if (status === "RESERVED") color = "warning";
        if (status === "SOLD_OUT") color = "error";

        return (
          <Chip
            label={status}
            color={color}
            variant="outlined"
            size="small"
            sx={{ fontWeight: "bold", textTransform: "capitalize" }}
          />
        );
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
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getUTCDate();
        const now = year + "-" + month + "-" + day;

        const eDate = moment(param.row.expiryDate);

        const total = eDate.diff(now, "days");

        const expired = total > 0 ? total + "D Left" : "Expired";

        return (
          <div className="flex flex-col items-center justify-center text-center pt-2">
            <Chip
              label={expired}
              color={total < 0 ? "error" : "default"}
              variant="outlined"
              size="small"
              className=""
            />
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
            <h2 className="text-3xl font-bold">Lots</h2>
            <p className="text-gray-400">
              All inventory batches with cost and expiry tracking.
            </p>
          </div>
          <div className="">
            <Button variant="contained" color="error">
              + Add
            </Button>
          </div>
        </div>
        <div className="mt-5 shadow shadow-md">
          <Paper sx={{ height: "auto" }}>
            <DataGrid
              rows={data}
              // getRowId={}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
    </>
  );
}

export default Lots;
