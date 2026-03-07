import { cloudinaryConfig } from "../config/cloudinary";

export async function uploadImage(_filePath: string): Promise<object> {
  // TODO: Integrate with Cloudinary SDK
  console.log("Cloudinary upload called, config:", cloudinaryConfig.cloudName);
  return { url: "", publicId: "" };
}
