import React, { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "../redux/reducers/userSlice";
import { useAppSelector } from "../hooks/useRedux";

type AuthContextType = {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch(loginSuccess({ user: parsed.user, token: parsed.token }));
        }
      } catch {
        console.warn("No se pudo restaurar la sesión almacenada.");
      }
    })();
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      await AsyncStorage.setItem("auth", JSON.stringify({ user: data.user, token: data.token }));
      dispatch(loginSuccess({ user: data.user, token: data.token }));
    } catch (err: any) {
      dispatch(loginFailure(err.message));
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("auth");
    dispatch(logoutAction());
  };

  async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    if (res.status === 401) {
      await logout();
      throw new Error("Token inválido o expirado. Se cerró la sesión.");
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data as T;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        loading,
        error,
        login,
        logout,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
