import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataGrid, type GridColDef, type GridRowParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import z from "zod";
import { CACHE_KEY_USERS } from "../../constants.production";
import { useUsers, useCreateUser, useUpdateUser } from "../../hooks/ui";
import useGridSelection from "../../hooks/useGridSelection";
import { SIDEBAR_SECTIONS } from "../../constants.sections";
import { formatUzPhone, stripPhoneFormatting } from "../../utilties/formatPhone";
import type { User } from "../../types";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import DeleteSelectedBar from "../common/DeleteSelectedBar";

const ROLES = ["staff", "production_manager", "warehouse_operator", "sales", "accountant", "admin"] as const;

const schema = z.object({
  fullName: z.string().min(3, { message: "Min 3 characters required" }),
  phone: z
    .string()
    .refine((v) => /^\+?\d{9,15}$/.test(v.replace(/\s+/g, "")), { message: "Enter a valid phone number" }),
  password: z.string().min(6, { message: "Min 6 characters required" }),
  role: z.enum(ROLES),
  permissions: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

const AddWorker = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "staff", permissions: [] },
  });
  const { mutate, isPending } = useCreateUser();
  const phoneField = register("phone");

  const onSubmit = (data: FormData) =>
    mutate(
      { ...data, phone: stripPhoneFormatting(data.phone) },
      {
        onSuccess: () => {
          toast.success(t("common.saved"));
          onClose();
        },
        onError: () => toast.error(t("common.error")),
      }
    );

  return (
    <div className="mt-4 w-[90vw] max-w-[380px] right-2 md:right-[60px] absolute z-10 py-[35px] border p-[20px] rounded-2xl border-gray-400 bg-white">
      <p className="text-xl mb-5">{t("usersPage.addTitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormControl className="w-full">
          <InputLabel htmlFor="fullName">{t("usersPage.fullName")}</InputLabel>
          <Input id="fullName" {...register("fullName")} />
          <span className="text-red-500 text-sm">{errors.fullName?.message}</span>
        </FormControl>

        <FormControl className="w-full">
          <InputLabel htmlFor="phone">{t("usersPage.phone")}</InputLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            {...phoneField}
            onChange={(e) => {
              e.target.value = formatUzPhone(e.target.value);
              phoneField.onChange(e);
            }}
          />
          <span className="text-red-500 text-sm">{errors.phone?.message}</span>
        </FormControl>

        <FormControl className="w-full">
          <InputLabel htmlFor="password">{t("usersPage.password")}</InputLabel>
          <Input id="password" type="password" {...register("password")} />
          <span className="text-red-500 text-sm">{errors.password?.message}</span>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="role-label">{t("usersPage.role")}</InputLabel>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select labelId="role-label" label={t("usersPage.role")} {...field}>
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(`enums.${role}`, { defaultValue: role })}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">{t("usersPage.permissions")}</p>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col">
                {SIDEBAR_SECTIONS.map((section) => (
                  <FormControlLabel
                    key={section.key}
                    control={
                      <Checkbox
                        checked={field.value.includes(section.key)}
                        onChange={(e) => {
                          field.onChange(
                            e.target.checked
                              ? [...field.value, section.key]
                              : field.value.filter((k) => k !== section.key)
                          );
                        }}
                      />
                    }
                    label={t(section.labelKey, { defaultValue: section.fallbackLabel })}
                  />
                ))}
              </div>
            )}
          />
        </div>

        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? t("common.loading") : t("common.submit")}
        </Button>
      </form>
    </div>
  );
};

const editSchema = z.object({
  role: z.enum(ROLES),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
});

type EditFormData = z.infer<typeof editSchema>;

const EditWorker = ({ user, onClose }: { user: User; onClose: () => void }) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    },
  });
  const { mutate, isPending } = useUpdateUser();

  useEffect(() => {
    reset({ role: user.role, permissions: user.permissions, isActive: user.isActive });
  }, [user, reset]);

  const onSubmit = (data: EditFormData) =>
    mutate(
      { id: user.id, data: { role: data.role, permissions: data.permissions, is_active: data.isActive } },
      {
        onSuccess: () => {
          toast.success(t("common.saved"));
          onClose();
        },
        onError: () => toast.error(t("common.error")),
      }
    );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("usersPage.editTitle", { defaultValue: "Edit worker" })} — {user.fullName}</DialogTitle>
      <DialogContent>
        <form id="edit-worker-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
          <FormControl fullWidth>
            <InputLabel id="edit-role-label">{t("usersPage.role")}</InputLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select labelId="edit-role-label" label={t("usersPage.role")} {...field}>
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {t(`enums.${role}`, { defaultValue: role })}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">{t("usersPage.permissions")}</p>
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col">
                  {SIDEBAR_SECTIONS.map((section) => (
                    <FormControlLabel
                      key={section.key}
                      control={
                        <Checkbox
                          checked={field.value.includes(section.key)}
                          onChange={(e) => {
                            field.onChange(
                              e.target.checked
                                ? [...field.value, section.key]
                                : field.value.filter((k) => k !== section.key)
                            );
                          }}
                        />
                      }
                      label={t(section.labelKey, { defaultValue: section.fallbackLabel })}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label={t("usersPage.active")}
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button type="submit" form="edit-worker-form" variant="contained" disabled={isPending}>
          {isPending ? t("common.loading") : t("common.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function Users() {
  const { data = [] } = useUsers();
  const { t } = useTranslation();
  const [addU, setAddU] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { rowSelectionModel, onRowSelectionModelChange, selectedIds, clear } =
    useGridSelection();

  const columns: GridColDef[] = [
    { field: "id", headerName: t("common.id"), flex: 1 },
    { field: "fullName", headerName: t("usersPage.fullName"), flex: 1 },
    { field: "phone", headerName: t("usersPage.phone"), flex: 1 },
    {
      field: "role",
      headerName: t("usersPage.role"),
      flex: 1,
      renderCell: (param) => (
        <Chip
          label={t(`enums.${param.value}`, { defaultValue: param.value })}
          variant="outlined"
          color="info"
        />
      ),
    },
    {
      field: "permissions",
      headerName: t("usersPage.permissions"),
      flex: 2,
      renderCell: (param) => (
        <div className="flex flex-wrap gap-1 py-1">
          {(param.value as string[]).map((key) => (
            <Chip key={key} size="small" label={key} />
          ))}
        </div>
      ),
    },
    {
      field: "isActive",
      headerName: t("usersPage.active"),
      flex: 1,
      renderCell: (param) => (
        <Chip
          label={param.value ? t("common.yes") : t("common.no")}
          color={param.value ? "success" : "default"}
        />
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <div className="">
      <BackButton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="text-3xl font-bold">{t("usersPage.name")}</h2>
          <p className="text-gray-400">{t("usersPage.desc")}</p>
        </div>
        <div className="">
          <Button variant="contained" color="error" onClick={() => setAddU(!addU)}>
            + {t("actions.addButton")}
          </Button>
        </div>
      </div>
      {addU && <AddWorker onClose={() => setAddU(false)} />}
      <div className="mt-5">
        <DeleteSelectedBar
          selectedIds={selectedIds}
          endpoint="users"
          queryKey={CACHE_KEY_USERS}
          label="user"
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
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0 }}
            onRowSelectionModelChange={onRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            onRowClick={(p: GridRowParams<User>) => setEditingUser(p.row)}
          />
        </Paper>
      </div>
      {editingUser && (
        <EditWorker user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}

export default Users;
