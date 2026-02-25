import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { AuthGuard } from "@/components/auth-guard";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="mx-auto min-h-screen max-w-lg md:max-w-2xl">
        <OfflineBanner />
        <main className="px-5 pt-2 pb-28">{children}</main>
        <div
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-28"
          style={{
            background:
              "linear-gradient(to top, var(--background) 30%, transparent 100%)",
          }}
        />
        <BottomNav />
        <OnboardingWrapper />
      </div>
    </AuthGuard>
  );
}
