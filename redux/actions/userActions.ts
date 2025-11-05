import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch } from "redux";
import { UserAction } from "../types";

const API_URL = process.env.EXPO_PUBLIC_DB_API_URL;

export const logUser = (email: string, password: string) => {
  return async (dispatch: Dispatch<UserAction>) => {
    dispatch({ type: "LOG_USER_PENDING" });

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      await AsyncStorage.setItem(
        "auth",
        JSON.stringify({ user: data.user, token: data.token })
      );

      dispatch({
        type: "LOG_USER_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      dispatch({
        type: "LOG_USER_FAILURE",
        payload: error.message || "Error de conexión",
      });
    }
  };
};

export const restoreSession = () => {
  return async (dispatch: Dispatch<UserAction>) => {
    dispatch({ type: "LOG_USER_PENDING" });

    try {
      const stored = await AsyncStorage.getItem("auth");
      if (!stored) {
        dispatch({ type: "LOG_USER_FAILURE", payload: "Sin sesión previa" });
        return;
      }

      const { user, token } = JSON.parse(stored);
      dispatch({
        type: "LOG_USER_SUCCESS",
        payload: { user, token },
      });
    } catch (error: any) {
      console.warn("Error al restaurar sesión:", error);
      dispatch({
        type: "LOG_USER_FAILURE",
        payload: error.message || "Error al restaurar sesión",
      });
    }
  };
};


export const logOut = () => {
  return async (dispatch: Dispatch<UserAction>) => {
    try {
      await AsyncStorage.removeItem("auth");
    } catch (error) {
      console.warn("Error al limpiar AsyncStorage:", error);
    } finally {
      dispatch({ type: "LOG_OUT" });
    }
  };
};
