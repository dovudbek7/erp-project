import React, { createContext, useContext, useState } from "react";
import { getUser, isAuthenticated, removeToken } from "../services/auth";
import type { AuthUser } from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  isAuth: boolean;
  setAuth: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(getUser());
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  const setAuth = (u: AuthUser) => {
    setUser(u);
    setIsAuth(true);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuth(false);
    window.location.href = "/register";
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
