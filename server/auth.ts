export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data;
}
