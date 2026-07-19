import { axiosInstance } from "./apiClient";
import { adaptWarehouse } from "./adapters";
import type { Warehouse } from "../types";

const warehouseService = {
  getAll: () =>
    axiosInstance.get<any[]>("ware-house").then((r) => r.data.map(adaptWarehouse)),

  get: (id: string) =>
    axiosInstance.get<any>(`ware-house/${id}`).then((r) => adaptWarehouse(r.data)),

  post: (data: Partial<Warehouse>) =>
    axiosInstance.post<any>("ware-house", { name: data.name, type: data.type?.toLowerCase() })
      .then((r) => adaptWarehouse(r.data)),

  put: (id: string, data: Partial<Warehouse>) =>
    axiosInstance.put<any>(`ware-house/${id}`, { name: data.name, type: data.type })
      .then((r) => adaptWarehouse(r.data)),

  del: (id: string) =>
    axiosInstance.delete(`ware-house/${id}`).then((r) => r.data),
};

export default warehouseService;
