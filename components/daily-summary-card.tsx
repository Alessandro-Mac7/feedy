"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  // null = show kcal, 0/1/2 = show macro index
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
  const size = 148;
  const center = size / 2;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const gap = 3;

  // Build donut segments
  const segments: {
    key: string;
    label: string;
    color: string;
    length: number;
    offset: number;
    pct: number;
    grams: number;
    macroIndex: number;
  }[] = [];

  if (hasAny) {
    let currentOffset = 0;
    const activeSegments = MACROS.filter((m) => percentages[m.key] > 0);
    const gapTotal = activeSegments.length * gap;
    const availableLength = circumference - gapTotal;

    for (let mi = 0; mi < MACROS.length; mi++) {
      const macro = MACROS[mi];
      const pct = percentages[macro.key];
      if (pct <= 0) continue;
      const segmentLength = (pct / 100) * availableLength;

      segments.push({
        key: macro.key,
        label: macro.label,
        color: macro.color,
        length: segmentLength,
        offset: currentOffset,
        pct,
        grams: totals[macro.key],
        macroIndex: mi,
      });
      currentOffset += segmentLength + gap;
    }
  }

  function handleDonutTap() {
    if (activeIndex === null) {
      setActiveIndex(0);
    } else if (activeIndex >= MACROS.length - 1) {
      setActiveIndex(null);
    } else {
      setActiveIndex(activeIndex + 1);
    }
  }

  // What to show in center
  const activeMacro = activeIndex !== null ? MACROS[activeIndex] : null;
  const centerColor = activeMacro ? activeMacro.color : "var(--foreground)";
  const centerValue = activeMacro
    ? `${percentages[activeMacro.key]}%`
    : String(kcal);
  const centerSub = activeMacro
    ? `${activeMacro.label} · ${totals[activeMacro.key]}g`
    : "kcal";

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
          {/* Donut chart — tap to cycle */}
          <div
            className="relative shrink-0 cursor-pointer"
            onClick={handleDonutTap}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="12"
              />
              {/* Macro segments */}
              {segments.map((seg, i) => {
                const isHighlighted = activeIndex === null || activeIndex === seg.macroIndex;
                return (
                  <motion.circle
                    key={seg.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeLinecap="round"
                    strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                    initial={{ strokeDashoffset: circumference, strokeWidth: 12 }}
                    animate={{
                      strokeDashoffset: -seg.offset,
                      strokeWidth: activeIndex === seg.macroIndex ? 16 : 12,
                      opacity: isHighlighted ? 1 : 0.3,
                    }}
                    transition={{
                      strokeDashoffset: {
                        delay: 0.2 + i * 0.15,
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1],
                      },
                      strokeWidth: { duration: 0.3, ease: "easeOut" },
                      opacity: { duration: 0.3 },
                    }}
                    transform={`rotate(-90 ${center} ${center})`}
                  />
                );
              })}
            </svg>
            {/* Center text — animates on change */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex ?? "kcal"}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <span
                    className="text-2xl font-bold tabular-nums leading-none"
                    style={{ color: centerColor }}
                  >
                    {centerValue}
                  </span>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider mt-0.5"
                    style={{ color: activeMacro ? activeMacro.color : "var(--foreground-muted)" }}
                  >
                    {centerSub}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Tap hint */}
            {activeIndex === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2"
              >
                <span className="text-[9px] text-foreground-muted/50">tap</span>
              </motion.div>
            )}
          </div>

          {/* Macro legend with grams */}
          <div className="flex-1 space-y-3">
            {MACROS.map((macro, i) => {
              const grams = totals[macro.key];
              const pct = percentages[macro.key];
              if (pct <= 0) return null;
              const isActive = activeIndex === i;
              return (
                <motion.div
                  key={macro.key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{
                    opacity: activeIndex === null || isActive ? 1 : 0.4,
                    x: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => setActiveIndex(isActive ? null : i)}
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: macro.color,
                      transform: isActive ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground">
                      {macro.label}
                    </span>
                    <span className="text-[10px] text-foreground-muted tabular-nums ml-1.5">
                      {grams}g
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        className="text-[10px] font-bold tabular-nums ml-1"
                        style={{ color: macro.color }}
                      >
                        · {pct}%
                      </motion.span>
                    )}
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
