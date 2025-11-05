export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  xpLevel: number;
  profilePhoto?: string | null;
};

export type UserState = {
  user: AuthUser | null;
  token: string | null;
  isFetching: boolean;
  isLoggedIn: boolean;
  error: string | null;
};

export type UserAction =
  | { type: "LOG_USER_PENDING" }
  | { type: "LOG_USER_SUCCESS"; payload: { user: AuthUser; token: string } }
  | { type: "LOG_USER_FAILURE"; payload: string }
  | { type: "LOG_OUT" };
