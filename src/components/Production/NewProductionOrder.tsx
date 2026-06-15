import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import z from "zod";
import useRecipes from "../../hooks/useRecipes";
import useWarehouse from "../../hooks/useWarehouse";
import useCreateProductionOrder from "../../hooks/useCreateProductionOrder";
import BackButton from "../common/BackButton";

const today = new Date().toISOString().split("T")[0];

const schema = z.object({
  recipeId: z.string().min(1, "Recipe is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  plannedOutputQuantity: z
    .string()
    .min(1, "Planned output is required")
    .refine((v) => Number(v) > 0, "Must be greater than 0"),
  scheduledFor: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function NewProductionOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: recipes = [] } = useRecipes();
  const { data: warehouses = [] } = useWarehouse();
  const createOrder = useCreateProductionOrder();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    // Default to the production floor warehouse from the seed.
    defaultValues: { scheduledFor: today, warehouseId: "wh-002" },
  });

  const onSubmit = (data: FormData) => {
    createOrder.mutate(
      {
        recipeId: data.recipeId,
        warehouseId: data.warehouseId,
        plannedOutputQuantity: data.plannedOutputQuantity,
        scheduledFor: new Date(data.scheduledFor).toISOString(),
        notes: data.notes || null,
      },
      {
        onSuccess: (order) => navigate(`/production/orders/${order.id}`),
      },
    );
  };

  return (
    <div className="w-full max-w-[900px]">
      <BackButton />
      <h2 className="text-3xl font-bold">{t("production.newOrder")}</h2>
      <p className="text-gray-400">{t("production.newDesc")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
        <div className="bg-white rounded-2xl border border-border p-[25px_20px] grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormControl fullWidth>
            <InputLabel id="recipe-label">{t("production.recipe")}</InputLabel>
            <Controller
              name="recipeId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  labelId="recipe-label"
                  label={t("production.recipe")}
                  {...field}
                >
                  {recipes
                    .filter((r) => r.isActive)
                    .map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name} (v{r.version})
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
            <span className="text-red-500 text-sm">
              {errors.recipeId?.message}
            </span>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="wh-label">{t("production.warehouse")}</InputLabel>
            <Controller
              name="warehouseId"
              control={control}
              defaultValue="wh-002"
              render={({ field }) => (
                <Select
                  labelId="wh-label"
                  label={t("production.warehouse")}
                  {...field}
                >
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <span className="text-red-500 text-sm">
              {errors.warehouseId?.message}
            </span>
          </FormControl>

          <FormControl className="w-full">
            <InputLabel shrink htmlFor="planned-output">
              {t("production.plannedOutputKg")}
            </InputLabel>
            <Input
              id="planned-output"
              type="number"
              {...register("plannedOutputQuantity")}
            />
            <span className="text-red-500 text-sm">
              {errors.plannedOutputQuantity?.message}
            </span>
          </FormControl>

          <FormControl className="w-full">
            <InputLabel shrink htmlFor="scheduled-for">
              {t("production.scheduledFor")}
            </InputLabel>
            <Input id="scheduled-for" type="date" {...register("scheduledFor")} />
            <span className="text-red-500 text-sm">
              {errors.scheduledFor?.message}
            </span>
          </FormControl>

          <div className="col-span-2">
            <TextField
              label={t("production.notes")}
              multiline
              minRows={2}
              fullWidth
              {...register("notes")}
            />
          </div>
        </div>

        {createOrder.isError && (
          <p className="text-red-500 text-sm mt-3" role="alert">
            {t("production.createError")}
          </p>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outlined"
            onClick={() => navigate("/production/orders")}
          >
            {t("production.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending
              ? t("production.creating")
              : t("production.createDraft")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewProductionOrder;
