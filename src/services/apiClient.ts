import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/",
});

class APICLIENT<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = () => {
    return axiosInstance.get<T[]>(this.endpoint).then((res) => res.data);
  };
  get = () => {
    return axiosInstance.get<T>(this.endpoint).then((res) => res.data);
  };
  post = (data: Partial<T>) => {
    return axiosInstance.post<T>(this.endpoint, data).then((res) => res.data);
  };
}

export default APICLIENT;
