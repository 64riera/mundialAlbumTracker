import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { AuthLayout } from "./AuthLayout";
import { AuthInput } from "./AuthInput";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import type { RegisterInput } from "@/types";

export function RegisterPage() {
  const t = useT();
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form, {
      onSuccess: () => navigate("/stats", { replace: true }),
    });
  };

  const update = (field: keyof RegisterInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const errorData = (register.error as { response?: { data?: { error?: string; details?: { fieldErrors?: Record<string, string[]> } } } } | null)
    ?.response?.data;
  const fieldErrors = errorData?.details?.fieldErrors ?? null;
  const generalError = errorData?.error ?? (register.error ? t.auth.registerError : null);

  return (
    <AuthLayout title={t.auth.register} subtitle={t.auth.registerSubtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            label={t.auth.firstName}
            icon={User}
            required
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            placeholder="Juan"
            autoComplete="given-name"
            error={fieldErrors?.firstName?.[0]}
          />
          <AuthInput
            label={t.auth.lastName}
            icon={User}
            required
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            placeholder="Perez"
            autoComplete="family-name"
            error={fieldErrors?.lastName?.[0]}
          />
        </div>

        <AuthInput
          label={t.auth.email}
          icon={Mail}
          type="email"
          required
          value={form.email}
          onChange={(v) => update("email", v)}
          placeholder="tu@email.com"
          autoComplete="email"
          error={fieldErrors?.email?.[0]}
        />

        <AuthInput
          label={t.auth.phone}
          icon={Phone}
          type="tel"
          required
          value={form.phone}
          onChange={(v) => update("phone", v)}
          placeholder="+51 999 888 777"
          autoComplete="tel"
          error={fieldErrors?.phone?.[0]}
        />

        <AuthInput
          label={t.auth.password}
          icon={Lock}
          type="password"
          required
          value={form.password}
          onChange={(v) => update("password", v)}
          placeholder={t.auth.registerPasswordPlaceholder}
          autoComplete="new-password"
          error={fieldErrors?.password?.[0]}
          hint={t.auth.passwordHint}
        />

        {generalError && !fieldErrors && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
            <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={register.isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
            "bg-gradient-to-r from-brand-600 to-brand-500 text-white",
            "hover:from-brand-700 hover:to-brand-600 hover:shadow-lg hover:shadow-brand-600/25",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          )}
        >
          {register.isPending ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <UserPlus size={16} />
          )}
          {register.isPending ? t.auth.creatingAccount : t.auth.register}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400">o</span></div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t.auth.hasAccount}{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-500 font-semibold transition-colors">
            {t.auth.login}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
