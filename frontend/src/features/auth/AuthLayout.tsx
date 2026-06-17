import { ReactNode } from "react";
import { Trophy } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 px-4 py-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl" />

      {/* Lang toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LangToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-5 shadow-lg shadow-black/10">
            <Trophy size={28} className="text-gold-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-brand-300/80 text-sm mt-1.5">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-black/20 p-6 sm:p-8 border border-white/5">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-brand-400/40 text-xs mt-6">
          Mundial 2026 Album Tracker
        </p>
      </div>
    </div>
  );
}
