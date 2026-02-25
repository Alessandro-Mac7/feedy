"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

const FEATURES = [
  {
    icon: "📋",
    title: "Importa il tuo piano",
    description: "Carica la dieta del tuo nutrizionista da CSV in un click.",
  },
  {
    icon: "🤖",
    title: "Stima AI dei macro",
    description: "Calcola carboidrati, grassi e proteine automaticamente.",
  },
  {
    icon: "📊",
    title: "Donut interattivo",
    description: "Tocca il grafico per esplorare le % di ogni macronutriente.",
  },
  {
    icon: "💧",
    title: "Tracker acqua",
    description: "Monitora i tuoi 2L giornalieri con una colonna animata.",
  },
  {
    icon: "✏️",
    title: "Modifica libera",
    description: "Aggiungi, modifica ed elimina pasti come vuoi.",
  },
];

const DAYS_PREVIEW = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function FloatingCard({
  children,
  className,
  delay = 0,
  y = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 + y }}
      animate={{ opacity: 1, y }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SCREENSHOTS = [
  {
    label: "Piano giornaliero",
    content: (
      <div className="space-y-2.5">
        {/* Day tabs */}
        <div className="flex justify-center gap-1">
          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
            <div key={i} className={`rounded-lg px-2 py-1 text-[9px] font-semibold ${i === 2 ? "bg-primary text-white" : "text-foreground-muted/40"}`}>{d}</div>
          ))}
        </div>
        {/* Summary */}
        <div className="glass-strong rounded-xl px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm text-foreground">Mercoledì</p>
            <span className="text-[8px] font-semibold text-foreground-muted">3/5 pasti</span>
          </div>
        </div>
        {/* Meals */}
        {[
          { emoji: "☕", name: "Colazione", food: "Yogurt greco, muesli" },
          { emoji: "🥗", name: "Pranzo", food: "Insalata di quinoa" },
          { emoji: "🍎", name: "Spuntino", food: "Mela e mandorle" },
        ].map((m) => (
          <div key={m.name} className="glass rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{m.emoji}</span>
              <div>
                <p className="text-[10px] font-semibold text-foreground">{m.name}</p>
                <p className="text-[8px] text-foreground-muted">{m.food}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Macro & Acqua",
    content: (
      <div className="space-y-2.5">
        {/* Donut */}
        <div className="glass rounded-xl p-3 flex flex-col items-center">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="26" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
            <circle cx="35" cy="35" r="26" fill="none" stroke="#4A8AC4" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26 * 0.46} ${2 * Math.PI * 26 * 0.54}`}
              transform="rotate(-90 35 35)" />
            <circle cx="35" cy="35" r="26" fill="none" stroke="#C9A033" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26 * 0.26} ${2 * Math.PI * 26 * 0.74}`}
              strokeDashoffset={`${-(2 * Math.PI * 26 * 0.48)}`}
              transform="rotate(-90 35 35)" />
            <circle cx="35" cy="35" r="26" fill="none" stroke="#B86B4F" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26 * 0.22} ${2 * Math.PI * 26 * 0.78}`}
              strokeDashoffset={`${-(2 * Math.PI * 26 * 0.76)}`}
              transform="rotate(-90 35 35)" />
            <text x="35" y="33" textAnchor="middle" className="text-[11px] font-bold fill-foreground">1.847</text>
            <text x="35" y="42" textAnchor="middle" className="text-[7px] fill-foreground-muted">kcal</text>
          </svg>
          <div className="flex gap-3 mt-2">
            {[
              { label: "Carb", val: "48%", color: "#4A8AC4" },
              { label: "Grassi", val: "28%", color: "#C9A033" },
              { label: "Prot", val: "24%", color: "#B86B4F" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-[8px] font-semibold text-foreground">{m.label}</span>
                <span className="text-[8px] font-bold" style={{ color: m.color }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Water */}
        <div className="glass rounded-xl p-3 flex flex-col items-center gap-2">
          <span className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">💧 Drink Tracker</span>
          <div className="flex items-center gap-3">
            <svg width="24" height="40" viewBox="0 0 24 40">
              <polygon points="2,2 22,2 19,38 5,38" fill="rgba(74,155,217,0.04)" stroke="rgba(74,155,217,0.25)" strokeWidth="1" strokeLinejoin="round" />
              <polygon points="5,14 19,14 19,38 5,38" fill="rgba(74,155,217,0.3)" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#4A9BD9" }}>6/8</p>
              <p className="text-[8px] text-foreground-muted">bicchieri</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Stima AI",
    content: (
      <div className="space-y-2.5">
        <div className="glass rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🥗</span>
            <div>
              <p className="text-[10px] font-semibold text-foreground">Pranzo</p>
              <p className="text-[8px] text-foreground-muted">Insalata di quinoa con avocado</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[7px] font-bold text-violet-600">🤖 AI</span>
            <span className="text-[8px] text-foreground-muted">Macro stimati</span>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-md bg-[#4A8AC4]/10 px-2 py-1 text-[9px] font-bold text-[#4A8AC4]">C 52g</span>
            <span className="rounded-md bg-[#C9A033]/10 px-2 py-1 text-[9px] font-bold text-[#C9A033]">G 18g</span>
            <span className="rounded-md bg-[#B86B4F]/10 px-2 py-1 text-[9px] font-bold text-[#B86B4F]">P 24g</span>
          </div>
        </div>
        <div className="glass rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🍝</span>
            <div>
              <p className="text-[10px] font-semibold text-foreground">Cena</p>
              <p className="text-[8px] text-foreground-muted">Pasta integrale al pomodoro</p>
            </div>
          </div>
          <button className="glass-subtle rounded-lg px-3 py-1.5 text-[8px] font-semibold text-primary w-full">
            ✨ Stima Macro con AI
          </button>
        </div>
        <div className="glass-subtle rounded-xl p-3 text-center">
          <p className="text-[9px] text-foreground-muted leading-relaxed">
            L&apos;AI analizza la descrizione del pasto e stima i valori nutrizionali in pochi secondi.
          </p>
        </div>
      </div>
    ),
  },
  {
    label: "Gestione diete",
    content: (
      <div className="space-y-2.5">
        <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider px-1">Le tue diete</p>
        {[
          { name: "Dieta Mediterranea", period: "10 Feb – 10 Mar", active: true, meals: 35 },
          { name: "Low Carb Autunno", period: "1 Set – 30 Set", active: false, meals: 28 },
        ].map((d) => (
          <div key={d.name} className={`rounded-xl p-3 ${d.active ? "glass-strong border-primary/20" : "glass"}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-foreground">{d.name}</p>
              {d.active && (
                <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[7px] font-bold text-primary">ATTIVA</span>
              )}
            </div>
            <p className="text-[8px] text-foreground-muted">{d.period}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[8px] text-foreground-muted">🍽️ {d.meals} pasti</span>
            </div>
          </div>
        ))}
        <div className="glass-subtle rounded-xl p-3 flex items-center justify-center gap-1.5 border border-dashed border-primary/20">
          <span className="text-primary text-sm">+</span>
          <span className="text-[9px] font-semibold text-primary">Carica nuova dieta</span>
        </div>
      </div>
    ),
  },
];

function ScreenshotCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth * 0.72;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, SCREENSHOTS.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative pb-24">
      <div className="mx-auto max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-3xl text-foreground mb-3">
            Scopri l&apos;app
          </h2>
          <p className="text-foreground-muted text-sm max-w-[300px] mx-auto leading-relaxed">
            Scorri per esplorare le schermate principali di Feedy.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-[14%] snap-x snap-mandatory pb-2"
        >
          {SCREENSHOTS.map((screen, i) => (
            <div
              key={screen.label}
              className="w-[72%] shrink-0 snap-center"
            >
              <div
                className={`glass-strong rounded-[1.75rem] p-5 shadow-xl transition-all duration-300 ${
                  activeIndex === i
                    ? "shadow-primary/10 scale-100"
                    : "shadow-primary/4 scale-[0.96] opacity-60"
                }`}
              >
                {/* Mock phone header */}
                <div className="mb-3 flex items-center justify-between text-[9px] text-foreground-muted/50">
                  <span className="font-semibold">9:41</span>
                  <div className="flex gap-1">
                    <div className="h-1 w-2.5 rounded-sm bg-foreground-muted/25" />
                    <div className="h-1 w-2.5 rounded-sm bg-foreground-muted/25" />
                    <div className="h-1 w-2.5 rounded-sm bg-foreground-muted/25" />
                  </div>
                </div>
                {screen.content}
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-foreground-muted">
                {screen.label}
              </p>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-5">
          {SCREENSHOTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-primary/20"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  const session = authClient.useSession();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  useEffect(() => {
    if (!session.isPending && session.data) {
      router.replace("/oggi");
    }
  }, [session.isPending, session.data, router]);

  if (session.isPending || session.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="h-14 w-14 rounded-full border-[3px] border-primary/15" />
          <motion.div
            className="absolute inset-0 h-14 w-14 rounded-full border-[3px] border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-20 pt-12"
      >
        {/* Content */}
        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/logo.png"
              alt="Feedy"
              width={200}
              height={73}
              priority
              className="mb-2"
            />
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.5rem] leading-[1.1] tracking-tight text-foreground sm:text-5xl"
          >
            Il tuo piano pasti,{" "}
            <span className="relative">
              sempre con te
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] origin-left rounded-full bg-accent/50"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-[340px] text-base leading-relaxed text-foreground-muted"
          >
            Importa la dieta del nutrizionista, traccia i macro giornalieri e scopri cosa mangiare — tutto in una app.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex items-center gap-3"
          >
            <Link
              href="/auth/sign-up"
              className="group relative rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:bg-primary-light active:scale-[0.97]"
            >
              <span className="relative z-10">Inizia gratis</span>
            </Link>
            <Link
              href="/auth/sign-in"
              className="rounded-2xl glass px-7 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-white/70 active:scale-[0.97]"
            >
              Accedi
            </Link>
          </motion.div>

          {/* Social proof hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-5 text-xs text-foreground-muted/50"
          >
            Gratuito per sempre — nessuna carta richiesta
          </motion.p>
        </div>

        {/* Floating preview cards — staggered around hero */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <FloatingCard
            delay={0.7}
            y={-5}
            className="absolute top-[18%] right-[5%] rotate-3"
          >
            <div className="glass-strong rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥗</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Pranzo</p>
                  <p className="text-[10px] text-foreground-muted">Insalata di quinoa</p>
                </div>
              </div>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-lg bg-[#4A8AC4]/12 px-1.5 py-0.5 text-[9px] font-bold text-[#4A8AC4]">C 45g</span>
                <span className="rounded-lg bg-[#C9A033]/12 px-1.5 py-0.5 text-[9px] font-bold text-[#C9A033]">G 12g</span>
                <span className="rounded-lg bg-[#B86B4F]/12 px-1.5 py-0.5 text-[9px] font-bold text-[#B86B4F]">P 28g</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            delay={0.9}
            y={8}
            className="absolute bottom-[25%] left-[3%] -rotate-2"
          >
            <div className="glass rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">💧</span>
                <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Acqua</p>
              </div>
              <p className="text-lg font-bold tabular-nums" style={{ color: "#4A9BD9" }}>1.5L <span className="text-[10px] text-foreground-muted font-normal">/ 2L</span></p>
            </div>
          </FloatingCard>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted/40">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── PREVIEW MOCKUP ── */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-[2rem] p-5 shadow-2xl shadow-primary/8"
          >
            {/* Mock status bar */}
            <div className="mb-4 flex items-center justify-between text-[10px] text-foreground-muted/60">
              <span className="font-semibold">9:41</span>
              <div className="flex gap-1">
                <div className="h-1.5 w-3 rounded-sm bg-foreground-muted/30" />
                <div className="h-1.5 w-3 rounded-sm bg-foreground-muted/30" />
                <div className="h-1.5 w-3 rounded-sm bg-foreground-muted/30" />
              </div>
            </div>

            {/* Day tabs mini */}
            <div className="mb-4 flex justify-center gap-1">
              {DAYS_PREVIEW.map((d, i) => (
                <div
                  key={d}
                  className={`rounded-xl px-2.5 py-1.5 text-[10px] font-semibold transition-all ${
                    i === 2
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-foreground-muted/50"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Summary bar — matches DailySummaryCard */}
            <div className="glass-strong rounded-2xl px-4 py-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg text-foreground">Mercoledì</p>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-0.5">
                      {[true, true, true, false, false].map((f, i) => (
                        <div key={i} className={`h-1.5 w-1.5 rounded-full border border-white/40 ${f ? "bg-primary" : "bg-white/25"}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-semibold text-foreground-muted tabular-nums">3/5</span>
                  </div>
                </div>
                <span className="glass-subtle rounded-lg px-2 py-0.5 text-[9px] font-semibold text-foreground-muted">
                  Dieta Mediterranea
                </span>
              </div>
            </div>

            {/* 2-column grid: Donut + Water — matches app layout */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Donut card */}
              <div className="glass rounded-xl p-3 flex flex-col items-center gap-2">
                <div className="relative">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#4A8AC4" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22 * 0.46} ${2 * Math.PI * 22 * 0.54}`}
                      transform="rotate(-90 30 30)" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#C9A033" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22 * 0.26} ${2 * Math.PI * 22 * 0.74}`}
                      strokeDashoffset={`${-(2 * Math.PI * 22 * 0.48)}`}
                      transform="rotate(-90 30 30)" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#B86B4F" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22 * 0.22} ${2 * Math.PI * 22 * 0.78}`}
                      strokeDashoffset={`${-(2 * Math.PI * 22 * 0.76)}`}
                      transform="rotate(-90 30 30)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-foreground">1.847</span>
                    <span className="text-[7px] text-foreground-muted">kcal</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  {[
                    { label: "Carb", g: "210g", pct: "48%", color: "#4A8AC4" },
                    { label: "Grassi", g: "58g", pct: "28%", color: "#C9A033" },
                    { label: "Prot", g: "92g", pct: "24%", color: "#B86B4F" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="text-[8px] font-semibold text-foreground">{m.label}</span>
                      <span className="text-[8px] text-foreground-muted tabular-nums">{m.g}</span>
                      <span className="text-[7px] font-bold tabular-nums" style={{ color: m.color }}>{m.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water tracker card */}
              <div className="glass rounded-xl p-3 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs">💧</span>
                  <span className="text-[8px] font-semibold text-foreground-muted uppercase tracking-wider">Drink Tracker</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-foreground-muted/40">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                  <svg width="28" height="48" viewBox="0 0 28 48">
                    <defs>
                      <clipPath id="mock-glass-clip">
                        <polygon points="2,2 26,2 22,46 6,46" />
                      </clipPath>
                      <linearGradient id="mock-glass-grad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#3B8DD4" />
                        <stop offset="100%" stopColor="#7BC4E8" />
                      </linearGradient>
                    </defs>
                    <polygon points="2,2 26,2 22,46 6,46" fill="rgba(74,155,217,0.04)" stroke="rgba(74,155,217,0.2)" strokeWidth="1" strokeLinejoin="round" />
                    <g clipPath="url(#mock-glass-clip)">
                      <rect x="0" y="16" width="28" height="32" fill="url(#mock-glass-grad)" opacity="0.8" />
                    </g>
                  </svg>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-foreground-muted/40">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold tabular-nums" style={{ color: "#4A9BD9" }}>6/8</span>
                  <span className="text-[8px] text-foreground-muted/60">bicchieri · 1.5L</span>
                </div>
              </div>
            </div>

            {/* Meal cards mini — matches MealCard component */}
            {[
              { emoji: "☕", type: "Colazione", food: "Yogurt greco, muesli, mirtilli", highlight: false, ai: true, macros: { c: 45, g: 12, p: 28 } },
              { emoji: "🥗", type: "Pranzo", food: "Insalata di quinoa con avocado", highlight: true, ai: false, macros: null },
              { emoji: "🍎", type: "Spuntino", food: "Mela e mandorle", highlight: false, ai: false, macros: null },
            ].map((m) => (
              <div
                key={m.type}
                className={`rounded-2xl p-3 mb-2 ${m.highlight ? "glass-accent" : "glass"}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${m.highlight ? "bg-accent/12" : "bg-white/40"}`}>
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground">{m.type}</p>
                      {m.highlight && (
                        <span className="flex items-center gap-0.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[7px] font-bold text-accent uppercase tracking-wider pulse-glow">
                          <span className="h-1 w-1 rounded-full bg-accent" />
                          Ora
                        </span>
                      )}
                      {m.ai && (
                        <span className="rounded-full bg-violet-500/10 px-1 py-0.5 text-[7px] font-bold text-violet-600">AI</span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground-muted truncate mt-0.5">{m.food}</p>
                    {m.macros && (
                      <div className="flex gap-1 mt-1.5">
                        <span className="rounded-md bg-[#4A8AC4]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#4A8AC4]">C {m.macros.c}g</span>
                        <span className="rounded-md bg-[#C9A033]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#C9A033]">G {m.macros.g}g</span>
                        <span className="rounded-md bg-[#B86B4F]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#B86B4F]">P {m.macros.p}g</span>
                      </div>
                    )}
                    {!m.macros && !m.highlight && (
                      <div className="mt-1.5">
                        <span className="glass-subtle rounded-lg px-2 py-1 text-[8px] font-semibold text-primary">Stima Macro con AI</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-3xl text-foreground mb-3">
              Tutto ciò che serve
            </h2>
            <p className="text-foreground-muted text-sm max-w-[300px] mx-auto leading-relaxed">
              Semplice da usare, potente sotto il cofano. Feedy ti accompagna ogni giorno.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`glass rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/6 transition-shadow ${
                  i === FEATURES.length - 1 && FEATURES.length % 2 !== 0
                    ? "col-span-2 max-w-[65%] mx-auto"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 text-xl mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT CAROUSEL ── */}
      <ScreenshotCarousel />

      {/* ── HOW IT WORKS ── */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-3xl text-foreground mb-3">
              Come funziona
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Carica la dieta",
                desc: "Esporta il piano del nutrizionista in CSV e caricalo su Feedy.",
                accent: false,
              },
              {
                step: "02",
                title: "Consulta ogni giorno",
                desc: "Apri l'app e vedi subito cosa mangiare — il pasto corrente è in evidenza.",
                accent: false,
              },
              {
                step: "03",
                title: "Traccia i macro",
                desc: "Lascia che l'AI stimi i valori nutrizionali o inseriscili manualmente.",
                accent: false,
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex items-start gap-4 rounded-2xl p-5 ${
                  s.accent ? "glass-accent" : "glass"
                }`}
              >
                <span className="shrink-0 font-display text-3xl text-primary/25 leading-none select-none">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-lg glass-strong rounded-3xl p-8 text-center shadow-xl shadow-primary/6"
        >
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">
            Pronto a iniziare?
          </h2>
          <p className="text-sm text-foreground-muted mb-6 max-w-[260px] mx-auto leading-relaxed">
            Crea il tuo account in pochi secondi e carica il tuo primo piano pasti.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-block rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary-light transition-all active:scale-[0.97]"
          >
            Crea account gratuito
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-xs text-foreground-muted/40">
            Feedy v0.1.0 — Fatto con cura in Italia
          </p>
          <Link
            href="/privacy"
            className="inline-block text-xs text-foreground-muted/40 hover:text-primary transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </section>
    </div>
  );
}
