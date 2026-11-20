// Small localStorage wrappers. Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and falls back to a default.

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: preferences just won't persist
  }
}
