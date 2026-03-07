Build a full-stack peer-to-peer clothing marketplace called FitBoard with the following exact architecture: USER (BUYER) FLOW:

1. User uploads 3–5 inspiration images during onboarding
2. Images are sent directly to Gemini API for style classification — Gemini analyzes them collectively and returns a structured JSON style profile (preferred silhouettes, color palettes, patterns, layering style, formality range, aesthetic keywords)
3. That style profile JSON is fed into Backboard.io as a persistent user document / vector embedding
4. The resulting Backboard agent URL (or document reference ID) is stored in Firebase under the user's record
5. On search, the buyer's natural language query hits Backboard via that stored reference, returning style-matched listings weighted by their profile SELLER FLOW:
6. Seller uploads a garment photo
7. Image goes to Cloudinary for processing (background removal, auto-crop, fashion attribute tagging via CLD Fashion add-on)
8. Processed image + Cloudinary tags are sent to Gemini API, which generates a rich listing description and style-match keywords
9. The full listing data (Cloudinary image URLs + Gemini metadata) is stored in Firebase under the seller's record FIREBASE DATA MODEL:
