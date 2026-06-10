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
import useAddWarehouse from "../../hooks/useAddWarehouse";
import useWarehouse from "../../hooks/useWarehouse";

const AddWarehouse = () => {
  // const { data: tenant } = useTenant();
  const addWarehouse = useAddWarehouse();

  const schema = z.object({
    name: z.string(),
    type: z.string(),
  });

  type FormData = z.infer<typeof schema>;

  const onSubmit = (data: FormData) => {
    addWarehouse.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  const { handleSubmit, register, control, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <>
      <div className="mt-4 w-full h-[300px] border p-[20px] rounded-2xl border-gray-400">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-10"
        >
          <div className="grid grid-col-">
            <div className="form-group ">
              <FormControl className="w-full">
                <InputLabel htmlFor="my-input">
                  Name of the WareHouse
                </InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  {...register("name")}
                />
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
                      <MenuItem value="COLD_STORAGE">COLD STORAGE</MenuItem>
                      <MenuItem value="PRODUCTION">PRODUCTION</MenuItem>
                      <MenuItem value="COLD_STORAGE">COLD STORAGE</MenuItem>
                      <MenuItem value="SHIPPING">SHIPPING</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-blue-500"
            variant="contained"
            disabled={addWarehouse.isPending}
          >
            {addWarehouse.isPending ? "Saving..." : "Submit"}
          </Button>
        </form>
      </div>
    </>
  );
};

function Warehouse() {
  const { data } = useWarehouse();
  console.log(data);
  const { t } = useTranslation();
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (param) => {
        return <Chip label={param.value} variant="outlined" color="info" />;
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  const [addW, setaddW] = useState(false);
  return (
    <>
      <div className="">
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
        {addW ? <AddWarehouse /> : ""}
        <div className="">
          <div className="mt-5 shadow shadow-md">
            <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
              <DataGrid
                showToolbar
                checkboxSelection
                style={{ borderRadius: "20px" }}
                rows={data}
                // getRowId={}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
                // onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)}
              />
            </Paper>
          </div>
        </div>
      </div>
    </>
  );
}

export default Warehouse;
