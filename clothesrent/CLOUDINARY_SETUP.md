# Cloudinary Setup Guide for FitBoard

## Quick Start

### 1. **Get Your Cloudinary Credentials**

- Sign up at https://cloudinary.com
- Go to your Dashboard
- Copy your **Cloud Name**
- Create an **Upload Preset** (Settings → Upload → Add upload preset)

### 2. **Configure Environment Variables**

Update `.env.local`:

```
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_actual_upload_preset
```

### 3. **Use in Your Components**

**Upload a photo:**

```tsx
import { UploadPhotoButton } from "./components/uploadPhotoButton";

function MyComponent() {
  return (
    <UploadPhotoButton
      buttonLabel="Upload Outfit Photo"
      onUploadSuccess={(imageData) => {
        console.log("Uploaded:", imageData);
        // Send to your backend/database
      }}
      onUploadError={(error) => {
        console.error("Upload failed:", error);
      }}
    />
  );
}
```

**Display an image with optimization:**

```tsx
import { CloudinaryImage } from "./components/CloudinaryImage";

function ImageGallery() {
  return <CloudinaryImage publicId="your_public_id" width={400} height={400} />;
}
```

## Advanced Features

### Image Transformations

The `CloudinaryImage` component includes automatic width/height scaling and quality optimization. For more advanced transformations (background removal, fashion tagging, etc.), you'll need to:

1. **Use Cloudinary's Transformation API** in your backend
2. **Apply add-ons**: Fashion Tagging, Auto-tagging, etc.
3. **Chain transformations** using the SDK

Example with more transformations:

```tsx
import { blur } from "@cloudinary/url-gen/actions/effect";
import { fill } from "@cloudinary/url-gen/actions/resize";

const image = cld
  .image(publicId)
  .resize(fill().width(500).height(500))
  .effect(blur().strength(100)); // Background blur example
```

### RAG Integration with Backboard.io

Once images are processed by Cloudinary:

1. Store `public_id` + metadata in your database
2. Send to Backboard.io for vector embedding
3. Backboard handles semantic search + matching

## File Structure

```
src/
├── components/
│   ├── uploadPhotoButton.tsx    # Upload handler
│   └── CloudinaryImage.tsx      # Image display with optimization
└── utils/
    └── cloudinary.ts           # Cloudinary configuration
```

## Environment Variables

- `VITE_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name (required)
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Unsigned upload preset (required for client-side uploads)

## Next Steps

1. ✅ Cloudinary basic setup complete
2. Next: Configure Gemini API for style analysis
3. Then: Set up Backboard.io for RAG search
4. Finally: Build the style matching pipeline

## Troubleshooting

**"Upload fails silently"**

- Check `.env.local` is in the root directory
- Verify cloud name and upload preset are correct
- Ensure upload preset is set to "Unsigned"

**"Images not optimized"**

- CloudinaryImage component auto-scales - no extra config needed
- For custom transformations, modify the `CloudinaryImage` component

**"Can't find CloudinaryImage component"**

- Make sure file is in `src/components/CloudinaryImage.tsx`
- Check import path in your files
