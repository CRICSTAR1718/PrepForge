import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-violet-500/50 hover:bg-violet-500/10 smooth-transition shadow-sm flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-violet-800" />
      ) : (
        <Sun className="w-5 h-5 text-amber-300" />
      )}
    </button>
  );
}
