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
  { key: "proteins" as const, label: "Prot", color: "#B86B4F" },
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

  const handleWaterAdd = useCallback(() => {
    if (waterFilled >= WATER_GLASSES) return;
    const next = waterFilled + 1;
    setWaterFilled(next);
    if (waterKey) localStorage.setItem(waterKey, String(next));
  }, [waterFilled, waterKey]);

  const handleWaterRemove = useCallback(() => {
    if (waterFilled <= 0) return;
    const next = waterFilled - 1;
    setWaterFilled(next);
    if (waterKey) localStorage.setItem(waterKey, String(next));
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
  const size = 100;
  const center = size / 2;
  const radius = 36;
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

  // ── Water glass section ──
  const glassW = 56;
  const glassH = 80;
  // Glass shape: slightly tapered, wider at top
  const glassTop = 6;
  const glassBot = 74;
  const glassTopLeft = 4;
  const glassTopRight = glassW - 4;
  const glassBotLeft = 10;
  const glassBotRight = glassW - 10;
  const glassInnerH = glassBot - glassTop;
  const fillH = (waterPct / 100) * glassInnerH;
  const fillY = glassBot - fillH;

  function WaterGlass() {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Glass + buttons row */}
        <div className="flex items-center gap-2">
          {/* Minus button */}
          <motion.button
            type="button"
            onClick={handleWaterRemove}
            disabled={waterFilled <= 0}
            whileTap={{ scale: 0.85 }}
            className="flex h-8 w-8 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-25 transition-opacity"
            aria-label="Rimuovi bicchiere"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>

          {/* Glass SVG */}
          <div className="relative">
            <svg width={glassW} height={glassH} viewBox={`0 0 ${glassW} ${glassH}`}>
              <defs>
                <clipPath id="glass-clip">
                  <polygon points={`${glassTopLeft},${glassTop} ${glassTopRight},${glassTop} ${glassBotRight},${glassBot} ${glassBotLeft},${glassBot}`} />
                </clipPath>
                <linearGradient id="water-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#3B8DD4" />
                  <stop offset="100%" stopColor="#7BC4E8" />
                </linearGradient>
              </defs>

              {/* Glass outline */}
              <polygon
                points={`${glassTopLeft},${glassTop} ${glassTopRight},${glassTop} ${glassBotRight},${glassBot} ${glassBotLeft},${glassBot}`}
                fill="none"
                stroke="rgba(74,155,217,0.25)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Water fill */}
              <g clipPath="url(#glass-clip)">
                <motion.rect
                  x="0"
                  width={glassW}
                  initial={{ height: 0, y: glassBot }}
                  animate={{ height: fillH, y: fillY }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  fill="url(#water-grad)"
                  opacity={0.8}
                />

                {/* Wave at water surface */}
                {waterPct > 0 && waterPct < 100 && (
                  <motion.path
                    initial={{ y: glassBot }}
                    animate={{ y: fillY - 2 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    d={`M0,3 Q${glassW * 0.25},0 ${glassW * 0.5},3 Q${glassW * 0.75},6 ${glassW},3 L${glassW},8 L0,8 Z`}
                    fill="url(#water-grad)"
                    opacity={0.8}
                  >
                    <animate
                      attributeName="d"
                      dur="2.5s"
                      repeatCount="indefinite"
                      values={`
                        M0,3 Q${glassW * 0.25},0 ${glassW * 0.5},3 Q${glassW * 0.75},6 ${glassW},3 L${glassW},8 L0,8 Z;
                        M0,3 Q${glassW * 0.25},6 ${glassW * 0.5},3 Q${glassW * 0.75},0 ${glassW},3 L${glassW},8 L0,8 Z;
                        M0,3 Q${glassW * 0.25},0 ${glassW * 0.5},3 Q${glassW * 0.75},6 ${glassW},3 L${glassW},8 L0,8 Z
                      `}
                    />
                  </motion.path>
                )}

                {/* Shine */}
                <rect
                  x={glassTopLeft + 3}
                  y={glassTop}
                  width="4"
                  height={glassInnerH}
                  rx="2"
                  fill="rgba(255,255,255,0.1)"
                />
              </g>

              {/* Bubbles when filling */}
              {waterPct > 0 && waterPct < 100 && (
                <g clipPath="url(#glass-clip)">
                  {[0, 1, 2].map((b) => (
                    <motion.circle
                      key={b}
                      cx={glassW * 0.3 + b * 10}
                      r="1.5"
                      fill="rgba(255,255,255,0.3)"
                      initial={{ cy: glassBot, opacity: 0 }}
                      animate={{
                        cy: [glassBot, fillY + 5],
                        opacity: [0, 0.4, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: b * 0.7,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Check when complete */}
              {waterComplete && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                >
                  <circle cx={glassW / 2} cy={glassH / 2} r="12" fill="rgba(45,159,143,0.9)" />
                  <polyline
                    points={`${glassW / 2 - 5},${glassH / 2} ${glassW / 2 - 1},${glassH / 2 + 4} ${glassW / 2 + 5},${glassH / 2 - 3}`}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.g>
              )}
            </svg>
          </div>

          {/* Plus button */}
          <motion.button
            type="button"
            onClick={handleWaterAdd}
            disabled={waterFilled >= WATER_GLASSES}
            whileTap={{ scale: 0.85 }}
            className="flex h-8 w-8 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-25 transition-opacity"
            aria-label="Aggiungi bicchiere"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center">
          <motion.span
            key={waterFilled}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold tabular-nums leading-none"
            style={{ color: waterComplete ? "#2D9F8F" : "#4A9BD9" }}
          >
            {waterFilled}/{WATER_GLASSES}
          </motion.span>
          <span className="text-[9px] text-foreground-muted/60 mt-0.5">
            bicchieri · {waterText}
          </span>
        </div>
      </div>
    );
  }

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
        <div className="flex items-stretch gap-0">
          {/* ── Left 50%: Donut + Macros ── */}
          <div className="flex-1 min-w-0 flex flex-col items-center gap-3 pr-4">
            {/* Donut chart */}
            <div
              className="relative cursor-pointer"
              onClick={handleDonutTap}
            >
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

            {/* Macro bars — full width of left half */}
            <div className="w-full space-y-1.5">
              {MACROS.map((macro, i) => {
                const grams = totals[macro.key];
                const pct = percentages[macro.key];
                if (pct <= 0) return null;
                const isActive = activeIndex === i;
                return (
                  <motion.div
                    key={macro.key}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{
                      opacity: activeIndex === null || isActive ? 1 : 0.4,
                      x: 0,
                    }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    className="cursor-pointer"
                    onClick={() => setActiveIndex(isActive ? null : i)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <div
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="text-[10px] font-semibold text-foreground truncate">
                          {macro.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] text-foreground-muted tabular-nums">
                          {grams}g
                        </span>
                        <span
                          className="text-[9px] font-bold tabular-nums"
                          style={{ color: macro.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: macro.color }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${pct}%`,
                          opacity: isActive ? 1 : 0.6,
                        }}
                        transition={{
                          width: { delay: 0.4 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3 },
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}

              <div className="flex items-center gap-1 pt-0.5">
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
                <span className="text-[9px] text-foreground-muted">
                  {completedMeals}/{meals.length} pasti
                </span>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          {dayLabel && <div className="w-px bg-white/10 self-stretch" />}

          {/* ── Right 50%: Water ── */}
          {dayLabel && (
            <div className="flex-1 min-w-0 flex items-center justify-center pl-4">
              <WaterGlass />
            </div>
          )}
        </div>
      ) : (
        <div>
          {meals.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
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

          {dayLabel && <WaterGlass />}
        </div>
      )}
    </motion.div>
  );
}
