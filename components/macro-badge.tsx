import { cn } from "@/lib/utils";

interface MacroBadgeProps {
  label: string;
  value: number | null;
  color: "carbs" | "fats" | "proteins";
  isEstimated?: boolean;
}

const colorClasses = {
  carbs: "bg-macro-carbs/12 text-macro-carbs border-macro-carbs/15",
  fats: "bg-macro-fats/12 text-macro-fats border-macro-fats/15",
  proteins: "bg-macro-proteins/12 text-macro-proteins border-macro-proteins/15",
};

export function MacroBadge({ label, value, color, isEstimated }: MacroBadgeProps) {
  if (value === null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[10px] font-bold border backdrop-blur-sm",
        colorClasses[color]
      )}
    >
      {isEstimated && <span title="Stima AI" className="opacity-60">~</span>}
      {value}g {label}
    </span>
  );
}
