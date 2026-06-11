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

import { zodResolver } from "@hookform/resolvers/zod";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CACHE_KEY_WAREHOUSE } from "../../constants";
import useGridSelection from "../../hooks/useGridSelection";
import useWarehouse from "../../hooks/useWarehouse";
import { type Warehouse as WarehouseType } from "../../types";
import BackButton from "../common/BackButton";
import DeleteSelectedBar from "../common/DeleteSelectedBar";

const schema = z.object({
  name: z.string().min(5, { message: "Min 5 characters required" }),
  type: z.string().min(1, "Type is required"),
});

type FormData = z.infer<typeof schema>;

const AddWarehouse = ({ onAdd }: { onAdd: (data: FormData) => void }) => {
  const onSubmit = (data: FormData) => {
    onAdd(data);
    reset();
  };

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
  return (
    <>
      <div className="mt-4 w-[300px] right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white">
        <p className="text-xl mb-5">{t("wareHousePage.addTitle")}</p>
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-5">
            <div className="form-group ">
              <FormControl className="w-full">
                <InputLabel htmlFor="my-input">
                  {t("wareHousePage.nameLabel")}
                </InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  {...register("name")}
                />
                <span className="text-red-500 text-sm">
                  {errors.name?.message}
                </span>
              </FormControl>
            </div>

            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel id="type-label">{t("wareHousePage.type")}</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select labelId="type-label" label={t("wareHousePage.type")} {...field}>
                      <MenuItem value="COLD_STORAGE">{t("enums.COLD_STORAGE")}</MenuItem>
                      <MenuItem value="PRODUCTION">{t("enums.PRODUCTION")}</MenuItem>
                      <MenuItem value="SHIPPING">{t("enums.SHIPPING")}</MenuItem>
                    </Select>
                  )}
                />
                <span className="text-red-500">{errors.type?.message}</span>
              </FormControl>
            </div>
          </div>

          <Button type="submit" className="bg-blue-500" variant="contained">
            {t("common.submit")}
          </Button>
        </form>
      </div>
    </>
  );
};

function Warehouse() {
  const { data } = useWarehouse();
  const [added, setAdded] = useState<WarehouseType[]>([]);
  const addRow = (form: FormData) => {
    const newRow = {
      id: `wh-00${String(added.length + 1).padStart(3, "0")}`,
      name: form.name,
      type: form.type,
    } as WarehouseType;
    setAdded((prev) => [newRow, ...prev]);
  };

  const rows = [...added, ...(data ?? [])];

  const { t } = useTranslation();
  const columns: GridColDef[] = [
    { field: "id", headerName: t("common.id"), flex: 1 },
    { field: "name", headerName: t("common.name"), flex: 1 },
    {
      field: "type",
      headerName: t("wareHousePage.type"),
      flex: 1,
      renderCell: (param) => {
        return (
          <Chip
            label={t(`enums.${param.value}`, { defaultValue: param.value })}
            variant="outlined"
            color="info"
          />
        );
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  const [addW, setaddW] = useState(false);
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();
  return (
    <>
      <div className="">
        <BackButton />
        <div className="flex justify-between">
          <div className="">
            <h2 className="text-3xl font-bold">{t("wareHousePage.name")}</h2>
            <p className="text-gray-400">{t("wareHousePage.desc")}</p>
          </div>
          <div className="">
            <Button
              variant="contained"
              color="error"
              onClick={() => setaddW(!addW)}
            >
              + {t("actions.addButton")}
            </Button>
          </div>
        </div>
        {addW ? <AddWarehouse onAdd={addRow} /> : ""}
        <div className="">
          <div className="mt-5">
            <DeleteSelectedBar
              selectedIds={selectedIds}
              endpoint="warehouses"
              queryKey={CACHE_KEY_WAREHOUSE}
              label="warehouse"
              onDone={clear}
            />
            <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
              <DataGrid
                showToolbar
                checkboxSelection
                style={{ borderRadius: "20px" }}
                rows={rows}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
                onRowSelectionModelChange={onRowSelectionModelChange}
                rowSelectionModel={rowSelectionModel}
              />
            </Paper>
          </div>
        </div>
      </div>
    </>
  );
}

export default Warehouse;
