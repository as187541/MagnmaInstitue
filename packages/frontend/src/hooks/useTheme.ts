// ============================================================
// Theme Hook
// ============================================================

import { useState, useEffect, useCallback } from "react";

type Theme = "original" | "professional";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "original";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "original" ? "professional" : "original"));
  }, []);

  return { theme, toggleTheme };
}
