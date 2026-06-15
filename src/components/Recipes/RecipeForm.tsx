import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import z from "zod";
import useProducts from "../../hooks/useProducts";
import useRecipe from "../../hooks/useRecipe";
import useCreateRecipe from "../../hooks/useCreateRecipe";
import useUpdateRecipe from "../../hooks/useUpdateRecipe";
import BackButton from "../common/BackButton";

const UOMS = ["KG", "G", "LITER", "PIECE"];

const ingredientSchema = z.object({
  productId: z.string().min(1, "Required"),
  quantity: z.string().min(1, "Required"),
  uom: z.string().min(1, "Required"),
  isOptional: z.boolean(),
  notes: z.string().optional(),
});

const schema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  outputProductId: z.string().min(1, "Output product is required"),
  outputQuantity: z.string().min(1, "Output quantity is required"),
  outputUom: z.string().min(1, "Required"),
  expectedYieldPercent: z.string().min(1, "Required"),
  notes: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient"),
});

type FormData = z.infer<typeof schema>;

const emptyIngredient = {
  productId: "",
  quantity: "",
  uom: "KG",
  isOptional: false,
  notes: "",
};

function RecipeForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: products = [] } = useProducts();
  const { data: existing } = useRecipe(id ?? "");
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(id ?? "");
  const mutation = isEdit ? updateRecipe : createRecipe;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      outputProductId: "",
      outputQuantity: "",
      outputUom: "KG",
      expectedYieldPercent: "",
      notes: "",
      ingredients: [emptyIngredient],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  // Prefill when editing an existing recipe.
  useEffect(() => {
    if (isEdit && existing) {
      reset({
        code: existing.code,
        name: existing.name,
        outputProductId: existing.outputProductId,
        outputQuantity: String(existing.outputQuantity),
        outputUom: existing.outputUom,
        expectedYieldPercent: String(existing.expectedYieldPercent),
        notes: existing.notes ?? "",
        ingredients: existing.ingredients.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          uom: i.uom,
          isOptional: i.isOptional,
          notes: i.notes ?? "",
        })),
      });
    }
  }, [isEdit, existing, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      code: data.code,
      name: data.name,
      outputProductId: data.outputProductId,
      outputQuantity: Number(data.outputQuantity),
      outputUom: data.outputUom,
      expectedYieldPercent: Number(data.expectedYieldPercent),
      notes: data.notes || null,
      ingredients: data.ingredients.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        uom: i.uom,
        isOptional: i.isOptional,
        notes: i.notes || null,
      })),
    };
    mutation.mutate(payload, {
      onSuccess: (recipe) => navigate(`/recipes/${recipe.id}`),
    });
  };

  return (
    <div className="w-full max-w-[820px]">
      <BackButton />
      <h2 className="text-3xl font-bold">
        {isEdit ? t("recipes.editTitle") : t("recipes.newTitle")}
      </h2>
      <p className="text-gray-400">
        {isEdit ? t("recipes.editDesc") : t("recipes.newDesc")}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-6"
      >
        <div className="bg-white border border-border rounded-2xl p-[25px] grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label={t("recipes.code")} {...register("code")} error={!!errors.code}
            helperText={errors.code?.message} />
          <TextField label={t("recipes.name")} {...register("name")} error={!!errors.name}
            helperText={errors.name?.message} />

          <FormControl fullWidth error={!!errors.outputProductId}>
            <InputLabel id="out-prod">{t("recipes.outputProduct")}</InputLabel>
            <Controller
              name="outputProductId"
              control={control}
              render={({ field }) => (
                <Select labelId="out-prod" label={t("recipes.outputProduct")} {...field}>
                  {products
                    .filter((p) => p.type === "FINISHED_GOOD")
                    .map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
            <span className="text-red-500 text-xs">
              {errors.outputProductId?.message}
            </span>
          </FormControl>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label={t("recipes.outputQty")}
              type="number"
              {...register("outputQuantity")}
              error={!!errors.outputQuantity}
              helperText={errors.outputQuantity?.message}
            />
            <FormControl fullWidth>
              <InputLabel id="out-uom">{t("recipes.uom")}</InputLabel>
              <Controller
                name="outputUom"
                control={control}
                render={({ field }) => (
                  <Select labelId="out-uom" label={t("recipes.uom")} {...field}>
                    {UOMS.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </div>

          <TextField
            label={t("recipes.expectedYield")}
            type="number"
            {...register("expectedYieldPercent")}
            error={!!errors.expectedYieldPercent}
            helperText={errors.expectedYieldPercent?.message}
          />
          <TextField label={t("recipes.notes")} {...register("notes")} />
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-border rounded-2xl p-[25px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">{t("recipes.ingredients")}</p>
            <Button
              size="small"
              startIcon={<FiPlus />}
              onClick={() => append({ ...emptyIngredient })}
            >
              {t("recipes.addIngredient")}
            </Button>
          </div>

          {typeof errors.ingredients?.message === "string" && (
            <p className="text-red-500 text-sm mb-2">
              {t("recipes.atLeastOne")}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 items-center"
              >
                <FormControl fullWidth size="small">
                  <InputLabel id={`ing-prod-${idx}`}>
                    {t("recipes.product")}
                  </InputLabel>
                  <Controller
                    name={`ingredients.${idx}.productId`}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        labelId={`ing-prod-${idx}`}
                        label={t("recipes.product")}
                        {...f}
                      >
                        {products
                          .filter((p) => p.type === "RAW_MATERIAL")
                          .map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <TextField
                  size="small"
                  type="number"
                  label={t("recipes.quantity")}
                  {...register(`ingredients.${idx}.quantity`)}
                />

                <FormControl size="small">
                  <InputLabel id={`ing-uom-${idx}`}>
                    {t("recipes.uom")}
                  </InputLabel>
                  <Controller
                    name={`ingredients.${idx}.uom`}
                    control={control}
                    render={({ field: f }) => (
                      <Select labelId={`ing-uom-${idx}`} label={t("recipes.uom")} {...f}>
                        {UOMS.map((u) => (
                          <MenuItem key={u} value={u}>
                            {u}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <Controller
                  name={`ingredients.${idx}.isOptional`}
                  control={control}
                  render={({ field: f }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                        />
                      }
                      label={t("recipes.opt")}
                    />
                  )}
                />

                <IconButton
                  color="error"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                >
                  <FiTrash2 />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm" role="alert">
            {t("recipes.saveError")}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("recipes.saving")
              : isEdit
                ? t("recipes.publishNewVersion")
                : t("recipes.createRecipe")}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/recipes")}>
            {t("recipes.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
