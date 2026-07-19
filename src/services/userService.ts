import { axiosInstance } from "./apiClient";
import { adaptUser } from "./adapters";
import type { UserRole } from "../types";

export interface CreateUserPayload {
  fullName: string;
  phone: string;
  password: string;
  role: UserRole;
  permissions: string[];
}

export interface UpdateUserPayload {
  role?: UserRole;
  permissions?: string[];
  is_active?: boolean;
}

const userService = {
  getAll: () =>
    axiosInstance.get<any[]>("users").then((r) => r.data.map(adaptUser)),

  get: (id: string) =>
    axiosInstance.get<any>(`users/${id}`).then((r) => adaptUser(r.data)),

  post: (data: CreateUserPayload) =>
    axiosInstance.post<any>("users", data).then((r) => adaptUser(r.data)),

  put: (id: string, data: UpdateUserPayload) =>
    axiosInstance.patch<any>(`users/${id}`, data).then((r) => adaptUser(r.data)),

  del: (id: string) =>
    axiosInstance.delete(`users/${id}`).then((r) => r.data),
};

export default userService;
