"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const COLORS = ["#2D9F8F", "#E07254", "#4A8AC4", "#C9A033", "#B86B4F", "#3BB5A4", "#F4997F"];
const PARTICLE_COUNT = 35;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  dx: number;
  dy: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    dx: (Math.random() - 0.5) * 60,
    dy: -(30 + Math.random() * 50),
  }));
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles());
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
              animate={{
                x: p.dx * 4,
                y: p.dy * -2 + 200,
                opacity: 0,
                scale: 0.3,
                rotate: p.rotation + 360,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
