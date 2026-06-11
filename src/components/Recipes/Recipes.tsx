import { useMemo } from "react";
import { Button, Chip, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useRecipes from "../../hooks/useRecipes";
import useProducts from "../../hooks/useProducts";
import { CACHE_KEY_RECIPES } from "../../constants.production";
import useGridSelection from "../../hooks/useGridSelection";
import BackButton from "../common/BackButton";
import DeleteSelectedBar from "../common/DeleteSelectedBar";

function Recipes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data = [], error, isLoading } = useRecipes();
  const { data: products = [] } = useProducts();
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const productName = useMemo(() => {
    const m = new Map(products.map((p) => [p.id, p.name]));
    return (id: string) => m.get(id) ?? id;
  }, [products]);

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: t("recipes.code"),
      flex: 1,
      renderCell: (p) => (
        <Link to={`/recipes/${p.id}`} className="text-blue-600 font-medium">
          {p.row.code}
        </Link>
      ),
    },
    { field: "name", headerName: t("recipes.name"), flex: 1.4 },
    {
      field: "outputProductId",
      headerName: t("recipes.output"),
      flex: 1.2,
      valueGetter: (_v, row) => productName(row.outputProductId),
    },
    {
      field: "version",
      headerName: t("recipes.version"),
      flex: 0.6,
      renderCell: (p) => <span>v{p.value}</span>,
    },
    {
      field: "expectedYieldPercent",
      headerName: t("recipes.targetYield"),
      flex: 0.8,
      renderCell: (p) => <span>{p.value}%</span>,
    },
    {
      field: "isActive",
      headerName: t("recipes.status"),
      flex: 0.8,
      renderCell: (p) =>
        p.value ? (
          <Chip
            label={t("recipes.active")}
            color="success"
            size="small"
            variant="outlined"
          />
        ) : (
          <Chip label={t("recipes.retired")} size="small" variant="outlined" />
        ),
    },
  ];

  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <BackButton />
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{t("recipes.title")}</h2>
          <p className="text-gray-400">{t("recipes.desc")}</p>
        </div>
        <Button
          variant="contained"
          color="error"
          onClick={() => navigate("/recipes/new")}
        >
          + {t("recipes.newRecipe")}
        </Button>
      </div>

      <div className="mt-5">
        <DeleteSelectedBar
          selectedIds={selectedIds}
          endpoint="recipes"
          queryKey={CACHE_KEY_RECIPES}
          label="recipe"
          onDone={clear}
        />
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
            checkboxSelection
            onRowSelectionModelChange={onRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
          />
        </Paper>
      </div>
    </div>
  );
}

export default Recipes;
