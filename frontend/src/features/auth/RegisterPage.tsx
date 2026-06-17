import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { AuthLayout } from "./AuthLayout";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import type { RegisterInput } from "@/types";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

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
  const generalError = errorData?.error ?? (register.error ? "Error al crear cuenta" : null);

  return (
    <AuthLayout title="Crear cuenta" subtitle="Empieza a trackear tu álbum del Mundial 2026">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Juan"
              className={cn(
                "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
                "placeholder:text-slate-400"
              )}
              autoComplete="given-name"
            />
            {fieldErrors?.firstName && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Apellido
            </label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Pérez"
              className={cn(
                "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
                "placeholder:text-slate-400"
              )}
              autoComplete="family-name"
            />
            {fieldErrors?.lastName && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName[0]}</p>
            )}
          </div>
        </div>

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
          {fieldErrors?.email && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+51 999 888 777"
            className={cn(
              "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm",
              "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
              "placeholder:text-slate-400"
            )}
            autoComplete="tel"
          />
          {fieldErrors?.phone && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>
          )}
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
              placeholder="Min. 8 caracteres, mayúscula, número"
              className={cn(
                "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-sm",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
                "placeholder:text-slate-400"
              )}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors?.password && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.password[0]}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </p>
        </div>

        {generalError && !fieldErrors && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={register.isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
            "bg-brand-600 text-white hover:bg-brand-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {register.isPending ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <UserPlus size={16} />
          )}
          {register.isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
