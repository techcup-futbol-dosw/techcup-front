const parseJSON = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const readUICache = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  const raw = sessionStorage.getItem(key);
  if (!raw) return fallback;

  return parseJSON(raw, fallback);
};

export const writeUICache = <T>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeUICache = (key: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
};