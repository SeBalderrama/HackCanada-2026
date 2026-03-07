# ClothesRent — Frontend

Peer-to-peer clothing rental & resale marketplace. Built with React + TypeScript + Vite, powered by Auth0, Cloudinary, Leaflet maps, and a custom Express backend.

---

## Architecture

```
clothesrent/ (Vite + React + TypeScript)
        │
        ├── Auth0          → Sign in / Sign up / User profile
        ├── Cloudinary     → Image hosting via backend upload
        ├── Leaflet        → Nearby rental map
        │
        └── Express Backend (localhost:5000)
              ├── MongoDB       → Listings, purchases, users
              ├── Cloudinary    → Server-side image upload
              ├── Backboard.io  → Vector style search (stub)
              └── Gemini AI     → Style keyword extraction (stub)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript 5.9 |
| Auth | Auth0 (`@auth0/auth0-react`) |
| Images | Cloudinary (`@cloudinary/react`, `@cloudinary/url-gen`) |
| Maps | Leaflet + react-leaflet |
| Backend API | Custom Express server (see `../backend/`) |

---

## Folder Structure

```
clothesrent/
├── public/                        # Static assets
├── src/
│   ├── api/
│   │   ├── client.ts              # API base URL + fetch helpers
│   │   └── listings.ts            # All backend API calls
│   │
│   ├── components/
│   │   ├── CloudinaryImage.tsx    # Cloudinary optimized image component
│   │   ├── ListingsPanel.tsx      # Seller's listings (CRUD, status toggle)
│   │   ├── TransactionsPanel.tsx  # Purchase history table
│   │   ├── ThriftOutPanel.tsx     # Browse & purchase live listings + search
│   │   ├── navBar.tsx             # Top navigation bar
│   │   └── uploadPhotoButton.tsx  # Direct-to-Cloudinary upload button
│   │
│   ├── pages/
│   │   ├── shopPage.tsx           # Seller dashboard (3-tab layout)
│   │   ├── shopPage.css           # Shop page styles
│   │   ├── sellerUploadPosting.tsx # Create new listing form
│   │   └── sellerUploadPosting.css
│   │
│   ├── types/
│   │   └── listing.ts             # Shared TypeScript types (Listing, Purchase)
│   │
│   ├── utils/
│   │   └── cloudinary.ts          # Cloudinary SDK init helper
│   │
│   ├── App.tsx                    # Router + all page components
│   ├── App.css                    # Global app styles
│   ├── main.tsx                   # Entry point (Auth0Provider + Navbar)
│   └── index.css                  # Base CSS variables & reset
│
├── .env.local                     # Environment variables (not committed)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## Pages & Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Hero product carousel + nearby rental map |
| `/shop` | `ShopPage` | Seller dashboard with 3 tabs |
| `/shop/new-listing` | `SellerUploadPosting` | Create a new listing form |
| `/signin` | `SignInPage` | Auth0 login / signup / profile |

---

## Features

### 1. Landing Page (`/`)

- **Product Carousel** — auto-scrolling marquee of featured rental items with hover-pause, manual arrow navigation, and "Reserve" overlay buttons
- **Nearby Rental Map** — Leaflet map centered on Toronto showing rental pickup points with circle markers and popup ETAs
- **Footer** — brand info, shop/help/brand link columns, social links

### 2. Seller Dashboard (`/shop`)

Three-tab sidebar layout:

#### Tab: My Listings (`ListingsPanel`)
- Fetches all seller listings from `GET /api/listings`
- Displays Cloudinary images, title, description, price, daily rate, tags
- Status badges: **Live** (green), **Draft** / **Paused** (grey), **Sold** (red)
- **Pause / Go Live** toggle button per listing
- **Delete** button with confirmation
- **Create Listing** link → `/shop/new-listing`
- Loading state, error state with retry, empty state

#### Tab: Transaction Log (`TransactionsPanel`)
- Fetches purchase records from `GET /api/purchases`
- Table view: image thumbnail, item title, price, buyer ID, date, tags
- Loading / error / empty states

#### Tab: Thrift Out (`ThriftOutPanel`)
- Fetches live listings from `GET /api/listings?status=Live`
- **Style search bar** — searches via `POST /api/style/search` (Backboard vector → MongoDB fallback)
- Clear button to reset to all live listings
- **Purchase button** per item — prompts for buyer ID, calls `POST /api/listings/:id/purchase`
- Prevents self-purchase and double-purchase (backend validated)
- Card layout with images, descriptions, prices, tags

### 3. Create Listing (`/shop/new-listing`)

- **Image upload** — selects a local file (jpg/png/webp), shows preview
- On submit, sends `multipart/form-data` to `POST /api/listings`:
  - Image file → uploaded to Cloudinary server-side
  - Title, description, price (required)
  - Daily rate, comma-separated tags (optional)
