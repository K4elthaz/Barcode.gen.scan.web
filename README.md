# Barcode.gen.scan.web

Inventory Management with Barcode Scanner and Generator

A **React 19 + TypeScript + Vite** web app for tracking inventory with QR codes — generate barcodes for items, scan them with a device camera, and manage categories, suppliers, and an audit trail.

---

## Prerequisites

- **Node.js 18+** (Vite 6 requirement). LTS 20 or 22 is recommended. Check your version:
  ```bash
  node -v   # e.g. v20.x
  npm -v
  ```
- **A Firebase project** (Authentication, Realtime Database, and Cloud Storage).
- **A Supabase project** (used for item/category/supplier image uploads).
- Optional: **a Google Maps API key** for reverse-geocoding item locations.

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Barcode.gen.scan.web
```

### 2. Install dependencies

```bash
npm install
```

---

## Configure environment variables

The app reads configuration from `.env.local` (Vite loads `.env.local` automatically). A template with every variable is provided in [`.env.example`](.env.example).

1. **Create your env file**:

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values**:

   ### Firebase — Authentication + Realtime Database + Storage
   From your Firebase console → **Project settings → General** → *Your apps* / *SDK setup*:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL` (from **Realtime Database → Data**; looks like `https://<project-id>-default-rtdb.firebaseio.com`)
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

   Enable **Email/Password** sign-in under **Authentication → Sign-in method** (the app logs in via `signInWithEmailAndPassword`).

   ### Supabase — image storage
   From your Supabase project → **Project Settings → API**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Create a public storage bucket named **`item-images`**.

   ### Optional — Google Geocoding
   - `VITE_GOOGLE_MAPS_API_KEY` — reverse-geocodes item coordinates to human-readable addresses. If omitted, the app falls back to coordinate text / an alternative geocoder.

> ⚠️ Never commit real secrets. `.env.local` is git-ignored — only `.env.example` lives in the repo.

---

## Backend setup summary

| Data | Where it lives |
|------|----------------|
| Items, categories, suppliers, audit trail | Supabase **Postgres** (`public.items`, `public.categories`, `public.suppliers`, `public.audit_trails`) |
| Authentication (email/password) | Firebase **Authentication** |
| QR code stickers (SVG→PNG) | Supabase **Storage** (`item-images/barcode-images/`) |
| Item / category / supplier images | Supabase **Storage** (`item-images/` bucket) |

Database tables are created by running [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. That script enables RLS with public (anon-key) access — swap the policies for authenticated-only rules before production.

Firebase is used **only for authentication** (email/password sign-in). All records and object storage live on Supabase.

---

## Running locally

Start the Vite dev server:

```bash
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`). Sign in with a Firebase user to reach the dashboard.

> **Camera scanning note:** QR scanning uses the native **BarcodeDetector API**, which is only available in Chromium-based browsers (Chrome/Edge) over a **secure context** (HTTPS or localhost). On other browsers the scanner automatically offers **manual code entry** as a fallback.

---

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |

---

## Project structure (top level)

```
public/                  Static images (login illustrations)
src/
  Pages/                 Login, main app shell
  components/            Layout, feature modules, shadcn/Radix UI primitives
  components/Dashboard/  Inventory dashboard, Add Item dialog, inventory table
  components/Scan Barcode/ Camera scanner + scanned-items table
  components/Category|Supplier|AuditTrail|Users/
  lib/                   firebase.ts, supabase.ts, shared types
  services/              Firebase data-access helpers
  utils/                 Geocoding helpers
  constants/ hooks/ types/
.env.example             Environment variable template
vite.config.ts           Vite config (alias @ → src)
```

Routing (`src/App.tsx`): `/` → login, `/main` → protected shell with
**dashboard** (index), **scanbarcode**, **users**, **category**, **supplier**, **auditTrail**.

---

## Troubleshooting

- **`npm run dev` doesn't start** → install fails or Node too old; confirm `node -v` ≥ 18.
- **Blank screen / "Root element not found"** → `.env.local` is missing or incomplete; the app cannot initialize Firebase/Supabase without it.
- **Camera scanner shows "Barcode detection is not supported"** → browser lacks `BarcodeDetector` (e.g. Safari/Firefox). Use Chrome/Edge, or use manual entry.
- **Image uploads fail** → Supabase `item-images` bucket doesn't exist or anon key can't write to it.
- **Sign-in fails** → confirm Email/Password auth is enabled in Firebase and the user account exists.

Full technical detail is in [`PROJECT.md`](PROJECT.md).