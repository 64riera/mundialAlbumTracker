import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

export function AuthInput({
  label,
  icon: Icon,
  error,
  hint,
  value,
  onChange,
  type = "text",
  className,
  ...rest
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl pl-9 pr-3 py-2.5 text-sm transition-all duration-200",
            "bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100",
            "border border-slate-200 dark:border-slate-600",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:bg-white dark:focus:bg-slate-700",
            "placeholder:text-slate-400/70",
            isPassword && "pr-10",
            error && "border-red-300 dark:border-red-700 focus:ring-red-400/40 focus:border-red-400"
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400/70 mt-1">{hint}</p>}
    </div>
  );
}
