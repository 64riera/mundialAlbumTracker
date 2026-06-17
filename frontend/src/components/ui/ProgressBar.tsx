import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const barColor =
    pct === 100
      ? "bg-gold-400"
      : pct >= 75
        ? "bg-brand-500"
        : pct >= 40
          ? "bg-brand-400"
          : "bg-slate-400";

  const heights = { sm: "h-1", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-slate-200 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-0.5 block">{pct}%</span>
      )}
    </div>
  );
}
