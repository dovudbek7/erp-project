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
import z from "zod";
import useProducts from "../../hooks/useProducts";
import { type Product } from "../../types";

const schema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(3, { message: "Min 3 characters required" }),
  type: z.string().min(1, "Type is required"),
  uom: z.string().min(1, "UOM is required"),
  category: z.string().min(1, "Category is required"),
});

type FormData = z.infer<typeof schema>;

const AddProduct = ({ onAdd }: { onAdd: (data: FormData) => void }) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { t } = useTranslation();

  const onSubmit = (data: FormData) => {
    onAdd(data);
    reset();
  };

  return (
    <>
      <div className="mt-4 w-[300px] right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white">
        <p className="text-xl mb-5">{t("productPage.addTitle")}</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-5">
            <div className="form-group">
              <FormControl className="w-full">
                <InputLabel htmlFor="product-sku">SKU</InputLabel>
                <Input id="product-sku" {...register("sku")} />
                <span className="text-red-500 text-sm">
                  {errors.sku?.message}
                </span>
              </FormControl>
            </div>

            <div className="form-group">
              <FormControl className="w-full">
                <InputLabel htmlFor="product-name">Name</InputLabel>
                <Input id="product-name" {...register("name")} />
                <span className="text-red-500 text-sm">
                  {errors.name?.message}
                </span>
              </FormControl>
            </div>

            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select labelId="type-label" label="Type" {...field}>
                      <MenuItem value="RAW_MATERIAL">RAW MATERIAL</MenuItem>
                      <MenuItem value="PACKAGING">PACKAGING</MenuItem>
                      <MenuItem value="FINISHED_GOOD">FINISHED GOOD</MenuItem>
                    </Select>
                  )}
                />
                <span className="text-red-500">{errors.type?.message}</span>
              </FormControl>
            </div>

            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel id="uom-label">UOM</InputLabel>
                <Controller
                  name="uom"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select labelId="uom-label" label="UOM" {...field}>
                      <MenuItem value="KG">Kg</MenuItem>
                      <MenuItem value="G">g</MenuItem>
                      <MenuItem value="TONNE">Tonne</MenuItem>
                      <MenuItem value="LITER">Liter</MenuItem>
                      <MenuItem value="PIECE">Piece</MenuItem>
                    </Select>
                  )}
                />
                <span className="text-red-500">{errors.uom?.message}</span>
              </FormControl>
            </div>

            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Controller
                  name="category"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      labelId="category-label"
                      label="Category"
                      {...field}
                    >
                      <MenuItem value="Beef">Beef</MenuItem>
                      <MenuItem value="Pork">Pork</MenuItem>
                      <MenuItem value="Lamb">Lamb</MenuItem>
                      <MenuItem value="Mince">Mince</MenuItem>
                      <MenuItem value="Sausage">Sausage</MenuItem>
                      <MenuItem value="Prepared">Prepared</MenuItem>
                      <MenuItem value="Spices">Spices</MenuItem>
                      <MenuItem value="Packaging">Packaging</MenuItem>
                    </Select>
                  )}
                />
                <span className="text-red-500">{errors.category?.message}</span>
              </FormControl>
            </div>
          </div>

          <Button type="submit" className="bg-blue-500" variant="contained">
            Submit
          </Button>
        </form>
      </div>
    </>
  );
};

function Products() {
  const { data = [] } = useProducts();
  const navigate = useNavigate();
  const paginationModel = { page: 0, pageSize: 5 };
  const { t } = useTranslation();

  const [added, setAdded] = useState<Product[]>([]);
  const addRow = (form: FormData) => {
    const newRow = {
      id: `prod-0${String(added.length + 1).padStart(3, "0")}`,
      sku: form.sku,
      name: form.name,
      type: form.type,
      uom: form.uom,
      category: form.category,
    } as Product;
    setAdded((prev) => [newRow, ...prev]);
  };

  const rows = [...added, ...data];

  const columns: GridColDef[] = [
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "uom", headerName: "UOM", flex: 1 },
  ];

  const [addP, setAddP] = useState(false);

  return (
    <div className="">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">{t("productPage.name")}</h2>
          <p className="text-gray-400">{t("productPage.desc")}</p>
        </div>
        <div className="">
          <Button
            variant="contained"
            color="error"
            onClick={() => setAddP(!addP)}
          >
            + {t("actions.addButton")}
          </Button>
        </div>
      </div>
      {addP && <AddProduct onAdd={addRow} />}
      <div className="">
        <div className="mt-5 shadow shadow-md">
          <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
            <DataGrid
              onRowClick={(params) => navigate(`/products/${params.id}`)}
              showToolbar
              checkboxSelection
              style={{ borderRadius: "20px" }}
              rows={rows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10, 15]}
              sx={{ border: 0 }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Products;
