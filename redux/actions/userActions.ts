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

      await AsyncStorage.setItem("auth", JSON.stringify(data));

      dispatch({
        type: "LOG_USER_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      dispatch({
        type: "LOG_USER_FAILURE",
        payload: error.message,
      });
    }
  };
};

export const restoreSession = () => {
  return async (dispatch: Dispatch<UserAction>) => {
    try {
      const stored = await AsyncStorage.getItem("auth");
      if (!stored) return;

      const data = JSON.parse(stored);
      dispatch({
        type: "LOG_USER_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (error) {
      console.warn("Error al restaurar sesión:", error);
    }
  };
};

export const logOut = () => {
  return async (dispatch: Dispatch<UserAction>) => {
    await AsyncStorage.removeItem("auth");
    dispatch({ type: "LOG_OUT" });
  };
};
