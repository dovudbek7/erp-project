import { axiosInstance } from "./apiClient";
import { adaptCustomer } from "./adapters";
import type { Customer } from "../types";

const customerService = {
  list: (params: any = {}) =>
    axiosInstance.get<any[]>("customers", { params })
      .then((r) => r.data.map(adaptCustomer)),

  get: (id: string) =>
    axiosInstance.get<any>(`customers/${id}`).then((r) => adaptCustomer(r.data)),

  create: (data: Partial<Customer>) =>
    axiosInstance.post<any>("customers", {
      name: data.name, phone: data.phone,
      email: data.email, address: data.address,
    }).then((r) => adaptCustomer(r.data)),

  update: (id: string, data: Partial<Customer>) =>
    axiosInstance.put<any>(`customers/${id}`, {
      name: data.name, phone: data.phone,
      email: data.email, address: data.address,
    }).then((r) => adaptCustomer(r.data)),

  delete: (id: string) =>
    axiosInstance.delete(`customers/${id}`).then((r) => r.data),
};

export default customerService;
