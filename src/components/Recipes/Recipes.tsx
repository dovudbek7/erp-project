import { useMemo } from "react";
import { Button, Chip, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router";
import useRecipes from "../../hooks/useRecipes";
import useProducts from "../../hooks/useProducts";

function Recipes() {
  const navigate = useNavigate();
  const { data = [], error, isLoading } = useRecipes();
  const { data: products = [] } = useProducts();

  const productName = useMemo(() => {
    const m = new Map(products.map((p) => [p.id, p.name]));
    return (id: string) => m.get(id) ?? id;
  }, [products]);

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "Code",
      flex: 1,
      renderCell: (p) => (
        <Link to={`/recipes/${p.id}`} className="text-blue-600 font-medium">
          {p.row.code}
        </Link>
      ),
    },
    { field: "name", headerName: "Name", flex: 1.4 },
    {
      field: "outputProductId",
      headerName: "Output",
      flex: 1.2,
      valueGetter: (_v, row) => productName(row.outputProductId),
    },
    {
      field: "version",
      headerName: "Version",
      flex: 0.6,
      renderCell: (p) => <span>v{p.value}</span>,
    },
    {
      field: "expectedYieldPercent",
      headerName: "Target yield",
      flex: 0.8,
      renderCell: (p) => <span>{p.value}%</span>,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.8,
      renderCell: (p) =>
        p.value ? (
          <Chip label="Active" color="success" size="small" variant="outlined" />
        ) : (
          <Chip label="Retired" size="small" variant="outlined" />
        ),
    },
  ];

  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Recipes</h2>
          <p className="text-gray-400">
            Bill of materials for each finished good.
          </p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/recipes/new")}
        >
          + New recipe
        </Button>
      </div>

      <div className="mt-5 shadow-md">
        <Paper style={{ borderRadius: "20px" }}>
          <DataGrid
            style={{ borderRadius: "20px" }}
            rows={data}
            loading={isLoading}
            getRowId={(row) => row.id}
            columns={columns}
            onRowClick={(p) => navigate(`/recipes/${p.id}`)}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25]}
            sx={{ border: 0, cursor: "pointer" }}
            showToolbar
          />
        </Paper>
      </div>
    </div>
  );
}

export default Recipes;
