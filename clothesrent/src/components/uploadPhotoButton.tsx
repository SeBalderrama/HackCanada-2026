import { useState, useRef } from "react";

interface UploadPhotoButtonProps {
  onUploadSuccess?: (imageData: {
    url: string;
    publicId: string;
    cloudinaryTags?: string[];
  }) => void;
  onUploadError?: (error: string) => void;
  buttonLabel?: string;
  uploadPreset?: string;
}

export function UploadPhotoButton({
  onUploadSuccess,
  onUploadError,
  buttonLabel = "Upload Photo",
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
}: UploadPhotoButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      const error =
        "Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local";
      console.error(error);
      onUploadError?.(error);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageData = {
            url: response.secure_url,
            publicId: response.public_id,
            cloudinaryTags: response.tags,
          };
          onUploadSuccess?.(imageData);
          setUploadProgress(0);
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Network error during upload");
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      );
      xhr.send(formData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      console.error("Upload error:", errorMessage);
      onUploadError?.(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-photo-button">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        style={{
          padding: "10px 20px",
          backgroundColor: isUploading ? "#ccc" : "#333",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: isUploading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
        }}>
        {isUploading ? `Uploading... ${uploadProgress}%` : buttonLabel}
      </button>
    </div>
  );
}
