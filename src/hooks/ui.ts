import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { CACHE_KEY_USERS } from "../constants.production";
import { CACHE_TENANT } from "../constants";
import { axiosInstance } from "../services/apiClient";
import tenantService from "../services/tenantService";
import userService, {
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../services/userService";
import type { Tenant, User } from "../types";

// ─── Grid Selection ───────────────────────────────────────────────────────────

const emptySelection = (): GridRowSelectionModel => ({
  type: "include",
  ids: new Set<GridRowId>(),
});

export const useGridSelection = () => {
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>(emptySelection());

  const selectedIds = Array.from(rowSelectionModel.ids ?? []).map(String);

  return {
    rowSelectionModel,
    onRowSelectionModelChange: setRowSelectionModel,
    selectedIds,
    clear: () => setRowSelectionModel(emptySelection()),
  };
};

// ─── Delayed Flag ─────────────────────────────────────────────────────────────

export const useDelayedFlag = (active: boolean, delayMs = 200) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const id = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);
  return show;
};

// ─── Bulk Delete ──────────────────────────────────────────────────────────────

export const useBulkDelete = (endpoint: string, queryKey: unknown[]) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => axiosInstance.delete(`${endpoint}/${id}`))).then(() => undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
};

// ─── Stubs ────────────────────────────────────────────────────────────────────

export const useTenant = () =>
  useQuery<Tenant[], Error>({ queryKey: CACHE_TENANT, queryFn: tenantService.getAll });

export const useUsers = () =>
  useQuery<User[], Error>({ queryKey: CACHE_KEY_USERS, queryFn: userService.getAll });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: userService.post,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: UpdateUserPayload }>({
    mutationFn: ({ id, data }) => userService.put(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => userService.del(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS }),
  });
};
