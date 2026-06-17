import { useNotifications } from "@/hooks/useNotifications";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Loader2 } from "lucide-react";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function NotificationSettings() {
  const t = useT();
  const {
    isSupported,
    permission,
    isSubscribed,
    preferences,
    subscribe,
    unsubscribe,
    updatePrefs,
    isLoading,
  } = useNotifications();

  if (!isSupported) return null;

  const denied = permission === "denied";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell size={16} className="text-brand-600" />
          ) : (
            <BellOff size={16} className="text-slate-400" />
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.notifications.title}
          </span>
        </div>

        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        ) : isSubscribed ? (
          <button
            onClick={() => unsubscribe()}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            {t.notifications.disable}
          </button>
        ) : (
          <button
            onClick={() => subscribe()}
            disabled={denied}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-lg transition-colors",
              denied
                ? "text-slate-400 cursor-not-allowed"
                : "bg-brand-600 text-white hover:bg-brand-700"
            )}
          >
            {t.notifications.enable}
          </button>
        )}
      </div>

      {denied && !isSubscribed && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t.notifications.denied}
        </p>
      )}

      {isSubscribed && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {t.notifications.matchStart}
            </span>
            <Toggle
              checked={preferences.matchStart}
              onChange={(v) => updatePrefs({ matchStart: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {t.notifications.goals}
            </span>
            <Toggle
              checked={preferences.goals}
              onChange={(v) => updatePrefs({ goals: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
