import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
} from "@mui/material";
import moment from "moment";
import { useEffect, useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import z from "zod";
import useProducts from "../../hooks/useProducts";
import usePurchaseOrder from "../../hooks/usePurchaseOrder";
import useReceiveGoods from "../../hooks/useReceiveGoods";
import { type ReceiveGoodsPayload } from "../../types";
import { gt, lte, money, mul, qty, remaining, sum } from "../../utilties/money";
import { useToast } from "../common/ToastContext";

const today = new Date().toISOString().split("T")[0];

const lineSchema = z
  .object({
    purchaseOrderLineId: z.string(),
    productId: z.string(),
    productName: z.string(),
    uom: z.string(),
    remaining: z.string(),
    receive: z.boolean(),
    quantity: z.string(),
    unitCost: z.string(),
    supplierLotRef: z.string(),
    productionDate: z.string(),
    expiryDate: z.string(),
  })
  .refine((l) => !l.receive || gt(l.quantity || 0, 0), {
    message: "Qty must be > 0",
    path: ["quantity"],
  })
  .refine((l) => !l.receive || lte(l.quantity || 0, l.remaining), {
    message: "Exceeds remaining",
    path: ["quantity"],
  })
  .refine((l) => !l.receive || (l.productionDate?.length ?? 0) > 0, {
    message: "Required",
    path: ["productionDate"],
  })
  .refine((l) => !l.receive || (l.expiryDate?.length ?? 0) > 0, {
    message: "Required",
    path: ["expiryDate"],
  });

const schema = z.object({ lines: z.array(lineSchema) });

type FormData = z.infer<typeof schema>;

function ReceiveGoods() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: order } = usePurchaseOrder(id || "");
  const { data: products = [] } = useProducts();
  const { mutate, isPending } = useReceiveGoods(id || "");

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lines: [] },
  });

  const { fields } = useFieldArray({ control, name: "lines" });

  // Seed the field array once, after PO + products are loaded.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !order || products.length === 0) return;
    const open = order.lines
      .filter((l) => gt(remaining(l.orderedQuantity, l.receivedQuantity), 0))
      .map((l) => {
        const product = products.find((p) => p.id === l.productId);
        const rem = qty(remaining(l.orderedQuantity, l.receivedQuantity));
        const expiry =
          product?.shelfLifeDays != null
            ? moment(today).add(product.shelfLifeDays, "days").format("YYYY-MM-DD")
            : "";
        return {
          purchaseOrderLineId: l.id,
          productId: l.productId,
          productName: product?.name ?? l.productId,
          uom: l.uom,
          remaining: rem,
          receive: true,
          quantity: rem,
          unitCost: l.unitPrice,
          supplierLotRef: "",
          productionDate: today,
          expiryDate: expiry,
        };
      });
    reset({ lines: open });
    seeded.current = true;
  }, [order, products, reset]);

  const watched = watch("lines");
  const totalReceived = money(
    sum(
      (watched || [])
        .filter((l) => l.receive)
        .map((l) => mul(l.quantity || 0, l.unitCost || 0)),
    ),
  );
  const anySelected = (watched || []).some((l) => l.receive);

  const recomputeExpiry = (i: number, prodDate: string) => {
    const l = watched?.[i];
    const product = products.find((p) => p.id === l?.productId);
    if (product?.shelfLifeDays != null && prodDate) {
      setValue(
        `lines.${i}.expiryDate`,
        moment(prodDate).add(product.shelfLifeDays, "days").format("YYYY-MM-DD"),
      );
    }
  };

  const onSubmit = (data: FormData) => {
    if (!order) return;
    const payload: ReceiveGoodsPayload = {
      warehouseId: order.warehouseId,
      notes: null,
      lines: data.lines
        .filter((l) => l.receive)
        .map((l) => ({
          purchaseOrderLineId: l.purchaseOrderLineId,
          productId: l.productId,
          quantity: qty(l.quantity),
          uom: l.uom,
          unitCost: money(l.unitCost),
          supplierLotRef: l.supplierLotRef,
          productionDate: l.productionDate,
          expiryDate: l.expiryDate,
        })),
    };
    mutate(payload, {
      onSuccess: () => {
        toast.success(t("poReceive.success"));
        navigate(`/purchase-orders/${order.id}`);
      },
      onError: () => toast.error(t("poReceive.error")),
    });
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div className="max-w-[1000px]">
      <p className="text-xl font-semibold">
        {t("poReceive.title")} · {order.poNumber}
      </p>

      {fields.length === 0 ? (
        <p className="text-gray-400 mt-4">{t("poReceive.nothingToReceive")}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => {
              const active = watched?.[i]?.receive;
              return (
                <div
                  key={f.id}
                  className={`bg-white rounded-2xl border border-border p-[20px] ${
                    active ? "" : "opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{f.productName}</p>
                    <Controller
                      name={`lines.${i}.receive`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={t("poReceive.receiveLine")}
                        />
                      )}
                    />
                  </div>

                  <p className="text-gray-500 text-sm mb-3">
                    {t("poReceive.remaining")}: {watched?.[i]?.remaining}{" "}
                    {f.uom}
                  </p>

                  <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3">
                    <FormControl className="w-full">
                      <InputLabel shrink htmlFor={`qty-${i}`}>
                        {t("poReceive.quantity")}
                      </InputLabel>
                      <Input
                        id={`qty-${i}`}
                        type="number"
                        disabled={!active}
                        {...register(`lines.${i}.quantity`)}
                      />
                      <span className="text-red-500 text-sm">
                        {errors.lines?.[i]?.quantity?.message}
                      </span>
                    </FormControl>

                    <FormControl className="w-full">
                      <InputLabel shrink htmlFor={`cost-${i}`}>
                        {t("poReceive.unitCost")}
                      </InputLabel>
                      <Input
                        id={`cost-${i}`}
                        type="number"
                        disabled={!active}
                        {...register(`lines.${i}.unitCost`)}
                      />
                    </FormControl>

                    <FormControl className="w-full">
                      <InputLabel shrink htmlFor={`ref-${i}`}>
                        {t("poReceive.supplierLotRef")}
                      </InputLabel>
                      <Input
                        id={`ref-${i}`}
                        disabled={!active}
                        {...register(`lines.${i}.supplierLotRef`)}
                      />
                    </FormControl>

                    <FormControl className="w-full">
                      <InputLabel shrink htmlFor={`prod-${i}`}>
                        {t("poReceive.productionDate")}
                      </InputLabel>
                      <Controller
                        name={`lines.${i}.productionDate`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            id={`prod-${i}`}
                            type="date"
                            disabled={!active}
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              recomputeExpiry(i, e.target.value);
                            }}
                          />
                        )}
                      />
                      <span className="text-red-500 text-sm">
                        {errors.lines?.[i]?.productionDate?.message}
                      </span>
                    </FormControl>

                    <FormControl className="w-full">
                      <InputLabel shrink htmlFor={`exp-${i}`}>
                        {t("poReceive.expiryDate")}
                      </InputLabel>
                      <Input
                        id={`exp-${i}`}
                        type="date"
                        disabled={!active}
                        {...register(`lines.${i}.expiryDate`)}
                      />
                      <span className="text-red-500 text-sm">
                        {errors.lines?.[i]?.expiryDate?.message}
                      </span>
                    </FormControl>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-5 bg-white rounded-2xl border border-border p-[20px]">
            <div>
              <p className="text-gray-500 text-sm">
                {t("poReceive.totalReceived")}
              </p>
              <p className="text-xl font-bold">
                {totalReceived} {order.currency}
              </p>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={isPending || !anySelected}
            >
              {t("poReceive.submit")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReceiveGoods;
