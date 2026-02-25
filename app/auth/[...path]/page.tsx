"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/components/toast";

type AuthMode = "sign-in" | "sign-up";

export default function AuthPage() {
  const params = useParams<{ path: string[] }>();
  const initialMode: AuthMode = params.path?.[0] === "sign-up" ? "sign-up" : "sign-in";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "sign-in") {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) {
          toast(translateError(error.message ?? "Errore durante l'accesso"), "error");
        } else {
          toast("Bentornato!", "success");
          router.replace("/oggi");
        }
      } else {
        if (!name.trim()) {
          toast("Inserisci il tuo nome", "error");
          setLoading(false);
          return;
        }
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name.trim(),
        });
        if (error) {
          toast(translateError(error.message ?? "Errore durante la registrazione"), "error");
        } else {
          toast("Account creato! Benvenuto!", "success");
          router.replace("/oggi");
        }
      }
    } catch {
      toast("Errore di connessione. Riprova.", "error");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
    setPassword("");
    setPrivacyAccepted(false);
  }

  return (
    <div className="auth-gradient flex min-h-screen flex-col items-center justify-center px-4">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-2/3 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/3 -top-10 h-40 w-40 rounded-full bg-accent/6 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mb-8 text-center"
      >
        <Image
          src="/logo.png"
          alt="Feedy"
          width={180}
          height={65}
          className="mx-auto"
          priority
        />
        <p className="text-sm text-foreground-muted">
          Il tuo piano pasti settimanale
        </p>
      </motion.div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass rounded-3xl p-6">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-2xl bg-white/20 p-1">
            <button
              type="button"
              onClick={() => mode !== "sign-in" && switchMode()}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === "sign-in"
                  ? "bg-white/70 text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => mode !== "sign-up" && switchMode()}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === "sign-up"
                  ? "bg-white/70 text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Registrati
            </button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "sign-up" ? 15 : -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "sign-up" ? -15 : 15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name field (sign-up only) */}
              {mode === "sign-up" && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome"
                    required
                    autoComplete="name"
                    className="glass-input w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 outline-none"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.it"
                  required
                  autoComplete="email"
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "sign-up" ? "Minimo 8 caratteri" : "La tua password"}
                    required
                    minLength={mode === "sign-up" ? 8 : undefined}
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    className="glass-input w-full rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-foreground-muted/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted/60 hover:text-foreground-muted transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy checkbox (sign-up only) */}
              {mode === "sign-up" && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/30 accent-primary"
                  />
                  <span className="text-xs text-foreground-muted leading-relaxed">
                    Accetto la{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-semibold text-primary hover:text-primary-light transition-colors underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (mode === "sign-up" && !privacyAccepted)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    {mode === "sign-in" ? "Accesso..." : "Registrazione..."}
                  </span>
                ) : (
                  mode === "sign-in" ? "Accedi" : "Crea account"
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Bottom link */}
        <p className="mt-5 text-center text-sm text-foreground-muted">
          {mode === "sign-in" ? (
            <>
              Non hai un account?{" "}
              <button onClick={switchMode} className="font-semibold text-primary hover:text-primary-light transition-colors">
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai già un account?{" "}
              <button onClick={switchMode} className="font-semibold text-primary hover:text-primary-light transition-colors">
                Accedi
              </button>
            </>
          )}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-8 text-xs text-foreground-muted/40"
      >
        v0.1.0
      </motion.p>
    </div>
  );
}

function translateError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid email or password") || lower.includes("invalid credentials"))
    return "Email o password non validi";
  if (lower.includes("user already exists") || lower.includes("already registered"))
    return "Questa email è già registrata";
  if (lower.includes("password") && lower.includes("short"))
    return "La password deve avere almeno 8 caratteri";
  if (lower.includes("email") && lower.includes("invalid"))
    return "Indirizzo email non valido";
  if (lower.includes("too many requests") || lower.includes("rate limit"))
    return "Troppi tentativi. Riprova tra poco.";
  return message;
}
