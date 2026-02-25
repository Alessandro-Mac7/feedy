"use client";

import { useEffect } from "react";
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
    title: "Riepilogo giornaliero",
    description: "Visualizza calorie e macro con grafici animati.",
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
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 top-[10%] h-[500px] w-[500px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(45,159,143,0.25) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-24 top-[30%] h-[400px] w-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(59,181,164,0.22) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[20%] bottom-[5%] h-[350px] w-[350px] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, rgba(224,114,84,0.15) 0%, transparent 70%)" }}
          />
        </div>

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
              <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider mb-1">Oggi</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">1.847</p>
              <p className="text-[10px] text-foreground-muted">kcal tracciate</p>
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

            {/* Summary mock */}
            <div className="glass rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display text-lg text-foreground">Mercoledì</p>
                <span className="glass-subtle rounded-lg px-2 py-0.5 text-[9px] font-semibold text-foreground-muted">
                  Dieta Mediterranea
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none" stroke="var(--primary)" strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * 0.28}`}
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-foreground">1.847</span>
                    <span className="text-[8px] text-foreground-muted">kcal</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#4A8AC4] w-6">Carb</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[65%] rounded-full bg-[#4A8AC4]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#4A8AC4] w-8 text-right">210g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#C9A033] w-6">Grassi</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[45%] rounded-full bg-[#C9A033]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#C9A033] w-8 text-right">58g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#B86B4F] w-6">Prot</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[55%] rounded-full bg-[#B86B4F]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#B86B4F] w-8 text-right">92g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal cards mini */}
            {[
              { emoji: "☕", type: "Colazione", food: "Yogurt greco, muesli, mirtilli", highlight: false },
              { emoji: "🥗", type: "Pranzo", food: "Insalata di quinoa con avocado", highlight: true },
              { emoji: "🍎", type: "Spuntino", food: "Mela e mandorle", highlight: false },
            ].map((m) => (
              <div
                key={m.type}
                className={`rounded-xl p-3 mb-2 ${m.highlight ? "glass-accent" : "glass-subtle"}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/40 text-sm">
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground">{m.type}</p>
                      {m.highlight && (
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[8px] font-bold text-accent pulse-glow">
                          Ora
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground-muted truncate">{m.food}</p>
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
                className="glass rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/6 transition-shadow"
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
                accent: true,
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
        <div className="mt-12 text-center">
          <p className="text-xs text-foreground-muted/40">
            Feedy v0.1.0 — Fatto con cura in Italia
          </p>
        </div>
      </section>
    </div>
  );
}
