export function formatDateTimeISO(iso: string, locale: string = "es-AR") {
  if (!iso) return "Fecha no disponible";

  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "Fecha inválida";

  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(dt);

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);

  const formattedDate = date.charAt(0).toUpperCase() + date.slice(1);

  return `${formattedDate} · ${time}`;
}
