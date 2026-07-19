import axios from "axios";
import { getToken, removeToken } from "./auth";

const axiosInstance = axios.create({
  baseURL: "/api/",
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/register";
    }
    return Promise.reject(error);
  }
);

class APICLIENT<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = () =>
    axiosInstance.get<T[]>(this.endpoint).then((res) => res.data);

  get = () =>
    axiosInstance.get<T>(this.endpoint).then((res) => res.data);

  post = (data: Partial<T>) =>
    axiosInstance.post<T>(this.endpoint, data).then((res) => res.data);

  put = (id: string | number, data: Partial<T>) =>
    axiosInstance
      .put<T>(`${this.endpoint}/${id}`, data)
      .then((res) => res.data);

  del = (id: string | number) =>
    axiosInstance.delete(`${this.endpoint}/${id}`).then((res) => res.data);
}

export { axiosInstance };
export default APICLIENT;
