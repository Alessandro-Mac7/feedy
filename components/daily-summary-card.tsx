"use client";

import { motion } from "motion/react";
import type { Meal } from "@/types";

const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FATS = 9;
const KCAL_PER_G_PROTEINS = 4;
const TARGET_KCAL_DEFAULT = 2000;

interface DailySummaryCardProps {
  meals: Meal[];
  dayLabel?: string;
  dietName?: string;
}

function MacroRow({
  label,
  value,
  color,
  max,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  max: number;
  delay: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider w-10" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color }}>
        {value}g
      </span>
    </div>
  );
}

export function DailySummaryCard({ meals, dayLabel, dietName }: DailySummaryCardProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + (meal.carbs ?? 0),
      fats: acc.fats + (meal.fats ?? 0),
      proteins: acc.proteins + (meal.proteins ?? 0),
    }),
    { carbs: 0, fats: 0, proteins: 0 }
  );

  const kcal = totals.carbs * KCAL_PER_G_CARBS + totals.fats * KCAL_PER_G_FATS + totals.proteins * KCAL_PER_G_PROTEINS;
  const hasAny = totals.carbs > 0 || totals.fats > 0 || totals.proteins > 0;

  // SVG circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const targetKcal = TARGET_KCAL_DEFAULT;
  const progress = Math.min(kcal / targetKcal, 1);

  // Find max macro for proportional bars
  const macroMax = Math.max(totals.carbs, totals.fats, totals.proteins, 1);
  const barMax = macroMax * 1.3;

  const completedMeals = meals.filter(
    (m) => m.carbs !== null || m.fats !== null || m.proteins !== null
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong rounded-3xl p-5"
    >
      {/* Day header */}
      {dayLabel && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl text-foreground leading-tight">{dayLabel}</h1>
          {dietName && (
            <span className="rounded-xl glass-subtle px-3 py-1.5 text-[11px] font-semibold text-foreground-muted">
              {dietName}
            </span>
          )}
        </div>
      )}

      {hasAny ? (
        <div className="flex items-center gap-5">
          {/* Circular ring */}
          <div className="relative shrink-0">
            <svg width="124" height="124" viewBox="0 0 124 124">
              <circle
                cx="62"
                cy="62"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="62"
                cy="62"
                r={radius}
                fill="none"
                stroke="url(#kcal-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 62 62)"
              />
              <defs>
                <linearGradient id="kcal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D9F8F" />
                  <stop offset="100%" stopColor="#3BB5A4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-2xl font-bold text-foreground tabular-nums leading-none"
              >
                {kcal}
              </motion.span>
              <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider mt-0.5">
                kcal
              </span>
            </div>
          </div>

          {/* Macro bars */}
          <div className="flex-1 space-y-2.5">
            <MacroRow
              label="Carb"
              value={totals.carbs}
              color="#4A8AC4"
              max={barMax}
              delay={0.3}
            />
            <MacroRow
              label="Grassi"
              value={totals.fats}
              color="#C9A033"
              max={barMax}
              delay={0.4}
            />
            <MacroRow
              label="Prot"
              value={totals.proteins}
              color="#B86B4F"
              max={barMax}
              delay={0.5}
            />

            {/* Meal count */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex -space-x-1">
                {meals.slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full border border-white/40 ${
                      i < completedMeals ? "bg-primary" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-foreground-muted">
                {completedMeals}/{meals.length} pasti tracciati
              </span>
            </div>
          </div>
        </div>
      ) : (
        meals.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {meals.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full border border-white/40 bg-white/25"
                />
              ))}
            </div>
            <span className="text-[10px] text-foreground-muted">
              {meals.length} pasti — nessun macro tracciato
            </span>
          </div>
        )
      )}
    </motion.div>
  );
}
