import { useMemo } from "react";
import {
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import useRecipe from "../../hooks/useRecipe";
import useProducts from "../../hooks/useProducts";
import type { Product } from "../../types";

function RecipeDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: recipe, error, isLoading } = useRecipe(id);
  const { data: products = [] } = useProducts();

  const productsById = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  if (isLoading) return <p>{t("recipes.loading")}</p>;
  if (error) return <p>{error.message}</p>;
  if (!recipe) return <p>{t("recipes.notFound")}</p>;

  return (
    <div>
      <Link to="/recipes" className="text-blue-600 text-sm">
        ← {t("recipes.back")}
      </Link>

      <div className="mt-3 bg-white border border-border rounded-2xl p-[25px]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{recipe.name}</h2>
              <Chip label={`v${recipe.version}`} size="small" />
              {recipe.isActive ? (
                <Chip
                  label={t("recipes.active")}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip label={t("recipes.retired")} size="small" variant="outlined" />
              )}
            </div>
            <p className="text-gray-500 mt-1">{recipe.code}</p>
          </div>
          <Button
            variant="outlined"
            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          >
            {t("recipes.editNewVersion")}
          </Button>
        </div>

        <div className="grid grid-cols-3 mt-5 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t("recipes.outputProduct")}</p>
            <p className="font-medium">
              {productsById.get(recipe.outputProductId)?.name ??
                recipe.outputProductId}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("recipes.nominalOutput")}</p>
            <p className="font-medium">
              {recipe.outputQuantity} {recipe.outputUom}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("recipes.targetYield")}</p>
            <p className="font-medium">{recipe.expectedYieldPercent}%</p>
          </div>
        </div>
        {recipe.notes && (
          <p className="text-gray-500 text-sm mt-4">{recipe.notes}</p>
        )}
      </div>

      <div className="mt-5 bg-white border border-border rounded-2xl overflow-hidden">
        <div className="border-b border-border px-[25px] py-[15px]">
          <p className="font-semibold">{t("recipes.ingredients")}</p>
        </div>
        <Paper elevation={0}>
          <Table aria-label={t("recipes.ingredients")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("recipes.product")}</TableCell>
                <TableCell align="right">{t("recipes.quantity")}</TableCell>
                <TableCell>{t("recipes.uom")}</TableCell>
                <TableCell>{t("recipes.optional")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipe.ingredients.map((ing) => (
                <TableRow key={ing.id}>
                  <TableCell>
                    {productsById.get(ing.productId)?.name ?? ing.productId}
                  </TableCell>
                  <TableCell align="right">{ing.quantity}</TableCell>
                  <TableCell>{ing.uom}</TableCell>
                  <TableCell>
                    {ing.isOptional ? (
                      <Chip
                        label={t("recipes.optional")}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
}

export default RecipeDetail;
