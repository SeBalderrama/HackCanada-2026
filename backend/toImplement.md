ere’s a detailed and comprehensive prompt you can use to guide development of your backend functionality for the ClothesRent platform, specifically for the selling workflow with image uploads, Cloudinary integration, MongoDB mapping, and buyer access:

Comprehensive Prompt: ClothesRent Selling & Buying Backend Flow

Objective:
Implement a backend system in Node.js + Express + TypeScript that allows users to upload items for sale, store them in MongoDB, upload images to Cloudinary, generate searchable vector links via Backboard.io, and enable buyers to browse and purchase listings.

1. User Story & Flow
Seller Flow:

A registered seller submits a form from the frontend with:

image (file upload)

title (string)

description (string)

price (number)

dailyRate (number)

Optional tags (tags: string[])

Backend receives the form:

Uploads the image to Cloudinary

Generates cloudinaryUrl and publicId

Automatically extracts tags from the image (Cloudinary auto-tags or custom AI tagging)

Optionally generates a vector embedding for search via Backboard.io

Creates a MongoDB document for the item in a user-itemsell collection, storing:

itemId (unique ID)

sellerId (user identifier)

title, description, price, dailyRate

cloudinaryUrl and publicId

tags (array of strings)

bbLink (short Backboard vector link for searching)

status (Live by default)

createdAt / updatedAt timestamps

Return a response to the seller with:

{
  "success": true,
  "item": {
    "itemId": "...",
    "title": "...",
    "cloudinaryUrl": "...",
    "bbLink": "...",
    "tags": ["..."]
  }
}
Buyer Flow:

Buyer browses or searches for items:

GET /api/listings → returns all live listings

POST /api/style/search → returns listings based on style query using Backboard vector similarity

Buyer selects an item:

POST /api/listings/:id/purchase → backend updates MongoDB to mark item as sold or creates a user-itembuy collection for purchased items

Return response confirming purchase and linking to seller info.

2. MongoDB Schema Design
UserItemSell Collection
interface UserItemSell {
  itemId: string;            // Unique ID (Mongo ObjectID or UUID)
  sellerId: string;          // Auth0 ID or user identifier
  title: string;
  description: string;
  price: number;
  dailyRate: number;
  cloudinaryUrl: string;
  publicId: string;
  tags: string[];            // Array of strings
  bbLink?: string;           // Optional Backboard vector search link
  status: "Draft" | "Live" | "Paused";
  createdAt: Date;
  updatedAt: Date;
}
UserItemBuy Collection
interface UserItemBuy {
  itemId: string;           // ID of the purchased item
  buyerId: string;          // Auth0 ID or user identifier
  purchaseDate: Date;
  cloudinaryUrl: string;
  title: string;
  price: number;
  tags: string[];
}
3. Backend API Endpoints
Upload & Sell Item
Method	Endpoint	Body	Response
POST	/api/listings	Multipart/form-data: image (file), title, description, price, dailyRate, tags[]	Created UserItemSell object

Logic:

Validate input fields.

Upload image to Cloudinary using cloudinaryService.ts.

Extract or attach tags.

Optionally generate Backboard vector link bbLink.

Save document to MongoDB (user-itemsell).

Return full item info.

Browse Items
Method	Endpoint	Query	Response
GET	/api/listings	Optional: ?status=Live	Array of UserItemSell objects
Purchase Item
Method	Endpoint	Body	Response
POST	/api/listings/:id/purchase	buyerId	Confirmation, creates UserItemBuy entry, updates item status if needed
Search by Style
Method	Endpoint	Body	Response
POST	/api/style/search	query (string)	Ranked array of UserItemSell documents matching style vector similarity
4. Services & Integrations

Cloudinary

uploadImage(file): { url, publicId, tags }

Use secure upload preset for server-side upload.

Backboard.io

Generate vector embeddings for new listings.

Return bbLink for frontend style search.

MongoDB

Two collections:

user-itemsell

user-itembuy

Optional AI

Gemini or similar AI can auto-extract style keywords from uploaded images for tagging/search.

5. Validation & Edge Cases

Validate all required fields: title, description, price, image.

Check image format (jpg, png, webp).

Prevent duplicate listings for the same publicId.

Ensure buyer cannot purchase own listing.

Handle Cloudinary or Backboard API failures gracefully.

6. Response Example: Seller Upload
{
  "success": true,
  "item": {
    "itemId": "64f123abc456",
    "sellerId": "auth0|abc123",
    "title": "Obsidian Trench",
    "description": "Minimalist oversized trench coat",
    "cloudinaryUrl": "https://res.cloudinary.com/xyz/abc123.jpg",
    "publicId": "clothesrent/abc123",
    "tags": ["trench", "outerwear"],
    "bbLink": "https://bb.io/v/abc123",
    "status": "Live",
    "createdAt": "2026-03-07T12:00:00Z",
    "updatedAt": "2026-03-07T12:00:00Z"
  }
}

This prompt provides a complete technical specification, including:

User flows for sellers and buyers

MongoDB schema design

API endpoints with request/response examples

Services integrations (Cloudinary, Backboard)

Validation, edge cases, and optional AI tagging

If you want, I can also generate the full Express + TypeScript backend boilerplate code implementing this prompt with Cloudinary upload, MongoDB mapping, and buyer purchase flow, ready to drop into your project.

Do you want me to do that next?