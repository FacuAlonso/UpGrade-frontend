import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch, RootState } from "../redux/store";
import { setMode } from "./reducers/appModeSlice";

export async function hydrateAppMode(dispatch: AppDispatch) {
  const saved = await AsyncStorage.getItem("appMode");
  if (saved === "student" || saved === "tutor") {
    dispatch(setMode(saved as "student" | "tutor"));
  }
}

export function subscribeAppMode(store: { getState: () => RootState }) {
  let last: string | null = null;
  return () => {
    const mode = store.getState().appMode.mode;
    if (mode !== last) {
      last = mode;
      AsyncStorage.setItem("appMode", mode).catch(() => {});
    }
  };
}