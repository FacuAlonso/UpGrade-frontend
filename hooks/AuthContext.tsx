import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginApi, register as registerApi, me } from "../auth/auth.api";

type SessionUser = { id?: string; sub?: string; email: string; firstName?: string; lastName?: string };
type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (d: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) setUser(await me());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { hydrate(); }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await loginApi({ email, password });
    await SecureStore.setItemAsync("token", token);
    setUser(user); // o: setUser(await me()) si querés homogeneizar payload
  };

  const register = async (d: { email: string; password: string; firstName: string; lastName: string }) => {
    await registerApi(d);
    await login(d.email, d.password); // autologin
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
