import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light" as const, icon: Sun, label: "Claro" },
  { value: "dark" as const, icon: Moon, label: "Oscuro" },
  { value: "system" as const, icon: Monitor, label: "Sistema" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center bg-brand-800/50 rounded-lg p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            theme === value
              ? "bg-brand-700 text-white"
              : "text-brand-300 hover:text-white"
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
