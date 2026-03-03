# Feedy

App di gestione dieta settimanale per pazienti e nutrizionisti. PWA mobile-first.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **DB:** Neon Postgres (serverless) + Drizzle ORM
- **Auth:** Neon Auth (`@neondatabase/auth`)
- **AI:** Groq SDK (llama-3.3-70b) per stima macro
- **UI:** Tailwind CSS 4, Motion (framer-motion), glassmorphism design
- **PWA:** Serwist

## Comandi

- `npm run dev` — dev server (HTTPS)
- `npm run build` — build produzione
- `npm run db:push` — push schema a Neon
- `npm run db:studio` — Drizzle Studio

## Struttura chiave

- `lib/db/schema.ts` — Schema Drizzle (diets, meals, userGoals, nutritionists, nutritionistPatients)
- `lib/db/create-diet.ts` — Logica condivisa creazione dieta + stima macro background
- `lib/auth/server.ts` — Auth server-side (Neon Auth)
- `lib/auth/nutritionist.ts` — Verifica ruolo nutrizionista
- `app/api/diets/` — CRUD diete paziente
- `app/api/nutritionist/` — API dashboard nutrizionista
- `app/(dashboard)/` — Pagine protette (AuthGuard)
- `components/` — Componenti riusabili (glass style)
- `types/index.ts` — Tipi condivisi

## Pattern auth

```typescript
const session = await auth.getSession();
if (!session?.data?.user) return 401;
// user ID: session.data.user.id
```

Per le API nutrizionista: `verifyNutritionist(session)` restituisce il record nutrizionista o null.

## Stile

Glassmorphism: classi `glass`, `glass-strong`, `glass-subtle`, `glass-input`. Animazioni con Motion. Testo italiano.

## Ruoli

- **Paziente:** utente standard, gestisce le proprie diete
- **Nutrizionista:** riga in tabella `nutritionists`, può caricare diete ai propri pazienti tramite `/nutrizionista`
