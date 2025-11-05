import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppMode = "student" | "tutor";
type AppModeState = { mode: AppMode };

const initialState: AppModeState = { mode: "student" };

const appModeSlice = createSlice({
  name: "appMode",
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === "student" ? "tutor" : "student";
    },
  },
});

export const { setMode, toggleMode } = appModeSlice.actions;

export default appModeSlice.reducer;