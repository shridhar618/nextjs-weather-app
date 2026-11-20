// Formatting helpers for Open-Meteo local times like "2026-11-20T14:15"
// (with timezone=auto these are already in the city's local time, with no offset).

export function formatTime(isoLocal) {
  if (!isoLocal) return "—";
  const [h, m] = (isoLocal.split("T")[1] ?? "0:0").split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDay(isoDate) {
  const [y, mo, d] = isoDate.split("T")[0].split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

export function windDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function formatHour(isoLocal) {
  if (!isoLocal) return "—";
  const h = Number((isoLocal.split("T")[1] ?? "0").split(":")[0]);
  return `${((h + 11) % 12) + 1} ${h >= 12 ? "PM" : "AM"}`;
}

// The API always returns metric values; convert for display when the user picks °F.
// unit: "C" | "F"
export function temp(celsius, unit) {
  if (celsius == null || Number.isNaN(celsius)) return "—";
  return Math.round(unit === "F" ? (celsius * 9) / 5 + 32 : celsius);
}

export function wind(kmh, unit) {
  if (kmh == null) return "—";
  return unit === "F" ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
}

export function uvLabel(uv) {
  if (uv == null) return "—";
  const level = uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme";
  return `${Math.round(uv)} · ${level}`;
}
