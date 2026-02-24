"use client";

import { cn } from "@/lib/utils";
import { MacroBadge } from "@/components/macro-badge";
import { MEAL_EMOJI, type Meal, type MealType } from "@/types";

interface MealCardProps {
  meal: Meal;
  isHighlighted: boolean;
  index: number;
  onEstimateMacros?: (mealId: string) => void;
}

export function MealCard({
  meal,
  isHighlighted,
  onEstimateMacros,
}: MealCardProps) {
  const emoji = MEAL_EMOJI[meal.mealType as MealType] || "\uD83C\uDF7D\uFE0F";
  const hasMacros =
    meal.carbs !== null || meal.fats !== null || meal.proteins !== null;
  const missingMacros =
    meal.carbs === null && meal.fats === null && meal.proteins === null;

  return (
    <div
      className={cn(
        "group rounded-2xl p-4 transition-all duration-200 active:scale-[0.97]",
        isHighlighted
          ? "glass-accent pulse-glow"
          : "glass hover:shadow-lg"
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl",
            isHighlighted
              ? "bg-accent/12"
              : "bg-white/40"
          )}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">
              {meal.mealType}
            </h3>
            {isHighlighted && (
              <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Ora
              </span>
            )}
            {meal.isAiEstimated && (
              <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 tracking-wide">
                AI
              </span>
            )}
          </div>
          <p className="text-[13px] text-foreground-muted mt-1 leading-relaxed">
            {meal.foods}
          </p>

          {meal.notes && (
            <p className="text-xs text-foreground-muted/60 mt-1.5 italic">
              {meal.notes}
            </p>
          )}

          {hasMacros && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <MacroBadge
                label="C"
                value={meal.carbs}
                color="carbs"
                isEstimated={meal.isAiEstimated}
              />
              <MacroBadge
                label="G"
                value={meal.fats}
                color="fats"
                isEstimated={meal.isAiEstimated}
              />
              <MacroBadge
                label="P"
                value={meal.proteins}
                color="proteins"
                isEstimated={meal.isAiEstimated}
              />
            </div>
          )}

          {missingMacros && onEstimateMacros && (
            <button
              onClick={() => onEstimateMacros(meal.id)}
              className="mt-2.5 rounded-xl glass-subtle px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-white/50 transition-colors"
            >
              Stima Macro con AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
