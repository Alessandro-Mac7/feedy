"use client";

import { motion } from "motion/react";
import type { Meal } from "@/types";

interface DailyTotalsBarProps {
  meals: Meal[];
}

export function DailyTotalsBar({ meals }: DailyTotalsBarProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + (meal.carbs ?? 0),
      fats: acc.fats + (meal.fats ?? 0),
      proteins: acc.proteins + (meal.proteins ?? 0),
    }),
    { carbs: 0, fats: 0, proteins: 0 }
  );

  const kcal = totals.carbs * 4 + totals.fats * 9 + totals.proteins * 4;
  const hasAny = totals.carbs > 0 || totals.fats > 0 || totals.proteins > 0;
  if (!hasAny) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass-strong rounded-2xl px-5 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">Carb</span>
            <span className="text-sm font-bold text-macro-carbs">{totals.carbs}g</span>
          </div>
          <div className="h-6 w-px bg-white/30" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">Grassi</span>
            <span className="text-sm font-bold text-macro-fats">{totals.fats}g</span>
          </div>
          <div className="h-6 w-px bg-white/30" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">Prot</span>
            <span className="text-sm font-bold text-macro-proteins">{totals.proteins}g</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">Totale</span>
          <span className="text-base font-bold text-foreground">{kcal} <span className="text-xs font-medium text-foreground-muted">kcal</span></span>
        </div>
      </div>
    </motion.div>
  );
}
