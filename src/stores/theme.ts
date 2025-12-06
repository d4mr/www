import { atom } from "nanostores";

export type Theme = "light" | "dark";

export const themeStore = atom<Theme>("light");

export function toggleTheme() {
  const current = themeStore.get();
  const next = current === "light" ? "dark" : "light";
  themeStore.set(next);
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

export function initTheme() {
  const stored = localStorage.getItem("theme") as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored ?? (prefersDark ? "dark" : "light");
  themeStore.set(theme);
  document.documentElement.setAttribute("data-theme", theme);
}
