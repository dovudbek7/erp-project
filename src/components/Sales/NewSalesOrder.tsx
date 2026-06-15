import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import z from "zod";
import useAvailability from "../../hooks/useAvailability";
import useCreateSalesOrder from "../../hooks/useCreateSalesOrder";
import useCustomers from "../../hooks/useCustomers";
import usePriceList from "../../hooks/usePriceList";
import useProducts from "../../hooks/useProducts";
import useWarehouse from "../../hooks/useWarehouse";
import type { CreateSalesOrderPayload } from "../../types/sales";
import { gt } from "../../utilties/money";
import BackButton from "../common/BackButton";
import { useToast } from "../common/ToastContext";
import { subtotalOf, taxOf, totalOf } from "./salesUtils";

const today = new Date().toISOString().split("T")[0];

type TFunc = (key: string) => string;

const makeSchema = (t: TFunc) => {
  const lineSchema = z.object({
    productId: z.string().min(1, t("sales.new.errProductRequired")),
    uom: z.string().min(1),
    orderedQuantity: z
      .string()
      .min(1, t("sales.new.errRequired"))
      .refine((v) => gt(v, 0), t("sales.new.errMustBePositive")),
    unitPrice: z.string().min(1, t("sales.new.errRequired")),
  });

  return z.object({
    customerId: z.string().min(1, t("sales.new.errCustomerRequired")),
    warehouseId: z.string().min(1, t("sales.new.errWarehouseRequired")),
    promisedDate: z.string().min(1, t("sales.new.errPromisedRequired")),
    notes: z.string().optional(),
    lines: z.array(lineSchema).min(1, t("sales.new.errAddLine")),
  });
};

type FormData = z.infer<ReturnType<typeof makeSchema>>;

const emptyLine = { productId: "", uom: "", orderedQuantity: "", unitPrice: "" };

// Per-line availability check lives in a child so the hook count stays stable.
function AvailabilityNote({
  control,
  index,
}: {
  control: Control<FormData>;
  index: number;
}) {
  const { t } = useTranslation();
  const productId = useWatch({ control, name: `lines.${index}.productId` });
  const ordered = useWatch({ control, name: `lines.${index}.orderedQuantity` });
  const { data } = useAvailability(productId || "", !!productId);

  if (!productId || !data) return <span className="text-gray-400 text-xs">—</span>;
  const short = ordered ? gt(ordered, data.available) : false;
  return (
    <span className={`text-xs ${short ? "text-red-600 font-semibold" : "text-gray-500"}`}>
      {t("sales.new.avail", { qty: data.available })}
      {short ? t("sales.new.notEnough") : ""}
    </span>
  );
}

function LineRow({
  control,
  register,
  setValue,
  index,
  remove,
  canRemove,
  products,
  priceFor,
  error,
}: {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  setValue: UseFormSetValue<FormData>;
  index: number;
  remove: (i: number) => void;
  canRemove: boolean;
  products: { id: string; name: string; uom: string }[];
  priceFor: (productId: string) => string;
  error?: { productId?: { message?: string }; orderedQuantity?: { message?: string } };
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[2.2fr_1fr_1.2fr_1.2fr_auto] gap-3 items-start">
      <Controller
        name={`lines.${index}.productId`}
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={products}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            value={products.find((p) => p.id === field.value) ?? null}
            onChange={(_, v) => {
              field.onChange(v?.id ?? "");
              if (v) {
                setValue(`lines.${index}.uom`, v.uom);
                setValue(`lines.${index}.unitPrice`, priceFor(v.id));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={t("sales.new.product")}
                error={!!error?.productId}
                helperText={error?.productId?.message}
              />
            )}
          />
        )}
      />

      <TextField
        size="small"
        type="number"
        label={t("sales.new.qty")}
        error={!!error?.orderedQuantity}
        helperText={error?.orderedQuantity?.message}
        {...register(`lines.${index}.orderedQuantity`)}
      />

      <TextField
        size="small"
        type="number"
        label={t("sales.new.unitPrice")}
        {...register(`lines.${index}.unitPrice`)}
      />

      <div className="pt-2">
        <AvailabilityNote control={control} index={index} />
      </div>

      <IconButton
        color="error"
        onClick={() => remove(index)}
        disabled={!canRemove}
        className="mt-1"
      >
        <FiTrash2 />
      </IconButton>
    </div>
  );
}

function NewSalesOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: customers = [] } = useCustomers();
  const { data: warehouses = [] } = useWarehouse();
  const { data: allProducts = [] } = useProducts();
  const { mutate, isPending } = useCreateSalesOrder();

  const fgProducts = allProducts.filter((p) => p.type === "FINISHED_GOOD");

  const schema = useMemo(() => makeSchema(t), [t]);

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
      customerId: "",
      warehouseId: "",
      promisedDate: "",
      notes: "",
      lines: [emptyLine],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  // When a customer is picked, load their price list to drive line pricing.
  const customerId = watch("customerId");
  const customer = customers.find((c) => c.id === customerId);
  const { data: priceList } = usePriceList(customer?.priceListId ?? "");
  const priceFor = (productId: string) =>
    priceList?.items.find((i) => i.productId === productId)?.unitPrice ?? "";

  // Re-price existing lines when the price list arrives/changes.
  const lines = watch("lines");
  useEffect(() => {
    if (!priceList) return;
    lines.forEach((l, i) => {
      if (l.productId) setValue(`lines.${i}.unitPrice`, priceFor(l.productId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceList?.id]);

  const subtotal = subtotalOf(lines || []);
  const tax = taxOf(subtotal);
  const total = totalOf(subtotal);

  const onSubmit = (data: FormData) => {
    const payload: CreateSalesOrderPayload = {
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      orderDate: today,
      promisedDate: data.promisedDate,
      notes: data.notes || null,
      lines: data.lines.map((l) => ({
        productId: l.productId,
        orderedQuantity: l.orderedQuantity,
        uom: l.uom,
        unitPrice: l.unitPrice,
      })),
    };
    mutate(payload, {
      onSuccess: (so) => {
        toast.success(t("sales.new.createdSuccess"));
        navigate(`/sales/orders/${so.id}`);
      },
      onError: () => toast.error(t("sales.new.createError")),
    });
  };

  return (
    <div className="w-full max-w-[1000px]">
      <BackButton />
      <h2 className="text-2xl font-bold">{t("sales.new.title")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-border p-4 md:p-[25px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={customers}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                value={customers.find((c) => c.id === field.value) ?? null}
                onChange={(_, v) => field.onChange(v?.id ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label={t("sales.new.customer")}
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                  />
                )}
              />
            )}
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="wh-label">{t("sales.new.warehouse")}</InputLabel>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <Select labelId="wh-label" label={t("sales.new.warehouse")} {...field}>
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <TextField
            size="small"
            type="date"
            label={t("sales.new.promisedDate")}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.promisedDate}
            helperText={errors.promisedDate?.message}
            {...register("promisedDate")}
          />
        </div>

        {/* Lines */}
        <div className="bg-white rounded-2xl border border-border p-4 md:p-[25px] mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">{t("sales.new.lineItems")}</p>
            <Button size="small" variant="outlined" onClick={() => append(emptyLine)}>
              {t("sales.new.addLine")}
            </Button>
          </div>

          {typeof errors.lines?.message === "string" && (
            <p className="text-red-500 text-sm mb-2">{errors.lines.message}</p>
          )}

          <div className="flex flex-col gap-4">
            {fields.map((f, i) => (
              <LineRow
                key={f.id}
                control={control}
                register={register}
                setValue={setValue}
                index={i}
                remove={remove}
                canRemove={fields.length > 1}
                products={fgProducts}
                priceFor={priceFor}
                error={errors.lines?.[i]}
              />
            ))}
          </div>

          <div className="flex justify-end mt-5 border-t border-border pt-4">
            <div className="text-right text-sm flex flex-col gap-1">
              <p className="text-gray-500">
                {t("sales.new.subtotal")}:{" "}
                <span className="text-black font-medium">{subtotal}</span>
              </p>
              <p className="text-gray-500">
                {t("sales.new.tax")}:{" "}
                <span className="text-black font-medium">{tax}</span>
              </p>
              <p className="text-lg font-bold">
                {t("sales.new.total")}: {total}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit" variant="contained" color="error" disabled={isPending}>
            {t("sales.new.saveDraft")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewSalesOrder;
