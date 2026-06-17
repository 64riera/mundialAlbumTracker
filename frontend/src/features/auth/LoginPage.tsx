import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { AuthLayout } from "./AuthLayout";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, LogIn } from "lucide-react";
import type { LoginInput } from "@/types";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(form, {
      onSuccess: () => navigate("/stats", { replace: true }),
    });
  };

  const update = (field: keyof LoginInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Mundial 2026 - Álbum Panini Tracker">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="tu@email.com"
            className={cn(
              "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm",
              "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
              "placeholder:text-slate-400"
            )}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Tu contraseña"
              className={cn(
                "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-sm",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
                "placeholder:text-slate-400"
              )}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {login.error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <p className="text-sm text-red-600 dark:text-red-400">
              {(login.error as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Error al iniciar sesión"}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
            "bg-brand-600 text-white hover:bg-brand-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {login.isPending ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <LogIn size={16} />
          )}
          {login.isPending ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
