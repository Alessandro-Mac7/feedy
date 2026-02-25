"use client";

import { motion } from "motion/react";
import { DAYS, type Meal } from "@/types";

const KCAL_PER_G = { carbs: 4, fats: 9, proteins: 4 } as const;

interface WeeklyStatsCardProps {
  meals: Meal[];
}

export function WeeklyStatsCard({ meals }: WeeklyStatsCardProps) {
  const dayStats = DAYS.map((day) => {
    const dayMeals = meals.filter((m) => m.day === day);
    const carbs = dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
    const fats = dayMeals.reduce((s, m) => s + (m.fats ?? 0), 0);
    const proteins = dayMeals.reduce((s, m) => s + (m.proteins ?? 0), 0);
    const kcal = carbs * KCAL_PER_G.carbs + fats * KCAL_PER_G.fats + proteins * KCAL_PER_G.proteins;
    const completed = dayMeals.filter((m) => m.isCompleted).length;
    const total = dayMeals.length;
    return { day, kcal, completed, total };
  });

  const daysWithKcal = dayStats.filter((d) => d.kcal > 0);
  const avgKcal = daysWithKcal.length > 0
    ? Math.round(daysWithKcal.reduce((s, d) => s + d.kcal, 0) / daysWithKcal.length)
    : 0;

  const totalCompleted = dayStats.reduce((s, d) => s + d.completed, 0);
  const totalMeals = dayStats.reduce((s, d) => s + d.total, 0);
  const completionRate = totalMeals > 0 ? Math.round((totalCompleted / totalMeals) * 100) : 0;

  const bestDay = daysWithKcal.length > 0
    ? daysWithKcal.reduce((best, d) => (d.completed / Math.max(d.total, 1)) > (best.completed / Math.max(best.total, 1)) ? d : best)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl px-5 py-4"
    >
      <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Riepilogo settimana</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground tabular-nums">{avgKcal}</p>
          <p className="text-[10px] text-foreground-muted">kcal/giorno</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-primary tabular-nums">{completionRate}%</p>
          <p className="text-[10px] text-foreground-muted">completamento</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-accent tabular-nums">{bestDay?.day?.slice(0, 3) ?? "—"}</p>
          <p className="text-[10px] text-foreground-muted">miglior giorno</p>
        </div>
      </div>
    </motion.div>
  );
}
