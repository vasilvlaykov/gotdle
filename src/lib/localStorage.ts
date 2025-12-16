// lib/localStorage.ts

export function saveToLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (e.g., storage full or SSR)
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function removeFromLocalStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