- Cloudinary auto-tags merged with user tags
- Success message with listing title + status
- Form resets on success

### 4. Sign In (`/signin`)

- Auth0-powered login and signup
- Displays user profile JSON when authenticated
- Logout button with redirect back to `/signin`

---

## API Layer (`src/api/`)

All backend communication is centralized in two files:

### `client.ts`

| Export | Description |
|--------|-------------|
| `API_BASE_URL` | Reads from `VITE_API_URL` env var, defaults to `http://localhost:5000` |
| `apiFetch<T>(path, options)` | JSON fetch with error extraction |
| `apiFormFetch<T>(path, formData)` | FormData POST (no Content-Type header — browser sets boundary) |

### `listings.ts`

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `fetchListings(status?)` | GET | `/api/listings` | Get all or filtered listings |
| `fetchListingById(id)` | GET | `/api/listings/:id` | Single listing |
| `createListing(formData)` | POST | `/api/listings` | Create with image upload |
| `updateListing(id, data)` | PUT | `/api/listings/:id` | Update fields |
| `deleteListing(id)` | DELETE | `/api/listings/:id` | Remove listing |
| `purchaseListing(id, buyerId)` | POST | `/api/listings/:id/purchase` | Purchase item |
| `searchListings(query)` | POST | `/api/style/search` | Style-based search |
| `fetchPurchases()` | GET | `/api/purchases` | All purchase records |

---

## Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `Navbar` | `navBar.tsx` | — | Top nav with brand, links, sign-in. Adds `scrolled` class on scroll |
| `CloudinaryImage` | `CloudinaryImage.tsx` | `publicId, alt, width, height, className` | Renders optimized Cloudinary image via `@cloudinary/react` |
| `UploadPhotoButton` | `uploadPhotoButton.tsx` | `onUploadSuccess, onUploadError, buttonLabel, uploadPreset` | Direct-to-Cloudinary browser upload with XHR progress bar |
| `ListingsPanel` | `ListingsPanel.tsx` | — | Seller's listing management (fetch, toggle status, delete) |
| `TransactionsPanel` | `TransactionsPanel.tsx` | — | Purchase history table |
| `ThriftOutPanel` | `ThriftOutPanel.tsx` | — | Browse live listings, search, purchase |

---

## Shared Types (`src/types/listing.ts`)

```typescript
type ListingStatus = "Draft" | "Live" | "Paused" | "Sold";

interface Listing {
  _id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  dailyRate: number;
  cloudinaryUrl: string;
  publicId: string;
  tags: string[];
  bbLink?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  _id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  purchaseDate: string;
  cloudinaryUrl: string;
  title: string;
  price: number;
  tags: string[];
}
```

---

## Prerequisites

- **Node.js** v18+
- **Backend running** at `http://localhost:5000` (see `../backend/README.md`)

---

## Setup

### 1. Install dependencies

```bash
cd clothesrent
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Optional — override backend URL (defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

### 3. Start the backend

```bash
cd ../backend
npm run dev
```

### 4. Start the frontend

```bash
cd ../clothesrent
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production Vite build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## Auth0 Configuration

| Setting | Value |
|---------|-------|
| Domain | `dev-b65r14eontgkyt0y.us.auth0.com` |
| Client ID | `0RjoItM0to13cLRHdYLdBCd61OyiavWk` |
| Redirect URI | `{origin}/signin` |
| Signup | Screen hint → `signup` |
| Logout | Returns to `/signin` |

---

## End-to-End Flow

### Seller creates a listing

```
1. Navigate to /shop → click "Create Listing"
2. Select image file (jpg/png/webp) → preview shown
3. Fill in title, description, price, optional daily rate & tags
4. Click "Create Listing"
5. Frontend sends multipart/form-data → POST /api/listings
6. Backend uploads image to Cloudinary → saves to MongoDB
7. Success message shown, form resets
8. Listing appears in "My Listings" tab
```

### Buyer purchases an item

```
1. Navigate to /shop → click "Thrift Out" tab
2. Browse live listings or search by style
3. Click "Purchase" on desired item
4. Enter buyer ID → POST /api/listings/:id/purchase
5. Backend creates UserItemBuy record, marks item "Sold"
6. Item removed from Thrift Out view
7. Appears in "Transaction Log" tab
```

### Style search

```
1. In "Thrift Out" tab, type style query (e.g. "minimalist oversized hoodie")
2. Press Enter or click Search
3. POST /api/style/search → Backboard vector search → MongoDB fallback
4. Results displayed as cards with images, prices, tags
5. Click "Clear" to return to all live listings
```
