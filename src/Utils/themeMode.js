export const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
};

const THEME_STORAGE_KEY = "theme-mode";

export function getThemeMode() {
  return localStorage.getItem(THEME_STORAGE_KEY) || THEME_MODE.LIGHT;
}

export function applyThemeMode(mode) {
  const themeMode = mode === THEME_MODE.DARK ? THEME_MODE.DARK : THEME_MODE.LIGHT;

  document.documentElement.setAttribute("data-theme", themeMode);
  localStorage.setItem(THEME_STORAGE_KEY, themeMode);

  return themeMode;
}

export function toggleThemeMode() {
  const nextMode = getThemeMode() === THEME_MODE.DARK ? THEME_MODE.LIGHT : THEME_MODE.DARK;

  return applyThemeMode(nextMode);
}
