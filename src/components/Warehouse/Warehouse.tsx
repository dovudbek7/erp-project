import { Button, Chip, Paper } from "@mui/material";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import useWarehouse from "../../hooks/useWarehouse";
import { useTranslation } from "react-i18next";

function Warehouse() {
  const { data } = useWarehouse();
  console.log(data);
  const { t } = useTranslation();
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (param) => {
        return <Chip label={param.value} variant="outlined" color="info" />;
      },
    },
  ];
  const paginationModel = { page: 0, pageSize: 5 };
  return (
    <div className="">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">{t("wareHousePage.name")}</h2>
          <p className="text-gray-400">{t("wareHousePage.desc")}</p>
        </div>
        <div className="">
          <Button variant="contained" color="error">
            + {t("actions.addButton")}
          </Button>
        </div>
      </div>
      <div className="">
        <div className="mt-5 shadow shadow-md">
          <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
            <DataGrid
              showToolbar
              checkboxSelection
              style={{ borderRadius: "20px" }}
              rows={data}
              // getRowId={}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Warehouse;
