"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Meal } from "@/types";

const KCAL_PER_G = { carbs: 4, fats: 9, proteins: 4 } as const;

const MACROS = [
  { key: "carbs" as const, label: "Carb", color: "#4A8AC4" },
  { key: "fats" as const, label: "Grassi", color: "#C9A033" },
  { key: "proteins" as const, label: "Prot", color: "#B86B4F" },
];

interface MacroDonutCardProps {
  meals: Meal[];
}

export function MacroDonutCard({ meals }: MacroDonutCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totals = meals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + (meal.carbs ?? 0),
      fats: acc.fats + (meal.fats ?? 0),
      proteins: acc.proteins + (meal.proteins ?? 0),
    }),
    { carbs: 0, fats: 0, proteins: 0 }
  );

  const kcalCarbs = totals.carbs * KCAL_PER_G.carbs;
  const kcalFats = totals.fats * KCAL_PER_G.fats;
  const kcalProteins = totals.proteins * KCAL_PER_G.proteins;
  const kcal = kcalCarbs + kcalFats + kcalProteins;
  const hasAny = kcal > 0;

  const pctCarbs = hasAny ? Math.round((kcalCarbs / kcal) * 100) : 0;
  const pctFats = hasAny ? Math.round((kcalFats / kcal) * 100) : 0;
  const pctProteins = hasAny ? 100 - pctCarbs - pctFats : 0;

  const percentages = { carbs: pctCarbs, fats: pctFats, proteins: pctProteins };

  // Donut geometry
  const size = 100;
  const center = size / 2;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const gap = 3;

  const segments: {
    key: string;
    color: string;
    length: number;
    offset: number;
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
        color: macro.color,
        length: segmentLength,
        offset: currentOffset,
        macroIndex: mi,
      });
      currentOffset += segmentLength + gap;
    }
  }

  function handleDonutTap() {
    if (activeIndex === null) setActiveIndex(0);
    else if (activeIndex >= MACROS.length - 1) setActiveIndex(null);
    else setActiveIndex(activeIndex + 1);
  }

  const activeMacro = activeIndex !== null ? MACROS[activeIndex] : null;
  const centerColor = activeMacro ? activeMacro.color : "var(--foreground)";
  const centerValue = activeMacro
    ? `${percentages[activeMacro.key]}%`
    : String(kcal);
  const centerSub = activeMacro
    ? `${activeMacro.label} · ${totals[activeMacro.key]}g`
    : "kcal";

  if (!hasAny) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="glass rounded-2xl p-4 flex flex-col items-center justify-center min-h-[180px]"
      >
        <span className="text-2xl mb-2">📊</span>
        <span className="text-[11px] text-foreground-muted text-center">
          Nessun macro tracciato
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass rounded-2xl p-4 flex flex-col items-center gap-3"
    >
      {/* Donut */}
      <div className="relative cursor-pointer" onClick={handleDonutTap}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="8"
          />
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
                initial={{ strokeDashoffset: circumference, strokeWidth: 8 }}
                animate={{
                  strokeDashoffset: -seg.offset,
                  strokeWidth: activeIndex === seg.macroIndex ? 12 : 8,
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
                className="text-lg font-bold tabular-nums leading-none"
                style={{ color: centerColor }}
              >
                {centerValue}
              </span>
              <span
                className="text-[8px] font-medium uppercase tracking-wider mt-0.5"
                style={{ color: activeMacro ? activeMacro.color : "var(--foreground-muted)" }}
              >
                {centerSub}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Macro legend — centered */}
      <div className="flex flex-col items-center gap-1.5">
        {MACROS.map((macro, i) => {
          const grams = totals[macro.key];
          const pct = percentages[macro.key];
          if (pct <= 0) return null;
          const isActive = activeIndex === i;
          return (
            <motion.div
              key={macro.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: activeIndex === null || isActive ? 1 : 0.4,
                y: 0,
              }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              className="cursor-pointer flex items-center gap-2"
              onClick={() => setActiveIndex(isActive ? null : i)}
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: macro.color }}
              />
              <span className="text-[11px] font-semibold text-foreground w-[46px]">
                {macro.label}
              </span>
              <span className="text-[10px] text-foreground-muted tabular-nums w-[30px] text-right">
                {grams}g
              </span>
              <span
                className="text-[10px] font-bold tabular-nums w-[26px] text-right"
                style={{ color: macro.color }}
              >
                {pct}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
