import { Button, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import useProducts from "../../hooks/useProducts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

function Products() {
  const { data = [] } = useProducts();
  const navigate = useNavigate();
  const paginationModel = { page: 0, pageSize: 5 };
  const { t } = useTranslation();
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
          <h2 className="text-3xl font-bold">{t("productPage.desc")}</h2>
          <p className="text-gray-400">{t("productPage.desc")}</p>
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
              onRowClick={(params) => navigate(`/products/${params.id}`)}
              showToolbar
              checkboxSelection
              style={{ borderRadius: "20px" }}
              rows={data}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10, 15]}
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Products;
