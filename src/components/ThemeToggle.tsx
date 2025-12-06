import { useStore } from "@nanostores/react";
import { themeStore, toggleTheme } from "../stores/theme";

export default function ThemeToggle() {
  const theme = useStore(themeStore);

  return (
    <button
      onClick={toggleTheme}
      className="font-mono text-xs tracking-wide px-3 py-1.5 rounded transition-all duration-300 bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text)]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "明" : "暗"}
    </button>
  );
}
