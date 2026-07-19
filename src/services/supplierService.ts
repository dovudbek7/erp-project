import { axiosInstance } from "./apiClient";
import { adaptSupplier } from "./adapters";
import type { Supplier } from "../types";

const supplierService = {
  getAll: () =>
    axiosInstance.get<any[]>("suppliers").then((r) => r.data.map(adaptSupplier)),

  get: (id: string) =>
    axiosInstance.get<any>(`suppliers/${id}`).then((r) => adaptSupplier(r.data)),

  post: (data: Partial<Supplier>) =>
    axiosInstance.post<any>("suppliers", { name: data.name })
      .then((r) => adaptSupplier(r.data)),

  put: (id: string, data: Partial<Supplier>) =>
    axiosInstance.put<any>(`suppliers/${id}`, { name: data.name })
      .then((r) => adaptSupplier(r.data)),

  del: (id: string) =>
    axiosInstance.delete(`suppliers/${id}`).then((r) => r.data),
};

export default supplierService;
