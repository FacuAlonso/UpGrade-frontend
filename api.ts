// api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL, //  config.ts: "http://10.0.2.2:3001"
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      
    }
    return Promise.reject(error);
  }
);

export default api;
