"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

const GLASSES = 8;
const ML_PER_GLASS = 250;
const TARGET_ML = GLASSES * ML_PER_GLASS;

function getStorageKey(day: string): string {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekKey = weekStart.toISOString().slice(0, 10);
  return `water-${weekKey}-${day}`;
}

interface WaterTrackerCardProps {
  dayLabel: string;
}

export function WaterTrackerCard({ dayLabel }: WaterTrackerCardProps) {
  const [filled, setFilled] = useState(0);
  const storageKey = getStorageKey(dayLabel);

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

  const handleAdd = useCallback(() => {
    if (filled >= GLASSES) return;
    const next = filled + 1;
    setFilled(next);
    localStorage.setItem(storageKey, String(next));
  }, [filled, storageKey]);

  const handleRemove = useCallback(() => {
    if (filled <= 0) return;
    const next = filled - 1;
    setFilled(next);
    localStorage.setItem(storageKey, String(next));
  }, [filled, storageKey]);

  const ml = filled * ML_PER_GLASS;
  const pct = (ml / TARGET_ML) * 100;
  const isComplete = filled >= GLASSES;

  const mlText =
    ml >= 1000
      ? `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`
      : `${ml}ml`;

  // Glass geometry
  const gW = 60;
  const gH = 90;
  const topY = 6;
  const botY = 84;
  const tL = 4;
  const tR = gW - 4;
  const bL = 12;
  const bR = gW - 12;
  const innerH = botY - topY;
  const fillH = (pct / 100) * innerH;
  const fillY = botY - fillH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass rounded-2xl p-4 flex flex-col items-center gap-3"
    >
      {/* Glass + buttons */}
      <div className="flex items-center gap-3">
        {/* Minus */}
        <motion.button
          type="button"
          onClick={handleRemove}
          disabled={filled <= 0}
          whileTap={{ scale: 0.85 }}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-20 transition-opacity"
          aria-label="Rimuovi bicchiere"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>

        {/* Glass SVG */}
        <svg width={gW} height={gH} viewBox={`0 0 ${gW} ${gH}`}>
          <defs>
            <clipPath id="wglass-clip">
              <polygon points={`${tL},${topY} ${tR},${topY} ${bR},${botY} ${bL},${botY}`} />
            </clipPath>
            <linearGradient id="wglass-grad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#3B8DD4" />
              <stop offset="100%" stopColor="#7BC4E8" />
            </linearGradient>
          </defs>

          {/* Glass outline */}
          <polygon
            points={`${tL},${topY} ${tR},${topY} ${bR},${botY} ${bL},${botY}`}
            fill="none"
            stroke="rgba(74,155,217,0.25)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Water fill */}
          <g clipPath="url(#wglass-clip)">
            <motion.rect
              x="0"
              width={gW}
              initial={{ height: 0, y: botY }}
              animate={{ height: fillH, y: fillY }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              fill="url(#wglass-grad)"
              opacity={0.8}
            />

            {/* Wave */}
            {pct > 0 && pct < 100 && (
              <motion.path
                initial={{ y: botY }}
                animate={{ y: fillY - 2 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                d={`M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z`}
                fill="url(#wglass-grad)"
                opacity={0.8}
              >
                <animate
                  attributeName="d"
                  dur="2.5s"
                  repeatCount="indefinite"
                  values={`
                    M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z;
                    M0,3 Q${gW * 0.25},6 ${gW * 0.5},3 Q${gW * 0.75},0 ${gW},3 L${gW},8 L0,8 Z;
                    M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z
                  `}
                />
              </motion.path>
            )}

            {/* Shine */}
            <rect
              x={tL + 3}
              y={topY}
              width="4"
              height={innerH}
              rx="2"
              fill="rgba(255,255,255,0.1)"
            />

            {/* Bubbles */}
            {pct > 0 && pct < 100 && (
              <>
                {[0, 1, 2].map((b) => (
                  <motion.circle
                    key={b}
                    cx={gW * 0.3 + b * 10}
                    r="1.5"
                    fill="rgba(255,255,255,0.3)"
                    initial={{ cy: botY, opacity: 0 }}
                    animate={{
                      cy: [botY, fillY + 5],
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
              </>
            )}
          </g>

          {/* Check when complete */}
          {isComplete && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
            >
              <circle cx={gW / 2} cy={gH / 2} r="14" fill="rgba(45,159,143,0.9)" />
              <polyline
                points={`${gW / 2 - 6},${gH / 2} ${gW / 2 - 1},${gH / 2 + 5} ${gW / 2 + 6},${gH / 2 - 4}`}
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          )}
        </svg>

        {/* Plus */}
        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={filled >= GLASSES}
          whileTap={{ scale: 0.85 }}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-20 transition-opacity"
          aria-label="Aggiungi bicchiere"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      </div>

      {/* Counter */}
      <div className="flex flex-col items-center">
        <motion.span
          key={filled}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="text-base font-bold tabular-nums leading-none"
          style={{ color: isComplete ? "#2D9F8F" : "#4A9BD9" }}
        >
          {filled}/{GLASSES}
        </motion.span>
        <span className="text-[10px] text-foreground-muted/60 mt-0.5">
          bicchieri · {mlText}
        </span>
      </div>
    </motion.div>
  );
}
