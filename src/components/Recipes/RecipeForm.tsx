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
import { useNavigate, useParams } from "react-router";
import z from "zod";
import useProducts from "../../hooks/useProducts";
import useRecipe from "../../hooks/useRecipe";
import useCreateRecipe from "../../hooks/useCreateRecipe";
import useUpdateRecipe from "../../hooks/useUpdateRecipe";

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
    <div className="max-w-[820px]">
      <h2 className="text-3xl font-bold">
        {isEdit ? "Edit recipe (new version)" : "New recipe"}
      </h2>
      <p className="text-gray-400">
        {isEdit
          ? "Saving publishes a new version; the current version is retired."
          : "Define the output and ingredient lines."}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-6"
      >
        <div className="bg-white border border-border rounded-2xl p-[25px] grid grid-cols-2 gap-5">
          <TextField label="Code" {...register("code")} error={!!errors.code}
            helperText={errors.code?.message} />
          <TextField label="Name" {...register("name")} error={!!errors.name}
            helperText={errors.name?.message} />

          <FormControl fullWidth error={!!errors.outputProductId}>
            <InputLabel id="out-prod">Output product</InputLabel>
            <Controller
              name="outputProductId"
              control={control}
              render={({ field }) => (
                <Select labelId="out-prod" label="Output product" {...field}>
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

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Output qty"
              type="number"
              {...register("outputQuantity")}
              error={!!errors.outputQuantity}
              helperText={errors.outputQuantity?.message}
            />
            <FormControl fullWidth>
              <InputLabel id="out-uom">UOM</InputLabel>
              <Controller
                name="outputUom"
                control={control}
                render={({ field }) => (
                  <Select labelId="out-uom" label="UOM" {...field}>
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
            label="Expected yield %"
            type="number"
            {...register("expectedYieldPercent")}
            error={!!errors.expectedYieldPercent}
            helperText={errors.expectedYieldPercent?.message}
          />
          <TextField label="Notes" {...register("notes")} />
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-border rounded-2xl p-[25px]">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Ingredients</p>
            <Button
              size="small"
              startIcon={<FiPlus />}
              onClick={() => append({ ...emptyIngredient })}
            >
              Add ingredient
            </Button>
          </div>

          {typeof errors.ingredients?.message === "string" && (
            <p className="text-red-500 text-sm mb-2">
              {errors.ingredients.message}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 items-center"
              >
                <FormControl fullWidth size="small">
                  <InputLabel id={`ing-prod-${idx}`}>Product</InputLabel>
                  <Controller
                    name={`ingredients.${idx}.productId`}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        labelId={`ing-prod-${idx}`}
                        label="Product"
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
                  label="Quantity"
                  {...register(`ingredients.${idx}.quantity`)}
                />

                <FormControl size="small">
                  <InputLabel id={`ing-uom-${idx}`}>UOM</InputLabel>
                  <Controller
                    name={`ingredients.${idx}.uom`}
                    control={control}
                    render={({ field: f }) => (
                      <Select labelId={`ing-uom-${idx}`} label="UOM" {...f}>
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
                      label="Opt."
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
          <p className="text-red-500 text-sm">Could not save the recipe.</p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving…"
              : isEdit
                ? "Publish new version"
                : "Create recipe"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/recipes")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
