"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { MacroBadge } from "@/components/macro-badge";
import { MEAL_EMOJI, type Meal, type MealType } from "@/types";

interface MealCardProps {
  meal: Meal;
  isHighlighted: boolean;
  index: number;
  onEstimateMacros?: (mealId: string) => void;
  onToggleComplete?: (mealId: string) => void;
}

export function MealCard({
  meal,
  isHighlighted,
  index,
  onEstimateMacros,
  onToggleComplete,
}: MealCardProps) {
  const emoji = MEAL_EMOJI[meal.mealType as MealType] || "\uD83C\uDF7D\uFE0F";
  const hasMacros =
    meal.carbs !== null || meal.fats !== null || meal.proteins !== null;
  const missingMacros =
    meal.carbs === null && meal.fats === null && meal.proteins === null;
  const completed = meal.isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onTapStart={() => navigator.vibrate?.(10)}
      className={cn(
        "group rounded-2xl p-4 transition-shadow duration-200",
        isHighlighted
          ? "glass-accent pulse-glow"
          : "glass hover:shadow-lg",
        completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(meal.id);
          }}
          className="mt-0.5 shrink-0"
          aria-label={completed ? "Segna come non completato" : "Segna come completato"}
        >
          <motion.div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
              completed
                ? "border-primary bg-primary"
                : "border-foreground-muted/30"
            )}
            whileTap={{ scale: 0.85 }}
          >
            {completed && (
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </motion.div>
        </button>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl",
            isHighlighted
              ? "bg-accent/12"
              : "bg-surface"
          )}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold text-sm text-foreground",
              completed && "line-through"
            )}>
              {meal.mealType}
            </h3>
            {isHighlighted && !completed && (
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
          <p className={cn(
            "text-[13px] text-foreground-muted mt-1 leading-relaxed",
            completed && "line-through"
          )}>
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

          {missingMacros && onEstimateMacros && !completed && (
            <motion.button
              onClick={() => onEstimateMacros(meal.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2.5 rounded-xl glass-subtle px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-surface-hover transition-colors"
            >
              Stima Macro con AI
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
