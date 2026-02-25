"use client";

import { motion } from "motion/react";
import type { Meal } from "@/types";

const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FATS = 9;
const KCAL_PER_G_PROTEINS = 4;

const MACROS = [
  { key: "carbs" as const, label: "Carb", color: "#4A8AC4" },
  { key: "fats" as const, label: "Grassi", color: "#C9A033" },
  { key: "proteins" as const, label: "Proteine", color: "#B86B4F" },
];

interface DailySummaryCardProps {
  meals: Meal[];
  dayLabel?: string;
  dietName?: string;
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

  const kcalCarbs = totals.carbs * KCAL_PER_G_CARBS;
  const kcalFats = totals.fats * KCAL_PER_G_FATS;
  const kcalProteins = totals.proteins * KCAL_PER_G_PROTEINS;
  const kcal = kcalCarbs + kcalFats + kcalProteins;
  const hasAny = kcal > 0;

  const pctCarbs = hasAny ? Math.round((kcalCarbs / kcal) * 100) : 0;
  const pctFats = hasAny ? Math.round((kcalFats / kcal) * 100) : 0;
  const pctProteins = hasAny ? 100 - pctCarbs - pctFats : 0;

  const percentages = { carbs: pctCarbs, fats: pctFats, proteins: pctProteins };

  // Donut geometry
  const size = 120;
  const center = size / 2;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const gap = 3; // gap in px between segments

  // Build donut segments
  const segments: { color: string; length: number; offset: number }[] = [];
  if (hasAny) {
    let currentOffset = 0;
    const activeSegments = MACROS.filter((m) => percentages[m.key] > 0);
    const gapTotal = activeSegments.length * gap;
    const availableLength = circumference - gapTotal;

    for (const macro of MACROS) {
      const pct = percentages[macro.key];
      if (pct <= 0) continue;
      const segmentLength = (pct / 100) * availableLength;
      segments.push({
        color: macro.color,
        length: segmentLength,
        offset: currentOffset,
      });
      currentOffset += segmentLength + gap;
    }
  }

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
          {/* Donut chart */}
          <div className="relative shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="10"
              />
              {/* Macro segments */}
              {segments.map((seg, i) => (
                <motion.circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: -seg.offset }}
                  transition={{
                    delay: 0.2 + i * 0.15,
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  transform={`rotate(-90 ${center} ${center})`}
                />
              ))}
            </svg>
            {/* Center text */}
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

          {/* Macro legend with percentages */}
          <div className="flex-1 space-y-3">
            {MACROS.map((macro, i) => {
              const grams = totals[macro.key];
              const pct = percentages[macro.key];
              return (
                <motion.div
                  key={macro.key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2.5"
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: macro.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {macro.label}
                      </span>
                      <span
                        className="text-lg font-bold tabular-nums leading-none"
                        style={{ color: macro.color }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <span className="text-[10px] text-foreground-muted tabular-nums">
                      {grams}g
                    </span>
                  </div>
                </motion.div>
              );
            })}

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
