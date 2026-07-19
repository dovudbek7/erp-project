import { axiosInstance } from "./apiClient";
import { adaptProduct } from "./adapters";
import type { Product } from "../types";

const productService = {
  getAll: () =>
    axiosInstance.get<any[]>("products").then((r) => r.data.map(adaptProduct)),

  get: (id: string) =>
    axiosInstance.get<any>(`products/${id}`).then((r) => adaptProduct(r.data)),

  post: (data: Partial<Product>) =>
    axiosInstance.post<any>("products", {
      name: data.name,
      type: data.type?.toLowerCase(),
      category_id: data.category ? Number(data.category) : undefined,
      uom: data.uom,
    }).then((r) => adaptProduct(r.data)),

  put: (id: string, data: Partial<Product>) =>
    axiosInstance.put<any>(`products/${id}`, {
      name: data.name,
      type: data.type?.toLowerCase(),
      category_id: data.category ? Number(data.category) : undefined,
      uom: data.uom,
    }).then((r) => adaptProduct(r.data)),

  del: (id: string) =>
    axiosInstance.delete(`products/${id}`).then((r) => r.data),

  getCategories: () =>
    axiosInstance.get<any[]>("products/categories").then((r) => r.data),

  postCategory: (name: string) =>
    axiosInstance.post<any>("products/categories", { name }).then((r) => r.data),
};

export default productService;
