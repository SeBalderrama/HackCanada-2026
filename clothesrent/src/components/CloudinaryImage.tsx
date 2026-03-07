import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";

interface CloudinaryImageProps {
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function CloudinaryImage({
  publicId,
  alt = "Cloudinary image",
  width = 300,
  height = 300,
  className = "",
}: CloudinaryImageProps) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";

  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  const image = cld
    .image(publicId)
    .resize(scale().width(width).height(height))
    .delivery(quality(auto()));

  return (
    <AdvancedImage
      cldImg={image}
      alt={alt}
      className={className}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}
