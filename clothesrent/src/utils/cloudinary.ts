import { Cloudinary } from "@cloudinary/url-gen";

// Initialize Cloudinary with your cloud name
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  console.warn(
    "Cloudinary cloud name not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env.local",
  );
}

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName || "demo", // Fallback to demo for testing
  },
});

export const getCloudinaryUrl = (publicId: string) => {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};
