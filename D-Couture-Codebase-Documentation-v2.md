# D‑Couture Codebase Documentation (D-Couture-main)

This repository is a small full‑stack TypeScript app (Express + Vite/React) for an **AI-powered wardrobe + outfit curation** MVP.

It provides:
- A **Wardrobe** CRUD experience (“garments” stored in Postgres via Drizzle ORM).
- A **Today’s Look** generator that selects items and optionally calls an LLM for a brief stylist explanation.
- An **Outfits history** view + **feedback** capture.
- Optional “Replit AI Integrations” endpoints for generic chat + image generation.

---

## 1) Tech Stack

**Backend**
- Node.js + TypeScript
- Express (`server/index.ts`)
- Drizzle ORM + node-postgres (`server/db.ts`, `shared/schema.ts`)
- Zod for validation (`shared/schema.ts`, `shared/routes.ts`)
- OpenAI SDK (`openai`) for outfit explanation + image generation

**Frontend**
- Vite + React + TypeScript (`client/`)
- Routing: `wouter`
- Data fetching/state: TanStack React Query
- UI: shadcn/ui (Radix UI primitives) + TailwindCSS
- Animations: Framer Motion
- Icons: lucide-react

**Database**
- PostgreSQL
- Schema managed by Drizzle (`drizzle-kit push`)

---

## 2) Repository Layout

Top-level (key files only):

- `client/` — Vite/React front-end
  - `src/App.tsx` — routes + providers + layout shell
  - `src/pages/` — main screens (Home, Wardrobe, Outfits, Health)
  - `src/hooks/` — React Query hooks for API calls
  - `src/components/` — app components (cards, dialogs, navigation)

- `server/` — Express back-end
  - `index.ts` — server boot + middleware + static serve
  - `routes.ts` — API routes for garments/outfits/feedback (+ seed)
  - `db.ts` — Postgres pool + drizzle instance
  - `storage.ts` — DB-backed storage implementation (CRUD)
  - `seed_script.ts` — seed logic (invoked by `/api/seed`)
  - `static.ts`, `vite.ts` — dev/prod client serving helpers
  - `replit_integrations/` — optional chat/image endpoints

- `shared/` — shared types, schema, and route contracts
  - `schema.ts` — Drizzle tables + Zod insert schemas + TS types
  - `routes.ts` — API contract (paths, methods, zod input/response)

- `drizzle.config.ts` — drizzle-kit configuration
- `tailwind.config.ts`, `postcss.config.js` — styling
- `vite.config.ts` — Vite configuration

---

## 3) Environment Variables

Backend:
- `DATABASE_URL` (**required**)  
  Postgres connection string used by `server/db.ts` and drizzle-kit.
- `PORT` (optional, default `5000`)
- `NODE_ENV` (`development` / `production`)

