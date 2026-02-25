"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.replace("/auth/sign-in");
    }
  }, [session.isPending, session.data, router]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-[3px] border-primary/15" />
            <motion.div
              className="absolute inset-0 h-14 w-14 rounded-full border-[3px] border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
            >
              <div className="h-3 w-3 rounded-full bg-primary/40" />
            </motion.div>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm font-medium text-foreground-muted"
          >
            Caricamento...
          </motion.span>
        </motion.div>
      </div>
    );
  }

  if (!session.data) {
    return null;
  }

  return <>{children}</>;
}
