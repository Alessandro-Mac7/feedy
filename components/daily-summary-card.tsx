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
  const [justAdded, setJustAdded] = useState(false);
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

  const handleWaterTap = useCallback(() => {
    const next = waterFilled >= WATER_GLASSES ? 0 : waterFilled + 1;
    setWaterFilled(next);
    setJustAdded(true);
    if (waterKey) localStorage.setItem(waterKey, String(next));
    setTimeout(() => setJustAdded(false), 500);
  }, [waterFilled, waterKey]);

  const waterMl = waterFilled * WATER_ML_PER_GLASS;
  const waterPct = (waterMl / WATER_TARGET_ML) * 100;
  const waterComplete = waterFilled >= WATER_GLASSES;

  const waterText =
    waterMl >= 1000
      ? `${(waterMl / 1000).toFixed(waterMl % 1000 === 0 ? 0 : 1)}L`
      : `${waterMl}ml`;

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
  const size = 130;
  const center = size / 2;
  const radius = 48;
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

  // Water column dimensions
  const colHeight = 120;
  const colWidth = 36;
  const colRadius = 12;

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
        <div className="flex items-start gap-4">
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
                strokeWidth="10"
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
                    initial={{ strokeDashoffset: circumference, strokeWidth: 10 }}
                    animate={{
                      strokeDashoffset: -seg.offset,
                      strokeWidth: activeIndex === seg.macroIndex ? 14 : 10,
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
                    className="text-xl font-bold tabular-nums leading-none"
                    style={{ color: centerColor }}
                  >
                    {centerValue}
                  </span>
                  <span
                    className="text-[9px] font-medium uppercase tracking-wider mt-0.5"
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

          {/* Macro legend — center column */}
          <div className="flex-1 min-w-0 space-y-2.5 pt-1">
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
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setActiveIndex(isActive ? null : i)}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: macro.color,
                      transform: isActive ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-foreground">
                      {macro.label}
                    </span>
                    <span className="text-[10px] text-foreground-muted tabular-nums ml-1">
                      {grams}g
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-bold tabular-nums ml-0.5"
                        style={{ color: macro.color }}
                      >
                        · {pct}%
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <div className="flex items-center gap-1.5 pt-0.5">
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
                {completedMeals}/{meals.length} pasti
              </span>
            </div>
          </div>

          {/* Water column — right side */}
          {dayLabel && (
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleWaterTap}
                className="relative cursor-pointer"
                aria-label={`Aggiungi acqua: ${waterMl}ml di ${WATER_TARGET_ML}ml`}
              >
                <svg width={colWidth} height={colHeight} viewBox={`0 0 ${colWidth} ${colHeight}`}>
                  <defs>
                    <clipPath id="water-col-clip">
                      <rect x="0" y="0" width={colWidth} height={colHeight} rx={colRadius} />
                    </clipPath>
                    <linearGradient id="water-col-grad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#3B8DD4" />
                      <stop offset="100%" stopColor="#7BC4E8" />
                    </linearGradient>
                  </defs>

                  {/* Background */}
                  <rect
                    x="0"
                    y="0"
                    width={colWidth}
                    height={colHeight}
                    rx={colRadius}
                    fill="none"
                    stroke="rgba(74,155,217,0.25)"
                    strokeWidth="1.5"
                  />

                  {/* Graduation marks */}
                  {[2, 4, 6].map((level) => {
                    const markY = colHeight - (level / WATER_GLASSES) * colHeight;
                    return (
                      <line
                        key={level}
                        x1="6"
                        y1={markY}
                        x2={colWidth - 6}
                        y2={markY}
                        stroke="rgba(74,155,217,0.12)"
                        strokeWidth="0.75"
                      />
                    );
                  })}

                  {/* Water fill */}
                  <g clipPath="url(#water-col-clip)">
                    <motion.rect
                      x="0"
                      width={colWidth}
                      initial={{ height: 0, y: colHeight }}
                      animate={{
                        height: (waterPct / 100) * colHeight,
                        y: colHeight - (waterPct / 100) * colHeight,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      fill="url(#water-col-grad)"
                      opacity={0.85}
                    />

                    {/* Wave at top of water */}
                    {waterPct > 0 && waterPct < 100 && (
                      <motion.path
                        initial={{ y: colHeight }}
                        animate={{
                          y: colHeight - (waterPct / 100) * colHeight - 3,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        d={`M0,4 Q${colWidth * 0.25},0 ${colWidth * 0.5},4 Q${colWidth * 0.75},8 ${colWidth},4 L${colWidth},10 L0,10 Z`}
                        fill="url(#water-col-grad)"
                        opacity={0.85}
                      >
                        <animate
                          attributeName="d"
                          dur="3s"
                          repeatCount="indefinite"
                          values={`
                            M0,4 Q${colWidth * 0.25},0 ${colWidth * 0.5},4 Q${colWidth * 0.75},8 ${colWidth},4 L${colWidth},10 L0,10 Z;
                            M0,4 Q${colWidth * 0.25},8 ${colWidth * 0.5},4 Q${colWidth * 0.75},0 ${colWidth},4 L${colWidth},10 L0,10 Z;
                            M0,4 Q${colWidth * 0.25},0 ${colWidth * 0.5},4 Q${colWidth * 0.75},8 ${colWidth},4 L${colWidth},10 L0,10 Z
                          `}
                        />
                      </motion.path>
                    )}

                    {/* Shine */}
                    <rect
                      x="5"
                      y="0"
                      width="4"
                      height={colHeight}
                      rx="2"
                      fill="rgba(255,255,255,0.12)"
                    />
                  </g>

                  {/* Plus icon when not full */}
                  {!waterComplete && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ delay: 0.8 }}
                    >
                      <line
                        x1={colWidth / 2}
                        y1="8"
                        x2={colWidth / 2}
                        y2="16"
                        stroke="rgba(74,155,217,0.6)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1={colWidth / 2 - 4}
                        y1="12"
                        x2={colWidth / 2 + 4}
                        y2="12"
                        stroke="rgba(74,155,217,0.6)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </motion.g>
                  )}

                  {/* Check when complete */}
                  {waterComplete && (
                    <motion.polyline
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      points={`${colWidth / 2 - 5},${colHeight / 2} ${colWidth / 2 - 1},${colHeight / 2 + 4} ${colWidth / 2 + 5},${colHeight / 2 - 4}`}
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* Ripple on tap */}
                <AnimatePresence>
                  {justAdded && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-xl border-2 border-[#4A9BD9]"
                    />
                  )}
                </AnimatePresence>
              </button>

              {/* Water amount label */}
              <div className="flex flex-col items-center">
                <motion.span
                  key={waterMl}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-[11px] font-bold tabular-nums leading-none"
                  style={{ color: waterComplete ? "#2D9F8F" : "#4A9BD9" }}
                >
                  {waterText}
                </motion.span>
                <span className="text-[9px] text-foreground-muted/60">/ 2L</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {meals.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
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
          )}

          {/* Water column even without macros */}
          {dayLabel && (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleWaterTap}
                className="relative cursor-pointer"
                aria-label={`Aggiungi acqua: ${waterMl}ml di ${WATER_TARGET_ML}ml`}
              >
                <svg width={colWidth} height={80} viewBox={`0 0 ${colWidth} 80`}>
                  <defs>
                    <clipPath id="water-col-clip-sm">
                      <rect x="0" y="0" width={colWidth} height={80} rx={colRadius} />
                    </clipPath>
                    <linearGradient id="water-col-grad-sm" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#3B8DD4" />
                      <stop offset="100%" stopColor="#7BC4E8" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0" y="0"
                    width={colWidth} height={80}
                    rx={colRadius}
                    fill="none"
                    stroke="rgba(74,155,217,0.25)"
                    strokeWidth="1.5"
                  />
                  <g clipPath="url(#water-col-clip-sm)">
                    <motion.rect
                      x="0"
                      width={colWidth}
                      initial={{ height: 0, y: 80 }}
                      animate={{
                        height: (waterPct / 100) * 80,
                        y: 80 - (waterPct / 100) * 80,
                      }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      fill="url(#water-col-grad-sm)"
                      opacity={0.85}
                    />
                    <rect x="5" y="0" width="4" height={80} rx="2" fill="rgba(255,255,255,0.12)" />
                  </g>
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Acqua
                </span>
                <motion.span
                  key={waterMl}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-bold tabular-nums"
                  style={{ color: waterComplete ? "#2D9F8F" : "#4A9BD9" }}
                >
                  {waterText}
                  <span className="text-[10px] text-foreground-muted font-normal"> / 2L</span>
                </motion.span>
                <span className="text-[9px] text-foreground-muted/50 mt-0.5">tap per aggiungere</span>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
