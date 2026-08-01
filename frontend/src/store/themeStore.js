import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: true,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        applyTheme(next);
      },
      init: () => {
        applyTheme(get().isDark);
      },
    }),
    { name: "taskflow-theme" }
  )
);

function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty("--bg-primary", "#0f1117");
    root.style.setProperty("--bg-card", "rgba(255,255,255,0.04)");
    root.style.setProperty("--border-color", "rgba(255,255,255,0.08)");
    root.style.setProperty("--text-main", "#ffffff");
    root.style.setProperty("--text-muted", "rgba(255,255,255,0.45)");
    root.style.setProperty("--input-bg", "rgba(255,255,255,0.05)");
    root.style.setProperty("--sidebar-bg", "rgba(15,17,23,0.98)");
    root.style.setProperty("--hover-bg", "rgba(255,255,255,0.06)");
    root.style.setProperty("--sub-bg", "rgba(255,255,255,0.03)");
    document.body.style.background = "#0f1117";
    document.body.style.color = "#ffffff";
  } else {
    root.style.setProperty("--bg-primary", "#f4f6fb");
    root.style.setProperty("--bg-card", "#ffffff");
    root.style.setProperty("--border-color", "#e2e8f0");
    root.style.setProperty("--text-main", "#0f172a");
    root.style.setProperty("--text-muted", "#64748b");
    root.style.setProperty("--input-bg", "#ffffff");
    root.style.setProperty("--sidebar-bg", "#ffffff");
    root.style.setProperty("--hover-bg", "#f8fafc");
    root.style.setProperty("--sub-bg", "#f8fafc");
    document.body.style.background = "#f4f6fb";
    document.body.style.color = "#0f172a";
  }
}