import {
  Button,
  Paper
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import useProducts from "../hooks/useProducts";

function Products() {
  const { data = [] } = useProducts();
  const paginationModel = { page: 0, pageSize: 10 };

  const columns: GridColDef[] = [
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "uom", headerName: "UOM", flex: 1 },
  ];

  return (
    <div className="">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">Warehouses</h2>
          <p className="text-gray-400">Manage your storage locations.</p>
        </div>
        <div className="">
          <Button variant="contained" color="error">
            + Add
          </Button>
        </div>
      </div>
      <div className="">
        <div className="mt-5 shadow shadow-md">
          <Paper sx={{ height: "auto" }}>
            <DataGrid
              rows={data}
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

export default Products;
