import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import appModeReducer from "./reducers/appModeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    appMode: appModeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
