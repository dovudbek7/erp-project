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
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import z from "zod";
import { CACHE_KEY_WAREHOUSE } from "../../constants";
import useGridSelection from "../../hooks/useGridSelection";
import useWarehouse from "../../hooks/useWarehouse";
import warehouseService from "../../services/warehouseService";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";

const schema = z.object({
  name: z.string().min(5, { message: "Min 5 characters required" }),
  type: z.string().min(1, "Type is required"),
});

type FormData = z.infer<typeof schema>;

const AddWarehouse = ({ onClose }: { onClose: () => void }) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => warehouseService.post(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_WAREHOUSE });
      toast.success(t("common.saved"));
      reset();
      onClose();
    },
    onError: () => toast.error(t("common.error")),
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <div className="mt-4 w-[90vw] max-w-[300px] right-2 md:right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white">
      <p className="text-xl mb-5">{t("wareHousePage.addTitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <FormControl className="w-full">
              <InputLabel htmlFor="my-input">{t("wareHousePage.nameLabel")}</InputLabel>
              <Input id="my-input" aria-describedby="my-helper-text" {...register("name")} />
              <span className="text-red-500 text-sm">{errors.name?.message}</span>
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
                    <MenuItem value="cold_storage">{t("enums.COLD_STORAGE")}</MenuItem>
                    <MenuItem value="production">{t("enums.PRODUCTION")}</MenuItem>
                    <MenuItem value="shipping">{t("enums.SHIPPING")}</MenuItem>
                  </Select>
                )}
              />
              <span className="text-red-500">{errors.type?.message}</span>
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

function Warehouse() {
  const { data = [] } = useWarehouse();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [addW, setaddW] = useState(false);
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const columns: GridColDef[] = [
    { field: "id", headerName: t("common.id"), flex: 1 },
    { field: "name", headerName: t("common.name"), flex: 1 },
    {
      field: "type",
      headerName: t("wareHousePage.type"),
      flex: 1,
      renderCell: (param) => (
        <Chip
          label={t(`enums.${param.value}`, { defaultValue: param.value })}
          variant="outlined"
          color="info"
        />
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <>
      <div className="">
        <BackButton />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <h2 className="text-3xl font-bold">{t("wareHousePage.name")}</h2>
            <p className="text-gray-400">{t("wareHousePage.desc")}</p>
          </div>
          <div className="">
            <Button variant="contained" color="error" onClick={() => setaddW(!addW)}>
              + {t("actions.addButton")}
            </Button>
          </div>
        </div>
        {addW && <AddWarehouse onClose={() => setaddW(false)} />}
        <div className="">
          <div className="mt-5">
            <DeleteSelectedBar
              selectedIds={selectedIds}
              endpoint="ware-house"
              queryKey={CACHE_KEY_WAREHOUSE}
              label="warehouse"
              onDone={clear}
            />
            <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
              <DataGrid
                showToolbar
                slots={{ toolbar: DataGridToolbar }}
                checkboxSelection
                style={{ borderRadius: "20px" }}
                rows={data}
                columns={columns}
                onRowClick={(p) => navigate(`/warehouses/${p.id}`)}
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
