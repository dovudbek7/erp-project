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
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import z from "zod";
import React from "react";
import useLots from "../../hooks/useLots";
import useProducts from "../../hooks/useProducts";
import useWarehouse from "../../hooks/useWarehouse";
import { type Lot } from "../../types";
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

const AddLot = ({ onAdd }: { onAdd: (data: FormData) => void }) => {
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

  const onSubmit = (data: FormData) => {
    onAdd(data);
    reset();
  };

  return (
    <div className="mt-4 w-[300px] right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white max-h-[80vh] overflow-y-auto">
      <p className="text-xl mb-5">{t("lotsPage.addTitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-number">Lot Number</InputLabel>
              <Input id="lot-number" {...register("lotNumber")} />
              <span className="text-red-500 text-sm">
                {errors.lotNumber?.message}
              </span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="product-label">Product</InputLabel>
              <Controller
                name="productId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="product-label" label="Product" {...field}>
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
              <InputLabel id="warehouse-label">Warehouse</InputLabel>
              <Controller
                name="warehouseId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select
                    labelId="warehouse-label"
                    label="Warehouse"
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
              <InputLabel id="status-label">Status</InputLabel>
              <Controller
                name="status"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="status-label" label="Status" {...field}>
                    <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                    <MenuItem value="RESERVED">RESERVED</MenuItem>
                    <MenuItem value="SOLD_OUT">SOLD OUT</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.status?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="source-label">Source</InputLabel>
              <Controller
                name="source"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="source-label" label="Source" {...field}>
                    <MenuItem value="PURCHASE">PURCHASE</MenuItem>
                    <MenuItem value="PRODUCTION">PRODUCTION</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.source?.message}</span>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-initial">Initial QTY</InputLabel>
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
              <InputLabel htmlFor="lot-current">Current QTY</InputLabel>
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
            <FormControl className="w-full">
              <InputLabel htmlFor="lot-unitcost">Unit Cost</InputLabel>
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
              <InputLabel id="currency-label">Currency</InputLabel>
              <Controller
                name="currency"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Select labelId="currency-label" label="Currency" {...field}>
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
                Production Date
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
                Expiry Date
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

        <Button type="submit" className="bg-blue-500" variant="contained">
          Submit
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
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "lotNumber",
      headerName: "Lot Number",
      flex: 1,
      renderCell(params) {
        return <Link to={`/lots/${params.id}`}>{params.row.lotNumber}</Link>;
      },
    },
    { field: "productId", headerName: "Product", flex: 1 },
    {
      field: "warehouseId",
      headerName: "Warehouse",
    },
    {
      field: "status",
      headerName: "Status",
      description: "This column has a value getter and is not sortable.",
      flex: 1,
      renderCell: (params) => {
        return <Status status={params.value} />;
      },
    },
    {
      field: "unitCost",
      headerName: "Unit Cost",
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} UZS</p>;
      },
    },
    {
      field: "currentQuantity",
      headerName: "Current QTY",
      flex: 1,
      renderCell: (param) => {
        return <p>{param.value} KG</p>;
      },
    },

    {
      field: "expiryDate",
      headerName: "Expiry Date",
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
      headerName: "Source",
      flex: 1,
      renderCell: (param) => {
        return <Chip label={param.value} size="small" variant="outlined" />;
      },
    },
  ];

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include", // or 'exclude'
      ids: new Set<GridRowId>([""]),
    });

  const [added, setAdded] = React.useState<Lot[]>([]);
  const addRow = (form: FormData) => {
    const newRow = {
      id: `lot-${String(added.length + 1).padStart(3, "0")}`,
      ...form,
    } as unknown as Lot;
    setAdded((prev) => [newRow, ...prev]);
  };

  const rows = [...added, ...(data ?? [])];

  const [addL, setAddL] = React.useState(false);

  const paginationModel = { page: 0, pageSize: 5 };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div className="">
        <div className="flex justify-between">
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
        {addL && <AddLot onAdd={addRow} />}
        {data ? (
          <div className="mt-5 shadow shadow-md">
            <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
              <DataGrid
                
                style={{ borderRadius: "20px" }}
                rows={rows}
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`/lots/${params.id}`)}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
                showToolbar
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
              />
            </Paper>
          </div>
        ) : (
          <p className="mt-5">No Lots Found</p>
        )}
      </div>
    </>
  );
}

export default Lots;
