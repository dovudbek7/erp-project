import { Button, Paper } from "@mui/material";
import useLots from "../hooks/useLots";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import moment from "moment";
function Lots() {
  const { data, error, isLoading } = useLots();

  // const rows = data?.map((d) => ({
  //   id: d.id,
  //   lotNumber: d.lotNumber,
  //   product: d.productId,
  //   warehouse: d.warehouseId,
  //   status: d.status,
  //   unitCost: d.unitCost,
  //   // unit: d.costPerUnit,
  // }));

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID" },
    { field: "lotNumber", headerName: "Lot Number" },
    { field: "productId", headerName: "Product" },
    {
      field: "warehouseId",
      headerName: "Warehouse",
    },
    {
      field: "status",
      headerName: "Status",
      description: "This column has a value getter and is not sortable.",
      width: 120,
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
      width: 110,
      renderCell: (param) => {
        return <p>{param.value} UZS</p>;
      },
    },
    {
      field: "currentQuantity",
      headerName: "Current QTY",
      width: 100,
      renderCell: (param) => {
        return <p>{param.value} KG</p>;
      },
    },

    {
      field: "expiryDate",
      headerName: "Expiry Date",
      width: 120,
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
      width: 130,
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
        <div className="mt-5">
          <Paper sx={{ height: "auto", width: "100%", borderRadius: "15px" }}>
            <DataGrid
              rows={data}
              // getRowId={}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0, borderRadius: "15px" }}
            />
          </Paper>
        </div>
      </div>
    </>
  );
}

export default Lots;
