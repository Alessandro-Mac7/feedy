"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { ScrollToTop } from "@/components/scroll-to-top";

const FEATURES = [
  {
    icon: "📋",
    title: "Importa il tuo piano",
    description: "Carica la dieta del tuo nutrizionista da CSV o JSON in un click.",
  },
  {
    icon: "🤖",
    title: "Stima AI dei macro",
    description: "L'intelligenza artificiale calcola carboidrati, grassi e proteine per te.",
  },
  {
    icon: "📊",
    title: "Macro giornalieri e settimanali",
    description: "Donut interattivo e statistiche settimanali per monitorare i tuoi progressi.",
  },
  {
    icon: "🛒",
    title: "Lista della spesa AI",
    description: "Genera la spesa automaticamente con prodotti di stagione e quantità stimate.",
  },
  {
    icon: "📅",
    title: "Gestione multi-dieta",
    description: "Carica più piani alimentari e attiva quello della settimana corrente.",
  },
  {
    icon: "💧",
    title: "Tracker acqua",
    description: "Segna i bicchieri d'acqua giornalieri e raggiungi il tuo obiettivo.",
  },
];

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
        <div className="glass rounded-xl p-2.5 flex flex-col items-center">
          <svg width="60" height="60" viewBox="0 0 70 70">
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
          <div className="flex gap-2 mt-1.5">
            {[
              { label: "C", val: "48%", color: "#4A8AC4" },
              { label: "G", val: "28%", color: "#C9A033" },
              { label: "P", val: "24%", color: "#B86B4F" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-[7px] font-bold" style={{ color: m.color }}>{m.label} {m.val}</span>
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
  {
    label: "Spesa intelligente",
    content: (
      <div className="space-y-2.5">
        <div className="glass-strong rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-sm">🛒</span>
          <div>
            <p className="text-[10px] font-semibold text-foreground">Lista della spesa AI</p>
            <p className="text-[8px] text-foreground-muted">Solo i giorni rimanenti</p>
          </div>
        </div>
        {[
          { cat: "🥬 Frutta e Verdura", items: ["Broccoli (di stagione)", "Finocchi", "Arance"] },
          { cat: "🥩 Carne e Pesce", items: ["Petto di pollo ~600g", "Merluzzo ~400g"] },
          { cat: "🌾 Cereali e Pane", items: ["Riso basmati 350g", "Pane integrale"] },
        ].map((g) => (
          <div key={g.cat} className="glass rounded-xl px-2.5 py-2">
            <p className="text-[8px] font-bold text-foreground-muted mb-1">{g.cat}</p>
            {g.items.map((item) => (
              <div key={item} className="flex items-center gap-1.5 py-0.5">
                <div className="h-1 w-1 rounded-full bg-primary/40" />
                <span className="text-[8px] text-foreground">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Macro settimanali",
    content: (
      <div className="space-y-2.5">
        <div className="glass-strong rounded-xl p-2.5 text-center">
          <p className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider mb-1">Media settimanale</p>
          <p className="text-lg font-bold text-foreground">1.847 <span className="text-[9px] font-normal text-foreground-muted">kcal/giorno</span></p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Carboidrati", val: "215g", pct: "48%", color: "#4A8AC4" },
            { label: "Grassi", val: "58g", pct: "28%", color: "#C9A033" },
            { label: "Proteine", val: "112g", pct: "24%", color: "#B86B4F" },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-2 text-center">
              <div className="h-1 rounded-full mb-1.5" style={{ backgroundColor: m.color }} />
              <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.val}</p>
              <p className="text-[7px] text-foreground-muted">{m.label}</p>
              <p className="text-[7px] font-semibold text-foreground-muted">{m.pct}</p>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl px-2.5 py-2">
          <p className="text-[8px] font-semibold text-foreground-muted mb-1.5">Trend giornaliero</p>
          <div className="flex items-end gap-1 h-8">
            {[65, 80, 55, 90, 70, 85, 75].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-primary/20 relative" style={{ height: `${h}%` }}>
                <div className="absolute inset-x-0 bottom-0 rounded-sm bg-primary" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
              <span key={i} className="text-[6px] text-foreground-muted/50 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

function ScreenshotCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPaused = useRef(false);
  const pauseTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const activeRef = useRef(0);

  // Keep a ref in sync so the interval always reads the latest value
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  /** Scroll so that card[index] is centered in the container */
  const scrollToCard = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  }, []);

  // Track active index from scroll position using actual card offsets
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const center = el.scrollLeft + el.offsetWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      setActiveIndex(closest);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-play: advance every 4s, pause on user interaction
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (isPaused.current) return;
      const next = (activeRef.current + 1) % SCREENSHOTS.length;
      scrollToCard(next);
    }, 4000);

    // Pause on touch/pointer, resume after 6s of inactivity
    const handleInteraction = () => {
      isPaused.current = true;
      clearTimeout(pauseTimeout.current);
      pauseTimeout.current = setTimeout(() => {
        isPaused.current = false;
      }, 6000);
    };

    el.addEventListener("touchstart", handleInteraction, { passive: true });
    el.addEventListener("pointerdown", handleInteraction);
    return () => {
      clearInterval(interval);
      clearTimeout(pauseTimeout.current);
      el.removeEventListener("touchstart", handleInteraction);
      el.removeEventListener("pointerdown", handleInteraction);
    };
  }, [scrollToCard]);

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
              className="w-[72%] shrink-0 snap-center flex flex-col"
            >
              <div
                className={`glass-strong rounded-[1.75rem] p-4 shadow-xl transition-all duration-300 overflow-hidden flex-1 flex flex-col ${
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
                <div className="flex-1">{screen.content}</div>
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
              className="rounded-2xl glass px-7 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-white/70 dark:hover:bg-white/15 active:scale-[0.97]"
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="glass rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/6 transition-shadow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-xl mb-3">
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
            <p className="text-foreground-muted text-sm max-w-[300px] mx-auto leading-relaxed">
              Tre passi per avere il tuo piano pasti sempre a portata di mano.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Carica la dieta",
                desc: "Importa il piano del tuo nutrizionista da CSV o JSON. Feedy organizza tutto in pasti giornalieri.",
              },
              {
                step: "02",
                title: "Segui il piano giorno per giorno",
                desc: "Ogni giorno vedi i tuoi pasti, completa quelli fatti e l'AI stima i macro automaticamente.",
              },
              {
                step: "03",
                title: "Fai la spesa e monitora",
                desc: "Genera la lista della spesa con AI, consulta i macro settimanali e tieni tutto sotto controllo.",
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
                className="flex items-start gap-4 rounded-2xl p-5 glass"
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

      <ScrollToTop />
    </div>
  );
}
