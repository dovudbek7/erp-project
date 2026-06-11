import axios from "axios";
import type { Customer } from "../types";

const api = axios.create({ baseURL: "/api/" });

interface ListParams {
  type?: string;
}

const customerService = {
  list: (params: ListParams = {}) =>
    api.get<Customer[]>("customers", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Customer>(`customers/${id}`).then((r) => r.data),
};

export default customerService;
