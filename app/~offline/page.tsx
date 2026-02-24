"use client";

export default function OfflinePage() {
  return (
    <div className="auth-gradient flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-foreground mb-2">Sei offline</h1>
        <p className="text-foreground-muted mb-8">
          Controlla la tua connessione internet e riprova.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
