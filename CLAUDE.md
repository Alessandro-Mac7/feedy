# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- `npm run dev` — dev server HTTPS (`--experimental-https`, richiede i certificati in `certificates/`)
- `npm run build` — build produzione, forza `--webpack` (non Turbopack; il `turbopack: {}` vuoto in `next.config.ts` serve solo a silenziare un warning in dev)
- `npm run lint` — ESLint
- `npm run db:generate` — genera migrazioni Drizzle da `lib/db/schema.ts`
- `npm run db:push` — push diretto dello schema a Neon (senza file di migrazione)
- `npm run db:studio` — Drizzle Studio
- `npx tsx scripts/seed-nutritionist.ts <email> <nome>` — promuove un utente già registrato a nutrizionista (unico modo per creare un nutrizionista, non esiste UI per questo)

Non esiste una test suite nel repo.

## Variabili d'ambiente

Richieste in `.env.local`: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `JWKS_URL`, `GROQ_API_KEY`.

## Struttura chiave

- `lib/db/schema.ts` — Schema Drizzle (diets, meals, userGoals, nutritionists, nutritionistPatients, familyShares)
- `lib/db/create-diet.ts` — Logica condivisa creazione dieta + stima macro background
- `lib/db/auth-users.ts` — Unico punto di accesso a `neon_auth.user` (lookup per email, ricerca, subquery nome/email): non scrivere query raw su quella tabella altrove, estendi questo modulo
- `lib/auth/server.ts` — Auth server-side (Neon Auth)
- `lib/auth/nutritionist.ts` — Verifica ruolo nutrizionista
- `lib/parsers/csv.ts` — Parser CSV/JSON per import dieta
- `lib/hooks/use-pending-requests.ts` — Hook condiviso per liste "richiesta da confermare/rifiutare" (nutrizionista↔paziente, family share)
- `lib/hooks/use-user-search.ts` — Hook condiviso per la ricerca utenti con debounce (usato da ogni flusso di invito)
- `components/association-row.tsx`, `components/request-banner.tsx`, `components/user-search-field.tsx` — Building block condivisi delle liste "persona collegata" e dei flussi di invito; non duplicare questo markup per una nuova relazione persona-persona, estendi questi componenti
- `app/api/diets/` — CRUD diete paziente
- `app/api/nutritionist/` — API dashboard nutrizionista
- `app/api/family/` — API sharing familiare (vedi sotto)
- `app/(dashboard)/` — Pagine paziente (AuthGuard + PatientGuard)
- `app/(nutritionist)/` — Pagine nutrizionista (AuthGuard + guard di ruolo inline nel layout)
- `components/` — Componenti riusabili (glass style)
- `types/index.ts` — Tipi condivisi, incluse le costanti `DAYS`/`MEAL_TYPES`

## Autorizzazione: guard client-side + enforcement nelle API

Non esiste `middleware.ts`: la separazione tra area paziente e area nutrizionista è solo client-side.

- `AuthGuard` (`components/auth-guard.tsx`) legge `authClient.useSession()` e redirige a `/auth/sign-in` se non autenticato.
- `PatientGuard` (area `(dashboard)`) e `NutritionistGuard` (inline in `app/(nutritionist)/layout.tsx`) chiamano `GET /api/nutritionist/me` per sapere se l'utente è nutrizionista, e si rimbalzano a vicenda (`/nutrizionista` ↔ `/oggi`) se si trovano nella route group sbagliata.
- Questi guard sono solo UX: il controllo che conta è dentro ogni handler API, tramite `verifyNutritionist(session)` (`lib/auth/nutritionist.ts`) o il confronto diretto `diets.userId === session.data.user.id`. Non fidarsi mai del guard client-side come unico controllo quando si aggiunge una nuova API.

## Modello dati e regole di dominio

