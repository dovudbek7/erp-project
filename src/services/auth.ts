const TOKEN_KEY = "erp_access_token";
const USER_KEY = "erp_user";

export const saveToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => !!getToken();

export const saveUser = (user: object) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const getUser = () => {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};