OpenAI / Replit AI Integrations:
- `AI_INTEGRATIONS_OPENAI_API_KEY` (required if using LLM/image routes)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` (optional; used to point at a proxy or Replit integration endpoint)

Frontend (Vite):
- `VITE_CONCIERGE_NUMBER` (optional)  
  Displayed/used on Home for “text/WhatsApp concierge” UX.

---

## 4) Database Model (Postgres via Drizzle)

Defined in `shared/schema.ts`.

### 4.1 garments
Represents a single wardrobe item.

Key fields:
- `id` (serial, PK)
- `name` (text, required)
- `category` (text, required)  
  Comments suggest: `top`, `bottom`, `one-piece`, `shoes`, `outerwear`, `accessory`
- `colorFamily` (text, required)  
  e.g. `black`, `white`, `neutral`, `accent`, `other`
- `formality` (real, default 0.5)  
  Intended range 0.0–1.0 (enforced in Zod insert schema)
- `silhouette` (text, required)  
  e.g. `slim`, `regular`, `oversized`, `structured`
- `tags` (jsonb, required)  
  Freeform “style DNA” tags (exact shape depends on UI)
- `imageUrl` (text, optional)  
  URL for a user-supplied image (MVP can be text-only garments)
- `createdAt` (timestamp, default now)

### 4.2 outfits
Represents a generated outfit and its rationale.

Key fields:
- `id` (serial, PK)
- `items` (jsonb, required)  
  Array of garment IDs (selected items)
- `scoreBreakdown` (jsonb, required)  
  Object: `{ compatibility, context, novelty, total }`
- `explanation` (text, optional)  
  LLM-generated or fallback explanation
- `isElevated` (boolean, default false)
- `createdAt` (timestamp, default now)

### 4.3 feedback
Represents post-outfit reflection.

Key fields:
- `id` (serial, PK)
- `outfitId` (integer, required)
- `worn` (boolean, default true)
- `rating` (integer, optional)  (intended 1–5; validation is light in current code)
- `comments` (text, optional)
- `createdAt` (timestamp, default now)

---

## 5) API Contract (Shared Route Definitions)

Routes are defined in `shared/routes.ts` and implemented in `server/routes.ts`.
The shared file acts as a mini “typed OpenAPI”: it declares each endpoint’s method/path plus Zod input/response validators.

### 5.1 Garments

#### GET `/api/garments`
Returns all garments (newest first).

Response:
- `200`: `Garment[]`

#### POST `/api/garments`
Creates a garment.

Body:
- `insertGarmentSchema` (derived from Drizzle, with `formality` coerced to number and constrained 0–1)

Response:
- `201`: created `Garment`
- `400`: validation error

#### PUT `/api/garments/:id`
Updates a garment.

Body:
- partial `insertGarmentSchema` (server uses `.partial()`)

Response:
- `200`: updated `Garment`
- `404`: not found
- `400`: validation error

#### DELETE `/api/garments/:id`
Deletes a garment.

Response:
- `204` on success
- `404` if missing

---

### 5.2 Outfits

#### GET `/api/outfits`
Returns outfit history (newest first).

Response:
- `200`: `Outfit[]`

#### GET `/api/outfits/:id`
Returns a single outfit by id.

Response:
- `200`: `Outfit`
- `404`: not found

#### POST `/api/outfits/generate`
Generates a new outfit.

Body:
- `{ context?: string }`  (called `GenerateOutfitRequest` in `shared/schema.ts`)

Behavior (current logic in `server/routes.ts` using `server/outfitAlgorithm.ts`):
1. Fetch all garments.
2. Build an `OutfitIntent` from `context` (e.g., `work`, `date`, `weekend`, `formal`), which sets:
   - `targetFormality` and `formalityTolerance`
   - statement-piece limits
   - whether “oversized + oversized” combos are allowed
   - preferred color families
3. Generate outfit candidates by **structured sampling** (not brute-force):
   - Try `one-piece`-anchored looks first (dress + shoes/outerwear/accessory if available).
   - Try `top + bottom` combinations (and add shoes/outerwear/accessory if available).
4. Score each candidate with a **weighted compatibility model**:
   - `context`: how close average outfit formality is to the intent’s `targetFormality`
   - `compatibility`: blend of:
     - color harmony (`black/white/neutral` behave as anchors; statement-piece count is controlled)
     - silhouette balance (penalizes oversized+oversized unless the intent allows it; rewards structure for formal contexts)
     - season coherence (if the request or future UI sets a season)
   - `novelty`: currently a placeholder constant (future upgrade: based on outfit history to avoid repeats)
   - `total`: weighted blend of `compatibility`, `context`, and `novelty`
   - `details`: includes sub-scores like `formality`, `color`, `silhouette`, `season` for debugging and UI explanations
5. Select the best candidate:
   - Picks the top-scoring option.
   - If multiple candidates are within a small margin (≈0.03), it picks deterministically using a **daily seed** (stable UX: results feel curated, not random).
6. Safety fallbacks (prevents “no outfit” cases):
   - If the wardrobe is sparse or lacks core categories (no `top+bottom` and no `one-piece`), constraints relax and the system still returns a reasonable bundle.
   - As an absolute fallback, returns any two distinct items (so the endpoint never crashes and the UI stays responsive).
7. Generate a brief stylist explanation using the OpenAI chat completion integration.
   - If the LLM call fails, uses a simple fallback explanation string.

Notes:
- `scoreBreakdown` and `isElevated` are saved with the outfit record for later UI display and analytics.

6. Persist outfit to DB and return it.

Response:
- `201`: created `Outfit`
- `400`: not enough garments
- `500`: generation failure

**Note:** The generator is intentionally naive; it’s a stub that can be replaced with a rules engine or a learned ranking model later.

---

### 5.3 Feedback

#### POST `/api/feedback`
Creates feedback for an outfit.

Body:
- `insertFeedbackSchema`

Response:
- `201`: created `Feedback`
- `400`: validation error

---

### 5.4 Seed (dev utility)

#### POST `/api/seed`
Creates initial data using `server/seed_script.ts`.

Intended for:
- Quick demos without manually entering garments.

---

## 6) Replit Integrations (Optional APIs)

Located under `server/replit_integrations/`.

### 6.1 Chat integration
Adds conversation management + message endpoints (used for generic “chat” features, not central to the wardrobe MVP).

Routes (see `server/replit_integrations/chat/routes.ts`):
- `GET /api/conversations`
- `POST /api/conversations`
- `DELETE /api/conversations/:id`
- plus message routes (see file for full list)

Backed by `chatStorage` (`server/replit_integrations/chat/storage.ts`).

### 6.2 Image generation
Route:
- `POST /api/generate-image`
Body: `{ prompt: string, size?: string }`
Calls `openai.images.generate({ model: "gpt-image-1", ... })` and returns `url` and/or `b64_json`.

---

## 7) Frontend Screens & Data Flow

### 7.1 App shell & routing
- `client/src/App.tsx` wires:
  - React Query provider
  - Navigation
  - Routes:
    - `/` → Home
    - `/wardrobe` → Wardrobe
    - `/outfits` → Outfits
    - `/health` → Health
    - `*` → NotFound

Routing is via `wouter` (lightweight router).

### 7.2 Home (`pages/Home.tsx`)
- Brand-forward landing experience.
- Shows feature teasers, the “Begin Experience” interaction, and optional concierge number (via `VITE_CONCIERGE_NUMBER`).

### 7.3 Wardrobe (`pages/Wardrobe.tsx`)
- Fetches garments using `useGarments()` (React Query).
- Allows:
  - Search/filter by category
  - Create garment via `CreateGarmentDialog`
  - Display garments using `GarmentCard`

### 7.4 Outfits (`pages/Outfits.tsx`)
- Fetches:
  - outfits history via `useOutfits()`
  - garments for hydration/display context
- Displays:
  - explanation text
  - score breakdown (progress bar)
  - feedback entry via `useFeedback()` flow

### 7.5 Health (`pages/Health.tsx`)
- “Aesthetic health” style screen (UX feature, not medical).
- Uses outfits/feedback trends for a reflective dashboard vibe (implementation specifics in file).

---

## 8) Storage Layer (Server)

`server/storage.ts` defines:
- `IStorage` interface for garments/outfits/feedback
- `DatabaseStorage` implementation using Drizzle queries

This indirection is useful if you later want:
- a mock/in-memory storage (for tests)
- a caching layer
- multi-tenant data separation

---

## 9) Build, Run, and Deploy

### 9.1 Install
```bash
npm install
```

### 9.2 Configure environment
Set `DATABASE_URL`. If using LLM/image routes, also set the OpenAI integration vars.

### 9.3 Initialize DB schema
```bash
npm run db:push
```

### 9.4 Run dev server
```bash
npm run dev
```
This runs the Express server in dev mode (which also serves the Vite client).

### 9.5 Production build + start
```bash
npm run build
npm start
```
Build uses `script/build.ts` to produce a `dist/` bundle and then starts `dist/index.cjs`.

---

## 10) Notes, Quirks, and Extension Points

### 10.1 Outfit generation is a stub (by design)
Right now:
- item selection is random with minimal category logic
- scoring fields are placeholders

Upgrade paths:
- Add deterministic rules (color harmony, silhouette balance, formality matching)
- Add “occasion/context” filters
- Add a learned ranker later (pairwise ranking from feedback)
- Use “capsule wardrobe” constraints (avoid repeats, enforce coverage)

### 10.2 Shared route contract is a major asset
Because `shared/routes.ts` contains Zod schemas for inputs and outputs, you can:
- validate server responses consistently
- generate an OpenAPI spec later if you want
- keep client/server in lockstep as the API evolves

### 10.3 Authentication is present in dependencies but not currently wired
The repo includes `passport` and `passport-local`, but the MVP routes shown are not gated behind auth yet.
If you plan to add accounts, sessions, and per-user wardrobes:
- add `users` table
- attach `userId` FK columns to garments/outfits/feedback
- require session auth for writes/reads

### 10.4 Image URLs vs “text-only garments”
Schema supports `imageUrl`, but the product direction you described (“garment inputs should be regular text”) is compatible:
- keep `imageUrl` optional
- later add upload/integration as a separate feature

---

## 11) Quick Reference

### Commands
- `npm run dev` — run server in dev
- `npm run build` — build for production
- `npm start` — start production server
- `npm run check` — TypeScript typecheck
- `npm run db:push` — push schema to DB

### Key Files
- `shared/schema.ts` — database + types
- `shared/routes.ts` — API contract
- `server/routes.ts` — API implementation
- `client/src/hooks/*` — client API calls

---

## 12) Suggested Next Documentation Artifacts

If you want “big-co” style docs next, the natural additions are:
- A sequence diagram for **Generate Outfit**
- A formal API reference page (OpenAPI-ish)
- A data dictionary & evolution plan (v0→v1 schemas)
- “How to add a new garment attribute end-to-end” guide

