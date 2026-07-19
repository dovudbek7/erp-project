import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import z from "zod";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CACHE_KEY_LOTS } from "../../constants";
import useGridSelection from "../../hooks/useGridSelection";
import useLots from "../../hooks/useLots";
import useProducts from "../../hooks/useProducts";
import useWarehouse from "../../hooks/useWarehouse";
import lotService from "../../services/lotService";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";
import ExpiryBadge from "../common/ExpiryBadge";
import Status from "../common/StatusBadge";

const today = new Date().toISOString().split("T")[0];

const schema = z.object({
  lotNumber: z.string().min(1, "Lot number is required"),
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  status: z.string().min(1, "Status is required"),
  source: z.string().min(1, "Source is required"),
  initialQuantity: z.string().min(1, "Quantity is required"),
  currentQuantity: z.string().min(1, "Quantity is required"),
  uom: z.string().min(1, "UOM is required"),
  unitCost: z.string().min(1, "Unit cost is required"),
  currency: z.string().min(1, "Currency is required"),
  productionDate: z.string().min(1, "Production date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type FormData = z.infer<typeof schema>;

const AddLot = ({ onClose }: { onClose: () => void }) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productionDate: today },
  });
  const { t } = useTranslation();
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouse();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => lotService.post(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_LOTS });
      toast.success(t("common.saved"));
      reset();
      onClose();
    },
    onError: () => toast.error(t("common.error")),
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <div className="mt-4 w-[90vw] max-w-[300px] right-2 md:right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white max-h-[80vh] overflow-y-auto">
      <p className="text-xl mb-5">{t("lotsPage.addTitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-number">{t("lotsPage.lotNumber")}</InputLabel>
              <Input id="lot-number" {...register("lotNumber")} />
              <span className="text-red-500 text-sm">
                {errors.lotNumber?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="product-label">{t("common.product")}</InputLabel>
              <Controller
                name="productId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="product-label" label={t("common.product")} {...field}>
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.productId?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="warehouse-label">{t("common.warehouse")}</InputLabel>
              <Controller
                name="warehouseId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    labelId="warehouse-label"
                    label={t("common.warehouse")}
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
              <span className="text-red-500">
                {errors.warehouseId?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="status-label">{t("lotsPage.status")}</InputLabel>
              <Controller
                name="status"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="status-label" label={t("lotsPage.status")} {...field}>
                    <MenuItem value="AVAILABLE">{t("enums.AVAILABLE")}</MenuItem>
                    <MenuItem value="RESERVED">{t("enums.RESERVED")}</MenuItem>
                    <MenuItem value="SOLD_OUT">{t("enums.SOLD_OUT")}</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.status?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="source-label">{t("lotsPage.source")}</InputLabel>
              <Controller
                name="source"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="source-label" label={t("lotsPage.source")} {...field}>
                    <MenuItem value="PURCHASE">{t("enums.PURCHASE")}</MenuItem>
                    <MenuItem value="PRODUCTION">{t("enums.PRODUCTION")}</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.source?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-initial">{t("lotsPage.initialQty")}</InputLabel>
              <Input
                id="lot-initial"
                type="number"
                {...register("initialQuantity")}
              />
              <span className="text-red-500 text-sm">
                {errors.initialQuantity?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-current">{t("lotsPage.currentQty")}</InputLabel>
              <Input
                id="lot-current"
                type="number"
                {...register("currentQuantity")}
              />
              <span className="text-red-500 text-sm">
                {errors.currentQuantity?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="uom-label">{t("productPage.uom")}</InputLabel>
              <Controller
                name="uom"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="uom-label" label={t("productPage.uom")} {...field}>
                    <MenuItem value="KG">{t("enums.KG")}</MenuItem>
                    <MenuItem value="G">{t("enums.G")}</MenuItem>
                    <MenuItem value="TONNE">{t("enums.TONNE")}</MenuItem>
                    <MenuItem value="LITER">{t("enums.LITER")}</MenuItem>
                    <MenuItem value="PIECE">{t("enums.PIECE")}</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.uom?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-unitcost">{t("lotsPage.unitCost")}</InputLabel>
              <Input
                id="lot-unitcost"
                type="number"
                {...register("unitCost")}
              />
              <span className="text-red-500 text-sm">
                {errors.unitCost?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="currency-label">{t("lotsPage.currency")}</InputLabel>
              <Controller
                name="currency"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="currency-label" label={t("lotsPage.currency")} {...field}>
                    <MenuItem value="UZS">UZS</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.currency?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel shrink htmlFor="lot-prod-date">
                {t("lotsPage.productionDate")}
              </InputLabel>
              <Input
                id="lot-prod-date"
                type="date"
                readOnly
                {...register("productionDate")}
              />
              <span className="text-red-500 text-sm">
                {errors.productionDate?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel shrink htmlFor="lot-exp-date">
                {t("lotsPage.expiryDate")}
              </InputLabel>
              <Input
                id="lot-exp-date"
                type="date"
                {...register("expiryDate")}
              />
              <span className="text-red-500 text-sm">
                {errors.expiryDate?.message}
              </span>
            </FormControl>
          </div>
        </div>

        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? t("common.loading") : t("common.submit")}
        </Button>
      </form>
    </div>
  );
};

function Lots() {
  const { data, error, isLoading } = useLots();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns: GridColDef[] = [
    { field: "id", headerName: t("common.id"), flex: 1 },
    {
      field: "lotNumber",
      headerName: t("lotsPage.lotNumber"),
      flex: 1,
      renderCell(params) {
        return <Link to={`/lots/${params.id}`}>{params.row.lotNumber}</Link>;
      },
    },
    { field: "productId", headerName: t("common.product"), flex: 1 },
    {
      field: "warehouseId",
      headerName: t("common.warehouse"),
    },
    {
      field: "status",
      headerName: t("lotsPage.status"),
      flex: 1,
      renderCell: (params) => {
        return <Status status={params.value} />;
      },
    },
    {
      field: "unitCost",
      headerName: t("lotsPage.unitCost"),
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} UZS</p>;
      },
    },
    {
      field: "currentQuantity",
      headerName: t("lotsPage.currentQty"),
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} KG</p>;
      },
    },

    {
      field: "expiryDate",
      headerName: t("lotsPage.expiryDate"),
      flex: 1,
      renderCell: (param) => {
        return (
          <div className="flex flex-col items-center justify-center text-center pt-2">
            <ExpiryBadge expiryDate={param.row.expiryDate} />
            <p className="text-gray-400 text-[12px] text-sm  top-9 ">
              {param.value}
            </p>
          </div>
        );
      },
    },
    {
      field: "source",
      headerName: t("lotsPage.source"),
      flex: 1,
      renderCell: (param) => {
        return (
          <Chip
            label={t(`enums.${param.value}`, { defaultValue: param.value })}
            size="small"
            variant="outlined"
          />
        );
      },
    },
  ];

  const {
    rowSelectionModel,
    onRowSelectionModelChange,
    selectedIds,
    clear,
  } = useGridSelection();

  const [addL, setAddL] = React.useState(false);

  const paginationModel = { page: 0, pageSize: 5 };

  if (isLoading) return <p>{t("common.loading")}</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div className="">
        <BackButton />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <h2 className="text-3xl font-bold ">{t("lotsPage.name")}</h2>
            <p className="text-gray-400">{t("lotsPage.desc")}</p>
          </div>
          <div className="">
            <Button
              variant="contained"
              color="error"
              onClick={() => setAddL(!addL)}
            >
              + {t("actions.addButton")}
            </Button>
          </div>
        </div>
        {addL && <AddLot onClose={() => setAddL(false)} />}
        {data ? (
          <div className="mt-5">
            <DeleteSelectedBar
              selectedIds={selectedIds}
              endpoint="lots"
              queryKey={CACHE_KEY_LOTS}
              label="lot"
              onDone={clear}
            />
            <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
              <DataGrid
                style={{ borderRadius: "20px" }}
                rows={data ?? []}
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`/lots/${params.id}`)}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
                showToolbar
                slots={{ toolbar: DataGridToolbar }}
                onRowSelectionModelChange={onRowSelectionModelChange}
                rowSelectionModel={rowSelectionModel}
              />
            </Paper>
          </div>
        ) : (
          <p className="mt-5">{t("lotsPage.noLotsFound")}</p>
        )}
      </div>
    </>
  );
}

export default Lots;
