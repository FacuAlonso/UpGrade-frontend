import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "../redux/reducers/userSlice";



type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  xpLevel?: number;
  rating?: number | null;
  profilePhoto?: string | null;
  contactData?: string | null;
  classroomAddress?: string | null;
  onlineClassroomLink?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed.user);
          setToken(parsed.token);
          dispatch(loginSuccess({ user: parsed.user, token: parsed.token }));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    dispatch(loginStart());
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
      setUser(data.user);
      setToken(data.token);
      await AsyncStorage.setItem("auth", JSON.stringify({ user: data.user, token: data.token }));
      dispatch(loginSuccess({ user: data.user, token: data.token }));
    } catch (err: any) {
      setError(err.message);
      dispatch(loginFailure(err.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth");
      setUser(null);
      setToken(null);
      dispatch(logoutAction());
    } catch {}
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