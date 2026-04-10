export type AppTheme = "light" | "dark";

const THEME_KEY = "studybridge-theme";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem(THEME_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function initializeTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
}