import { useLangStore, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LangToggle() {
  const { lang, setLang } = useLangStore();

  return (
    <div className="flex items-center bg-brand-800/50 rounded-lg p-0.5">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={cn(
            "px-2 py-1 rounded-md text-[11px] font-bold transition-colors",
            lang === value
              ? "bg-brand-700 text-white"
              : "text-brand-300 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
