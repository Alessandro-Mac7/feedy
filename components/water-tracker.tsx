"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

const GLASSES = 8;
const ML_PER_GLASS = 250;
const TARGET_ML = GLASSES * ML_PER_GLASS;

function getStorageKey(day: string): string {
  // Use the selected day label + current week identifier
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  const weekKey = weekStart.toISOString().slice(0, 10);
  return `water-${weekKey}-${day}`;
}

interface WaterTrackerProps {
  dayLabel: string;
}

export function WaterTracker({ dayLabel }: WaterTrackerProps) {
  const [filled, setFilled] = useState(0);
  const [lastTapped, setLastTapped] = useState<number | null>(null);

  const storageKey = getStorageKey(dayLabel);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 0 && val <= GLASSES) {
        setFilled(val);
      }
    } else {
      setFilled(0);
    }
  }, [storageKey]);

  const handleTap = useCallback(
    (index: number) => {
      const newFilled = index + 1 === filled ? index : index + 1;
      setFilled(newFilled);
      setLastTapped(index);
      localStorage.setItem(storageKey, String(newFilled));

      // Reset lastTapped after animation
      setTimeout(() => setLastTapped(null), 400);
    },
    [filled, storageKey]
  );

  const currentMl = filled * ML_PER_GLASS;
  const pct = Math.round((currentMl / TARGET_ML) * 100);
  const isComplete = filled >= GLASSES;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="glass rounded-2xl px-4 py-3.5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">💧</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Acqua
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={currentMl}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold tabular-nums"
            style={{ color: isComplete ? "#2D9F8F" : "#4A9BD9" }}
          >
            {currentMl >= 1000
              ? `${(currentMl / 1000).toFixed(currentMl % 1000 === 0 ? 0 : 1)}L`
              : `${currentMl}ml`}
          </motion.span>
          <span className="text-[10px] text-foreground-muted">/ 2L</span>
          {isComplete && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-xs"
            >
              ✓
            </motion.span>
          )}
        </div>
      </div>

      {/* Droplet grid */}
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: GLASSES }).map((_, i) => {
          const isFilled = i < filled;
          const isJustTapped = i === lastTapped;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTap(i)}
              className="flex-1 flex items-center justify-center py-1 min-h-[44px]"
              aria-label={`Bicchiere ${i + 1} di ${GLASSES}`}
            >
              <motion.svg
                width="28"
                height="34"
                viewBox="0 0 28 34"
                initial={false}
                animate={{
                  scale: isJustTapped ? [1, 1.3, 1] : 1,
                  y: isJustTapped ? [0, -4, 0] : 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Droplet shape */}
                <path
                  d="M14 2C14 2 4 14 4 21C4 26.5 8.5 31 14 31C19.5 31 24 26.5 24 21C24 14 14 2 14 2Z"
                  fill={isFilled ? "url(#water-fill)" : "rgba(255,255,255,0.15)"}
                  stroke={isFilled ? "#4A9BD9" : "rgba(255,255,255,0.25)"}
                  strokeWidth="1.5"
                />
                {/* Shine highlight on filled drops */}
                {isFilled && (
                  <motion.ellipse
                    cx="10"
                    cy="18"
                    rx="2.5"
                    ry="4"
                    fill="rgba(255,255,255,0.35)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    transform="rotate(-15 10 18)"
                  />
                )}
                <defs>
                  <linearGradient
                    id="water-fill"
                    x1="14"
                    y1="2"
                    x2="14"
                    y2="31"
                  >
                    <stop offset="0%" stopColor="#7BC4E8" />
                    <stop offset="100%" stopColor="#4A9BD9" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-2.5 h-1.5 rounded-full bg-white/15 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isComplete
              ? "linear-gradient(90deg, #2D9F8F, #3BB5A4)"
              : "linear-gradient(90deg, #7BC4E8, #4A9BD9)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}
