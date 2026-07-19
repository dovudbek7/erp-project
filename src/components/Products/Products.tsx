import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import z from "zod";
import { CACHE_KEY_PRODUCTS } from "../../constants";
import useGridSelection from "../../hooks/useGridSelection";
import useProducts from "../../hooks/useProducts";
import productService from "../../services/productService";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";

const schema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(3, { message: "Min 3 characters required" }),
  type: z.string().min(1, "Type is required"),
  uom: z.string().min(1, "UOM is required"),
  category: z.string().min(1, "Category is required"),
});

type FormData = z.infer<typeof schema>;

const AddProduct = ({ onClose }: { onClose: () => void }) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["product-categories"],
    queryFn: productService.getCategories,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      productService.post({
        name: data.name,
        type: data.type as any,
        category: data.category,
        uom: data.uom,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_PRODUCTS });
      toast.success(t("common.saved"));
      reset();
      onClose();
    },
    onError: () => toast.error(t("common.error")),
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <div className="mt-4 w-[90vw] max-w-[300px] right-2 md:right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white">
      <p className="text-xl mb-5">{t("productPage.addTitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="product-sku">SKU</InputLabel>
              <Input id="product-sku" {...register("sku")} />
              <span className="text-red-500 text-sm">{errors.sku?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="product-name">{t("common.name")}</InputLabel>
              <Input id="product-name" {...register("name")} />
              <span className="text-red-500 text-sm">{errors.name?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="type-label">{t("common.type")}</InputLabel>
              <Controller
                name="type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="type-label" label={t("common.type")} {...field}>
                    <MenuItem value="RAW_MATERIAL">{t("enums.RAW_MATERIAL")}</MenuItem>
                    <MenuItem value="PACKAGING">{t("enums.PACKAGING")}</MenuItem>
                    <MenuItem value="FINISHED_GOOD">{t("enums.FINISHED_GOOD")}</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.type?.message}</span>
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
            <FormControl fullWidth>
              <InputLabel id="category-label">{t("productPage.category")}</InputLabel>
              <Controller
                name="category"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="category-label" label={t("productPage.category")} {...field}>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.category?.message}</span>
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

function Products() {
  const { data = [] } = useProducts();
  const navigate = useNavigate();
  const paginationModel = { page: 0, pageSize: 5 };
  const { t } = useTranslation();
  const [addP, setAddP] = useState(false);
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const columns: GridColDef[] = [
    { field: "sku", headerName: t("productPage.sku"), flex: 1 },
    { field: "name", headerName: t("common.name"), flex: 1 },
    {
      field: "type",
      headerName: t("common.type"),
      flex: 1,
      valueGetter: (v) => t(`enums.${v}`, { defaultValue: v }),
    },
    {
      field: "category",
      headerName: t("productPage.category"),
      flex: 1,
      valueGetter: (v) => t(`enums.cat_${v}`, { defaultValue: String(v) }),
    },
    {
      field: "uom",
      headerName: t("productPage.uom"),
      flex: 1,
      valueGetter: (v) => t(`enums.${v}`, { defaultValue: v }),
    },
  ];

  return (
    <div className="">
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">{t("productPage.name")}</h2>
          <p className="text-gray-400">{t("productPage.desc")}</p>
        </div>
        <div className="">
          <Button variant="contained" color="error" onClick={() => setAddP(!addP)}>
            + {t("actions.addButton")}
          </Button>
        </div>
      </div>
      {addP && <AddProduct onClose={() => setAddP(false)} />}
      <div className="">
        <div className="mt-5">
          <DeleteSelectedBar
            selectedIds={selectedIds}
            endpoint="products"
            queryKey={CACHE_KEY_PRODUCTS}
            label="product"
            onDone={clear}
          />
          <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
            <DataGrid
              onRowClick={(params) => navigate(`/products/${params.id}`)}
              showToolbar
              slots={{ toolbar: DataGridToolbar }}
              checkboxSelection
              style={{ borderRadius: "20px" }}
              rows={data}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10, 15]}
              sx={{ border: 0 }}
              onRowSelectionModelChange={onRowSelectionModelChange}
              rowSelectionModel={rowSelectionModel}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Products;
