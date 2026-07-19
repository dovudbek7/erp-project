import { axiosInstance } from "./apiClient";
import { saveToken, saveUser, removeToken } from "./auth";

export type UserRole =
  | "admin"
  | "production_manager"
  | "warehouse_operator"
  | "sales"
  | "accountant"
  | "staff";

export interface AuthUser {
  id: number;
  username: string | null;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: UserRole;
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

export const authService = {
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/login", {
      identifier,
      password,
    });
    saveToken(res.data.access_token);
    saveUser(res.data.user);
    return res.data;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    });
    saveToken(res.data.access_token);
    saveUser(res.data.user);
    return res.data;
  },

  logout: () => {
    removeToken();
    window.location.href = "/register";
  },

  getProfile: async (): Promise<AuthUser> => {
    const res = await axiosInstance.get<AuthUser>("/auth/profile");
    return res.data;
  },
};
