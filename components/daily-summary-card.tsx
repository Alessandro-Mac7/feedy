"use client";

import { motion } from "motion/react";
import type { Meal } from "@/types";

interface DailySummaryCardProps {
  meals: Meal[];
  dayLabel?: string;
  dietName?: string;
}

export function DailySummaryCard({ meals, dayLabel, dietName }: DailySummaryCardProps) {
  const completedMeals = meals.filter(
    (m) => m.carbs !== null || m.fats !== null || m.proteins !== null
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong rounded-3xl px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {dayLabel && (
            <h1 className="font-display text-2xl text-foreground leading-tight">
              {dayLabel}
            </h1>
          )}
          {meals.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {meals.slice(0, 6).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full border border-white/40 ${
                      i < completedMeals ? "bg-primary" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-foreground-muted tabular-nums">
                {completedMeals}/{meals.length}
              </span>
            </div>
          )}
        </div>
        {dietName && (
          <span className="rounded-xl glass-subtle px-3 py-1.5 text-[11px] font-semibold text-foreground-muted truncate max-w-[140px]">
            {dietName}
          </span>
        )}
      </div>
    </motion.div>
  );
}
