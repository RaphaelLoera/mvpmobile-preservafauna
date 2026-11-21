import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const mq = () => window.matchMedia("(prefers-color-scheme: dark)");

export function applyTheme(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && mq().matches);
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0B1210" : "#1B4332");
}

/** Tema claro/escuro/sistema, persistido. O script em index.html evita o "flash" inicial. */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem("pf_theme") as ThemePref) || "system");
  useEffect(() => {
    applyTheme(pref);
    localStorage.setItem("pf_theme", pref);
    if (pref !== "system") return;
    const h = () => applyTheme("system");
    mq().addEventListener("change", h);
    return () => mq().removeEventListener("change", h);
  }, [pref]);
  return [pref, setPref] as const;
}
