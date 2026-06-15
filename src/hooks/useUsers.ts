import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CACHE_KEY_USERS } from "../constants.production";
import { type User } from "../types";

const api = axios.create({ baseURL: "/api/" });

const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: CACHE_KEY_USERS,
    queryFn: () => api.get<User[]>("users").then((r) => r.data),
  });
};

export default useUsers;
