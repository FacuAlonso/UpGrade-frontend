import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  token: string | null;
  error?: string | null;
  loading?: boolean;
}

const initialState: UserState = {
  id: null,
  firstName: "",
  lastName: "",
  email: "",
  token: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<Omit<UserState, "loading" | "error">>) {
      Object.assign(state, action.payload);
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout() {
      return initialState;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
