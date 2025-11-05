import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { UnknownAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

export const useAppDispatch = () => useDispatch<ThunkDispatch<RootState, any, UnknownAction>>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;