- `diets.createdBy` (nullable) distingue le diete create dal paziente stesso da quelle create da un nutrizionista. Un paziente non può eliminare (`DELETE /api/diets/[id]`) una dieta con `createdBy` valorizzato.
- `meals.day` e `meals.mealType` sono vincolati da CHECK constraint Postgres sui valori italiani (Lunedì…Domenica, Colazione…Cena). Gli stessi valori esistono come `DAYS`/`MEAL_TYPES` in `types/index.ts` e nei parser CSV/JSON: se cambi uno, aggiorna anche gli altri.
- `nutritionistPatients.confirmed` implementa un flusso di conferma: il nutrizionista aggiunge un paziente per email, ma non può leggere/creare/modificare diete finché il paziente non conferma da `PATCH /api/patient/nutritionist?action=confirm`. Quasi tutte le API sotto `app/api/nutritionist/patients/[id]/` ripetono questo controllo `patient.confirmed`.
- Per modificare/eliminare una dieta esistente, il nutrizionista deve anche essere l'autore (`diets.createdBy === nutritionist.userId`); la duplicazione invece è permessa su qualsiasi dieta del paziente.
- Neon Auth gestisce gli utenti in uno schema Postgres separato (`neon_auth.user`), fuori da Drizzle. Ogni accesso (lookup per email, ricerca, arricchimento nome/email) passa da `lib/db/auth-users.ts` (`findUserByEmail`, `searchUsers`, `authUserNameSql`/`authUserEmailSql`) — non scrivere query raw dirette su `neon_auth.user` in una route.

### Family sharing

`familyShares` è lo stesso pattern invito+conferma di `nutritionistPatients`, ma peer-to-peer (nessun ruolo speciale): `ownerUserId` condivide la propria dieta con `memberUserId`, che deve confermare (`PATCH /api/family/shared-with-me`) prima di poterla vedere. `GET /api/family/[ownerId]/diet` restituisce la dieta attiva del titolare in sola lettura, verificando che esista una condivisione confermata. Lato UI, `app/(dashboard)/oggi/page.tsx` mostra uno switcher persona che cambia la sorgente dati; in modalità "vista di un'altra persona" (`readOnly`) `MealCard` disabilita check-off/stima AI e vengono nascosti water tracker e lista della spesa (dati/azioni specifici del proprio account).

### Skill Alexa (`app/api/alexa/`, `lib/alexa/`)

Skill custom "Feedy" hostata come web service (`POST /api/alexa/skill`), non su Lambda: ogni richiesta viene verificata con `alexa-verifier` (certificato + firma + timestamp sull'header `signature`/`signaturecertchainurl` e sul raw body) prima di essere processata — non rimuovere questo controllo. Il collegamento account non usa OAuth: `alexaLinkCodes` genera un codice numerico monouso (10 minuti) da `/api/alexa/link-code` (mostrato in Impostazioni tramite `AlexaLinkCard`), l'utente lo pronuncia una volta ad Alexa (`LinkAccountIntent`) e viene salvato in `alexaLinks` come `alexaUserId → userId`. Gli intent di lettura pasti (`lib/alexa/handlers.ts`) riusano la stessa logica "dieta attiva del giorno" di `lib/utils.ts` e, per le richieste su un familiare, la tabella `familyShares` già esistente — non serve che ogni familiare colleghi il proprio account Alexa, basta che abbia condiviso la dieta con chi parla. Il modello di interazione da incollare nella Alexa Developer Console è in `alexa/interaction-model-it-IT.json`.

## Creazione dieta e stima AI

`createDietWithMeals()` (`lib/db/create-diet.ts`) è condivisa tra il flusso paziente (`app/api/diets`) e quello nutrizionista (`app/api/nutritionist/patients/[id]/diets`). Dopo l'insert, lancia in background con `after()` di Next.js la stima dei macro mancanti tramite Groq (`lib/groq/estimate.ts`), con retry (max 2 tentativi per pasto) e caching in-memory per stessa lista alimenti; i pasti stimati vengono marcati `isAiEstimated: true`.

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
- **Nutrizionista:** riga in tabella `nutritionists`, può caricare diete ai propri pazienti tramite `/nutrizionista`, ma solo dopo conferma del paziente (vedi sopra)
