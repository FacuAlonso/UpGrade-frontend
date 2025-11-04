import api from "../api";

export type UserDTO = { id: string; email: string; firstName?: string; lastName?: string };

export async function register(data: {
  email: string; password: string; firstName: string; lastName: string;
}) {
  const res = await api.post<{ user: UserDTO }>("/auth/register", data);
  return res.data.user;
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post<{ token: string; user: UserDTO }>("/auth/login", data);
  return res.data; // { token, user }
}

export async function me() {
  const res = await api.get<{ user: { sub: string; email: string; firstName?: string; lastName?: string } }>("/me");
  return res.data.user;
}
