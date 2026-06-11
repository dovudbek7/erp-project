import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router";
import z from "zod";
import useCreatePurchaseOrder from "../../hooks/useCreatePurchaseOrder";
import useProducts from "../../hooks/useProducts";
import useSuppliers from "../../hooks/useSuppliers";
import useWarehouse from "../../hooks/useWarehouse";
import { type CreatePurchaseOrderPayload } from "../../types";
import { gt, gte, money, mul, sum } from "../../utilties/money";
import BackButton from "../common/BackButton";
import { useToast } from "../common/ToastContext";

const lineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  uom: z.string().min(1, "UOM is required"),
  orderedQuantity: z
    .string()
    .min(1, "Required")
    .refine((v) => gt(v, 0), "Must be > 0"),
  unitPrice: z
    .string()
    .min(1, "Required")
    .refine((v) => gte(v, 0), "Must be >= 0"),
});

const schema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  expectedDate: z.string().min(1, "Expected date is required"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
});

type FormData = z.infer<typeof schema>;

const emptyLine = {
  productId: "",
  uom: "",
  orderedQuantity: "",
  unitPrice: "",
};

function CreatePurchaseOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: suppliers = [] } = useSuppliers();
  const { data: warehouses = [] } = useWarehouse();
  const { data: products = [] } = useProducts();
  const { mutate, isPending } = useCreatePurchaseOrder();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      warehouseId: "",
      expectedDate: "",
      currency: "UZS",
      notes: "",
      lines: [emptyLine],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchedLines = watch("lines");
  const lineTotal = (i: number) => {
    const l = watchedLines?.[i];
    if (!l?.orderedQuantity || !l?.unitPrice) return "0.00";
    return money(mul(l.orderedQuantity, l.unitPrice));
  };
  const grandTotal = money(
    sum(
      (watchedLines || []).map((l) =>
        mul(l.orderedQuantity || 0, l.unitPrice || 0),
      ),
    ),
  );

  const onSubmit = (data: FormData) => {
    const payload: CreatePurchaseOrderPayload = {
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      expectedDate: data.expectedDate,
      currency: data.currency,
      notes: data.notes || null,
      status: "DRAFT",
      lines: data.lines.map((l) => ({
        productId: l.productId,
        orderedQuantity: l.orderedQuantity,
        uom: l.uom,
        unitPrice: l.unitPrice,
      })),
    };
    mutate(payload, {
      onSuccess: (po) => {
        toast.success(t("poCreate.success"));
        navigate(`/purchase-orders/${po.id}`);
      },
      onError: () => toast.error(t("poCreate.error")),
    });
  };

  return (
    <div className="max-w-[900px]">
      <BackButton />
      <p className="text-xl font-semibold">{t("poCreate.title")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-border p-[25px_20px] grid grid-cols-2 gap-5">
          <FormControl fullWidth>
            <InputLabel id="supplier-label">{t("poCreate.supplier")}</InputLabel>
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="supplier-label"
                  label={t("poCreate.supplier")}
                  {...field}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <span className="text-red-500 text-sm">
              {errors.supplierId?.message}
            </span>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="warehouse-label">
              {t("poCreate.warehouse")}
            </InputLabel>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="warehouse-label"
                  label={t("poCreate.warehouse")}
                  {...field}
                >
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
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
            <InputLabel shrink htmlFor="po-expected">
              {t("poCreate.expectedDate")}
            </InputLabel>
            <Input
              id="po-expected"
              type="date"
              {...register("expectedDate")}
            />
            <span className="text-red-500 text-sm">
              {errors.expectedDate?.message}
            </span>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="currency-label">{t("poCreate.currency")}</InputLabel>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="currency-label"
                  label={t("poCreate.currency")}
                  {...field}
                >
                  <MenuItem value="UZS">UZS</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-2xl border border-border p-[25px_20px] mt-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">{t("poCreate.lines")}</p>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => append(emptyLine)}
            >
              + {t("poCreate.addLine")}
            </Button>
          </div>

          {typeof errors.lines?.message === "string" && (
            <span className="text-red-500 text-sm">{errors.lines.message}</span>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-start"
              >
                <FormControl fullWidth>
                  <InputLabel id={`product-${i}`}>
                    {t("poCreate.product")}
                  </InputLabel>
                  <Controller
                    name={`lines.${i}.productId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId={`product-${i}`}
                        label={t("poCreate.product")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const p = products.find(
                            (pr) => pr.id === e.target.value,
                          );
                          if (p) setValue(`lines.${i}.uom`, p.uom);
                        }}
                      >
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <span className="text-red-500 text-sm">
                    {errors.lines?.[i]?.productId?.message}
                  </span>
                </FormControl>

                <FormControl className="w-full">
                  <InputLabel shrink htmlFor={`qty-${i}`}>
                    {t("poCreate.qty")}
                  </InputLabel>
                  <Input
                    id={`qty-${i}`}
                    type="number"
                    {...register(`lines.${i}.orderedQuantity`)}
                  />
                  <span className="text-red-500 text-sm">
                    {errors.lines?.[i]?.orderedQuantity?.message}
                  </span>
                </FormControl>

                <FormControl className="w-full">
                  <InputLabel shrink htmlFor={`price-${i}`}>
                    {t("poCreate.unitPrice")}
                  </InputLabel>
                  <Input
                    id={`price-${i}`}
                    type="number"
                    {...register(`lines.${i}.unitPrice`)}
                  />
                  <span className="text-red-500 text-sm">
                    {errors.lines?.[i]?.unitPrice?.message}
                  </span>
                </FormControl>

                <div className="pt-4 text-sm">
                  <p className="text-gray-500 text-xs">{t("poCreate.lineTotal")}</p>
                  <p className="font-semibold">{lineTotal(i)}</p>
                </div>

                <IconButton
                  aria-label="remove"
                  color="error"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                  className="mt-3"
                >
                  <FaTrash size={14} />
                </IconButton>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-5 border-t border-border pt-4">
            <div className="text-right">
              <p className="text-gray-500 text-sm">{t("poCreate.total")}</p>
              <p className="text-xl font-bold">{grandTotal}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="submit"
            variant="outlined"
            disabled={isPending}
          >
            {t("poCreate.saveDraft")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={isPending}
          >
            {t("poCreate.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePurchaseOrder;
