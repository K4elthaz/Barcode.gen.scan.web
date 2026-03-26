# Project Documentation

## Project Name
Barcode.gen.scan.web (package name: ricohforumn)

## Overview
This project is a React + TypeScript inventory management web application with barcode generation and scanning, category and supplier management, and an audit trail view.

Primary capabilities:
- Login with Firebase Authentication
- Inventory item creation with barcode generation
- Inventory listing with barcode print/delete actions
- Barcode scanning using camera and BarcodeDetector API
- Category and supplier CRUD flows
- Audit trail listing with location context
- Map-based item location selection using Leaflet

## Tech Stack
- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS, shadcn/ui (Radix UI primitives), Lucide icons
- Routing: React Router DOM
- Backend services: Firebase Auth, Realtime Database, Firebase Storage
- Barcode: jsbarcode, barcode-detector, html5-qrcode
- Maps/Geolocation: Leaflet, React Leaflet, Google Geocoding API calls

## Scripts
From package.json:
- npm run dev: Start development server
- npm run build: Type-check and build
- npm run lint: Run ESLint
- npm run preview: Preview production build

## Top-Level Structure
- public: Static files and images
- src: Application source code
- components.json: shadcn/ui configuration
- tailwind.config.js, postcss.config.cjs: styling config
- tsconfig*.json: TypeScript config
- vite.config.ts: Vite config with alias @ -> src
- vercel.json: SPA rewrite for client-side routing

## Application Flow
1. App bootstraps in src/main.tsx.
2. src/App.tsx sets Router, ThemeProvider, ToastProvider, and routes.
3. / goes to login screen.
4. /main renders shared layout (sidebar + header) and nested feature pages.

## Routing
Defined in src/App.tsx:
- / -> Login
- /main -> Main layout
- /main (index) -> Dashboard (inventory)
- /main/scanbarcode -> Barcode scanner page
- /main/users -> Users page
- /main/category -> Category page
- /main/supplier -> Supplier page
- /main/auditTrail -> Audit trail page

## Source Directory Breakdown

### src/Pages
- Login.tsx: Login page wrapper.
- main-page.tsx: Main app shell with sidebar and nested outlet.

### src/components
Core layout/navigation:
- app-sidebar.tsx
- header.tsx
- nav-main.tsx
- nav-user.tsx
- app-logo.tsx
- theme-provider.tsx
- theme-toggle.tsx

Feature modules:
- Dashboard/
  - dashboard.tsx
  - DashboardComponents/inventory-dashbaord.tsx
  - DashboardComponents/add-item-dialog.tsx
  - DashboardComponents/inventory-table.tsx
  - DashboardComponents/barcode-display.tsx
- Scan Barcode/
  - ScanBarcode.tsx
  - ScannerComponents/barcode-scanner.tsx
  - ScannerComponents/scanned-items-table.tsx
- Category/
  - category.tsx
  - Dialog/create-category.tsx
  - Table/category-list.tsx
- Supplier/
  - supplier.tsx
  - Dialog/add-supplier.tsx
  - Table/supplier-list.tsx
- AuditTrail/
  - auditTrail.tsx
  - Table/auditTrailList.tsx
- Users/
  - users.tsx
- Map-selector.tsx: Leaflet map picker for item coordinates.

### src/components/ui
Reusable shadcn/Radix-based UI primitives:
alert, avatar, breadcrumb, button, card, collapsible, dialog, dropdown-menu, input, label, scroll-area, select, separator, sheet, sidebar, skeleton, table, toast, toaster, tooltip.

### src/services
- category-services.ts: Create/list/duplicate-check categories in Firebase.
- suppliers-services.ts: Create/list/duplicate-check suppliers in Firebase.
- auditTrail-services.ts: Fetch and flatten audit trail records.

### src/lib
- firebase.ts: Firebase app initialization and exports for auth/database/storage.
- types.ts: InventoryItem interface.
- utils.ts: Utility helpers (className merge helper).

### src/types
- category.ts: Category/inventory related interfaces.
- suppliers.ts: Supplier interface.

### src/hooks
- use-toast.ts: Toast state/action hook.
- use-mobile.tsx: Mobile breakpoint hook.

### src/constants
- nav.ts: Sidebar navigation items and user display metadata.

### src/utils
- geocode.ts: Reverse geocoding helper from latitude/longitude.

## Data Layer
Firebase usage:
- Auth: Email/password login
- Realtime Database nodes used by app:
  - Items
  - categories
  - suppliers
  - AuditTrail
- Storage buckets paths used by app:
  - barcode-images/
  - item-images/
  - categories/
  - suppliers/

Common operations:
- Read/listen: ref, onValue
- Create: push + set
- Delete: remove
- Upload files: uploadBytes + getDownloadURL

## Core Feature Data Flows

