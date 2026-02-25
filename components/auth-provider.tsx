"use client";

import { ToastProvider } from "@/components/toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
