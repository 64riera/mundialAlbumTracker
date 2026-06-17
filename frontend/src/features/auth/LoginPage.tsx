import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { AuthLayout } from "./AuthLayout";
import { AuthInput } from "./AuthInput";
import { cn } from "@/lib/utils";
import { Mail, Lock, LogIn } from "lucide-react";
import type { LoginInput } from "@/types";

export function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const login = useLogin();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(form, {
      onSuccess: () => navigate("/stats", { replace: true }),
    });
  };

  const update = (field: keyof LoginInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AuthLayout title={t.auth.login} subtitle={t.auth.subtitle}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label={t.auth.email}
          icon={Mail}
          type="email"
          required
          value={form.email}
          onChange={(v) => update("email", v)}
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <AuthInput
          label={t.auth.password}
          icon={Lock}
          type="password"
          required
          value={form.password}
          onChange={(v) => update("password", v)}
          placeholder={t.auth.passwordPlaceholder}
          autoComplete="current-password"
        />

        {login.error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
            <p className="text-sm text-red-600 dark:text-red-400">
              {(login.error as { response?: { data?: { error?: string } } } | null)?.response?.data?.error ?? t.auth.loginError}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
            "bg-gradient-to-r from-brand-600 to-brand-500 text-white",
            "hover:from-brand-700 hover:to-brand-600 hover:shadow-lg hover:shadow-brand-600/25",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          )}
        >
          {login.isPending ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <LogIn size={16} />
          )}
          {login.isPending ? t.auth.loggingIn : t.auth.login}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400">o</span></div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t.auth.noAccount}{" "}
          <Link to="/register" className="text-brand-600 hover:text-brand-500 font-semibold transition-colors">
            {t.auth.register}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
