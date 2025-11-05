export function formatDateTimeISO(iso: string, locale: string = "es-AR") {
  if (!iso) return "Fecha no disponible";

  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "Fecha inválida";

  const timeZone = "America/Argentina/Buenos_Aires"; 

  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone,
  }).format(dt);

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(dt);

  const formattedDate = date.charAt(0).toUpperCase() + date.slice(1);

  return `${formattedDate} · ${time}`;
}
