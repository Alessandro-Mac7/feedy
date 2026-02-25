"use client";

import { useState, useEffect, useCallback } from "react";
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

// Water tracker constants
const WATER_GLASSES = 8;
const WATER_ML_PER_GLASS = 250;
const WATER_TARGET_ML = WATER_GLASSES * WATER_ML_PER_GLASS;

function getWaterStorageKey(day: string): string {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekKey = weekStart.toISOString().slice(0, 10);
  return `water-${weekKey}-${day}`;
}

interface DailySummaryCardProps {
  meals: Meal[];
  dayLabel?: string;
  dietName?: string;
}

export function DailySummaryCard({ meals, dayLabel, dietName }: DailySummaryCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Water state
  const [waterFilled, setWaterFilled] = useState(0);
  const [lastTapped, setLastTapped] = useState<number | null>(null);
  const waterKey = dayLabel ? getWaterStorageKey(dayLabel) : "";

  useEffect(() => {
    if (!waterKey) return;
    const saved = localStorage.getItem(waterKey);
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 0 && val <= WATER_GLASSES) {
        setWaterFilled(val);
      }
    } else {
      setWaterFilled(0);
    }
  }, [waterKey]);

  const handleWaterTap = useCallback(
    (index: number) => {
      const newFilled = index + 1 === waterFilled ? index : index + 1;
      setWaterFilled(newFilled);
      setLastTapped(index);
      if (waterKey) localStorage.setItem(waterKey, String(newFilled));
      setTimeout(() => setLastTapped(null), 400);
    },
    [waterFilled, waterKey]
  );

  const waterMl = waterFilled * WATER_ML_PER_GLASS;
  const waterPct = Math.round((waterMl / WATER_TARGET_ML) * 100);
  const waterComplete = waterFilled >= WATER_GLASSES;

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

  // Water display text
  const waterText =
    waterMl >= 1000
      ? `${(waterMl / 1000).toFixed(waterMl % 1000 === 0 ? 0 : 1)}L`
      : `${waterMl}ml`;

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
          <div
            className="relative shrink-0 cursor-pointer"
            onClick={handleDonutTap}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="12"
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

          {/* Macro legend */}
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

      {/* Water tracker — divider + inline */}
      {dayLabel && (
        <>
          <div className="border-t border-white/15 mt-4 pt-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#4A9BD9]">
                  <path
                    d="M12 2C12 2 4 11 4 16C4 20.4 7.6 24 12 24C16.4 24 20 20.4 20 16C20 11 12 2 12 2Z"
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <path
                    d="M12 2C12 2 4 11 4 16C4 20.4 7.6 24 12 24C16.4 24 20 20.4 20 16C20 11 12 2 12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Acqua
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={waterMl}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold tabular-nums"
                  style={{ color: waterComplete ? "#2D9F8F" : "#4A9BD9" }}
                >
                  {waterText}
                </motion.span>
                <span className="text-[10px] text-foreground-muted">/ 2L</span>
                {waterComplete && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2D9F8F"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </div>
            </div>

            {/* Droplets row */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: WATER_GLASSES }).map((_, i) => {
                const isFilled = i < waterFilled;
                const isJustTapped = i === lastTapped;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleWaterTap(i)}
                    className="flex-1 flex items-center justify-center min-h-[40px]"
                    aria-label={`Bicchiere ${i + 1} di ${WATER_GLASSES}`}
                  >
                    <motion.svg
                      width="22"
                      height="28"
                      viewBox="0 0 28 34"
                      initial={false}
                      animate={{
                        scale: isJustTapped ? [1, 1.35, 1] : 1,
                        y: isJustTapped ? [0, -3, 0] : 0,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <defs>
                        <linearGradient
                          id={`wf-${i}`}
                          x1="14"
                          y1="2"
                          x2="14"
                          y2="31"
                        >
                          <stop offset="0%" stopColor="#7BC4E8" />
                          <stop offset="100%" stopColor="#4A9BD9" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M14 2C14 2 4 14 4 21C4 26.5 8.5 31 14 31C19.5 31 24 26.5 24 21C24 14 14 2 14 2Z"
                        fill={isFilled ? `url(#wf-${i})` : "none"}
                        stroke={isFilled ? "#4A9BD9" : "rgba(74,155,217,0.3)"}
                        strokeWidth="1.5"
                        strokeDasharray={isFilled ? "none" : "3 2"}
                      />
                      {isFilled && (
                        <ellipse
                          cx="10"
                          cy="18"
                          rx="2"
                          ry="3.5"
                          fill="rgba(255,255,255,0.3)"
                          transform="rotate(-15 10 18)"
                        />
                      )}
                    </motion.svg>
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: waterComplete
                    ? "linear-gradient(90deg, #2D9F8F, #3BB5A4)"
                    : "linear-gradient(90deg, #7BC4E8, #4A9BD9)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${waterPct}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
