# ClothesRent Backend

Express + TypeScript REST API powering the ClothesRent platform — a peer-to-peer clothing rental marketplace.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Image Hosting | Cloudinary |
| AI Style Analysis | Google Gemini API |
| Vector Search | Backboard.io |

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Mongoose connection
│   │   └── cloudinary.ts        # Cloudinary config loader
│   │
│   ├── controllers/
│   │   ├── listingController.ts # CRUD for clothing listings
│   │   └── styleController.ts   # AI style analysis + search
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts    # Auth0 JWT middleware (reserved)
│   │
│   ├── models/
│   │   ├── User.ts              # Mongoose User schema
│   │   └── Listing.ts           # Mongoose Listing schema
│   │
│   ├── routes/
│   │   ├── listingRoutes.ts     # /api/listings routes
│   │   └── styleRoutes.ts       # /api/style routes
│   │
│   ├── services/
│   │   ├── geminiService.ts     # Google Gemini integration
│   │   ├── cloudinaryService.ts # Cloudinary upload helpers
│   │   └── backboardService.ts  # Backboard vector search
│   │
│   ├── types/
│   │   └── index.ts             # Shared TypeScript interfaces
│   │
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Entry point (DB connect + listen)
│
├── .env                         # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

- Node.js v18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster
- (Optional) Cloudinary account for image uploads
- (Optional) Google Gemini API key for AI style analysis

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0

# Optional — needed for Cloudinary server-side upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional — needed for Gemini AI analysis
GEMINI_API_URL=https://generativelanguage.googleapis.com/...
GEMINI_API_KEY=your_gemini_key
```

> **Important:** If your MongoDB password contains special characters, URL-encode them.  
> Example: `p@ss!word` → `p%40ss%21word`

### 3. MongoDB Atlas — allow network access

In your Atlas dashboard go to **Network Access** and add `0.0.0.0/0` to allow connections from any IP (or restrict to your server's IP in production).

---

## Running the Server

### Development (hot-reload)

```bash
npm run dev
```

### Production build

```bash
npm run build   # compiles TypeScript → dist/
npm start       # runs dist/server.js
```

---

## API Reference

Base URL: `http://localhost:5000`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns `{ status: "ok" }` |

---

### Listings `/api/listings`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all listings (newest first) |
| GET | `/api/listings/:id` | Get a single listing by ID |
| POST | `/api/listings` | Create a new listing |
| PUT | `/api/listings/:id` | Update a listing |
| DELETE | `/api/listings/:id` | Delete a listing |

#### POST `/api/listings` — Request Body

```json
{
  "title": "Obsidian Trench",
  "description": "Minimalist oversized trench coat in black wool blend.",
  "size": "M",
  "imageUrl": "https://res.cloudinary.com/.../your-image.jpg",
  "publicId": "clothesrent/abc123",
  "cloudinaryTags": ["trench", "outerwear"],
  "price": 485,
  "dailyRate": 28
}
```

#### Listing Response Shape

```json
{
  "_id": "64f...",
  "title": "Obsidian Trench",
  "description": "...",
  "size": "M",
  "imageUrl": "...",
  "publicId": "...",
  "images": ["..."],
  "cloudinaryTags": ["trench", "outerwear"],
  "geminiKeywords": [],
  "price": 485,
  "dailyRate": 28,
  "status": "Draft",
  "views": 0,
  "createdAt": "2026-03-07T12:00:00.000Z",
  "updatedAt": "2026-03-07T12:00:00.000Z"
}
```

---

### Style `/api/style`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/style/analyze` | Analyze images with Gemini AI |
| POST | `/api/style/search` | Search listings by style query |

#### POST `/api/style/analyze` — Request Body

```json
{
  "images": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg"
  ]
}
```

#### POST `/api/style/search` — Request Body

```json
{
  "query": "minimalist oversized hoodie"
}
```

Returns an array of matching `Listing` documents. Falls back to MongoDB text search if Backboard returns no results.

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `auth0Id` | String | Required, unique |
| `email` | String | |
| `username` | String | |
| `backboardProfileRef` | String | Backboard vector profile ID |
| `styleProfileJSON` | Object | Stored style preferences |

### Listing

| Field | Type | Notes |
|-------|------|-------|
| `sellerId` | String | Auth0 user sub |
| `title` | String | Required |
| `description` | String | Required |
| `size` | String | Required (XS/S/M/L/XL/One Size) |
| `imageUrl` | String | Primary image URL (Cloudinary) |
| `publicId` | String | Cloudinary public ID |
| `images` | String[] | All image URLs |
| `cloudinaryTags` | String[] | Auto-tags from Cloudinary |
| `geminiKeywords` | String[] | AI-extracted style keywords |
| `price` | Number | Purchase/rental price |
| `dailyRate` | Number | Daily rental rate |
| `status` | String | `Draft` \| `Live` \| `Paused` |
| `views` | Number | View count |

---

## Frontend Integration

The frontend (`clothesrent/`) connects to this backend at `http://localhost:5000`.

**Seller upload flow:**
1. Frontend uploads image directly to Cloudinary via `UploadPhotoButton`
2. On form submit, `POST /api/listings` with the Cloudinary URL + listing details

**Buyer search flow:**
1. Frontend sends `POST /api/style/search` with a style query string
2. Backend queries Backboard (vector) → falls back to MongoDB text search
3. Returns ranked listing array to display

---

## External Services Integration Status

| Service | Status | Notes |
|---------|--------|-------|
| MongoDB | ✅ Connected | Via Mongoose |
| Cloudinary | 🔧 Stub | Frontend uploads direct; server helper ready in `cloudinaryService.ts` |
| Google Gemini | 🔧 Stub | Add `GEMINI_API_URL` + key in `.env`, implement in `geminiService.ts` |
| Backboard.io | 🔧 Stub | Implement in `backboardService.ts` |
| Auth0 | ⏸ Reserved | Middleware scaffolded in `middleware/authMiddleware.ts` |