### Inventory create
1. User opens Add Item dialog.
2. Form captures product details, category, pricing, quantity, supplier info, status, user, location.
3. Barcode is generated, rendered to SVG, uploaded to Firebase Storage.
4. Item image is uploaded to Storage.
5. Location is reverse-geocoded.
6. Item is pushed into Realtime Database under Items.
7. Dashboard listener updates table in real time.

### Inventory list and actions
- Dashboard subscribes to Items and maps snapshot to table rows.
- Each row renders barcode, location text, and action buttons:
  - Delete item from DB
  - Print barcode in new window

### Barcode scanning
1. User starts scanner.
2. Camera stream opens (secure context required).
3. BarcodeDetector scans frames.
4. Found barcode is queried against Items by barcodeId.
5. Match is appended to scanned items table with timestamp.
6. Manual barcode entry is available when needed.

### Category and supplier management
- Create dialogs submit form data and image files.
- Duplicate checks run before create.
- Tables are backed by live Firebase listeners.

### Audit trail
- Service reads nested AuditTrail records from DB.
- Table paginates and displays user/item/location-related fields.

## Configuration and Deployment
- Alias @ resolves to src in vite.config.ts.
- Vercel rewrite routes all paths to / for SPA navigation.
- Firebase values are loaded via VITE_FIREBASE_* environment variables.

## Notable Risks and Improvement Opportunities
- geocode.ts contains a hardcoded Google Maps API key. This should be moved to environment variables and restricted.
- No route guard is enforced in routing; authenticated route protection can be strengthened.
- Reverse geocoding is called per item and may become expensive with large datasets.
- Users page is currently placeholder-level.
- Naming inconsistencies exist (for example inventory-dashbaord.tsx).

## Quick Start
1. Install dependencies:
   npm install
2. Configure environment variables for Firebase (and geocoding key if externalized).
3. Run development server:
   npm run dev
4. Build for production:
   npm run build

## Full File Inventory (Current)

Root files:
- .gitattributes
- .gitignore
- components.json
- eslint.config.js
- index.html
- package-lock.json
- package.json
- postcss.config.cjs
- README.md
- tailwind.config.js
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vercel.json
- vite.config.ts

Public:
- public/2.png
- public/3.png
- public/vite.svg

Source files:
- src/App.css
- src/App.tsx
- src/index.css
- src/main.tsx
- src/vite-env.d.ts
- src/assets/react.svg
- src/components/app-logo.tsx
- src/components/app-sidebar.tsx
- src/components/header.tsx
- src/components/Map-selector.tsx
- src/components/nav-main.tsx
- src/components/nav-user.tsx
- src/components/theme-provider.tsx
- src/components/theme-toggle.tsx
- src/components/AuditTrail/auditTrail.tsx
- src/components/AuditTrail/Table/auditTrailList.tsx
- src/components/Category/category.tsx
- src/components/Category/Dialog/create-category.tsx
- src/components/Category/Table/category-list.tsx
- src/components/Dashboard/dashboard.tsx
- src/components/Dashboard/DashboardComponents/add-item-dialog.tsx
- src/components/Dashboard/DashboardComponents/barcode-display.tsx
- src/components/Dashboard/DashboardComponents/inventory-dashbaord.tsx
- src/components/Dashboard/DashboardComponents/inventory-table.tsx
- src/components/Login/login-form.tsx
- src/components/Scan Barcode/ScanBarcode.tsx
- src/components/Scan Barcode/ScannerComponents/barcode-scanner.tsx
- src/components/Scan Barcode/ScannerComponents/scanned-items-table.tsx
- src/components/Supplier/supplier.tsx
- src/components/Supplier/Dialog/add-supplier.tsx
- src/components/Supplier/Table/supplier-list.tsx
- src/components/ui/alert.tsx
- src/components/ui/avatar.tsx
- src/components/ui/breadcrumb.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/collapsible.tsx
- src/components/ui/dialog.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/scroll-area.tsx
- src/components/ui/select.tsx
- src/components/ui/separator.tsx
- src/components/ui/sheet.tsx
- src/components/ui/sidebar.tsx
- src/components/ui/skeleton.tsx
- src/components/ui/table.tsx
- src/components/ui/toast.tsx
- src/components/ui/toaster.tsx
- src/components/ui/tooltip.tsx
- src/components/Users/users.tsx
- src/constants/nav.ts
- src/hooks/use-mobile.tsx
- src/hooks/use-toast.ts
- src/lib/firebase.ts
- src/lib/types.ts
- src/lib/utils.ts
- src/Pages/Login.tsx
- src/Pages/main-page.tsx
- src/services/auditTrail-services.ts
- src/services/category-services.ts
- src/services/suppliers-services.ts
- src/types/category.ts
- src/types/suppliers.ts
- src/utils/geocode.ts
