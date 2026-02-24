import Image from "next/image";
import { AuthView } from "@neondatabase/auth/react/ui";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  return (
    <div className="auth-gradient flex min-h-screen flex-col items-center justify-center px-4">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-2/3 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/3 -top-10 h-40 w-40 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative z-10 mb-8 text-center">
        <Image
          src="/logo.png"
          alt="Feedy"
          width={200}
          height={200}
          className="mx-auto"
          priority
        />
        <p className="mt-1 text-sm text-foreground-muted">
          Il tuo piano pasti settimanale
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm glass rounded-3xl p-6">
        <AuthView path={path.join("/")} />
      </div>

      <p className="relative z-10 mt-6 text-xs text-foreground-muted/50">
        v0.1.0
      </p>
    </div>
  );
}
