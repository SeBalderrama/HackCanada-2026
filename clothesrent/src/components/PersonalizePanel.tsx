import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  loadUserProfile,
  saveUserProfile,
  type UserProfileData,
} from "../utils/profileStorage";

interface Props {
  userId: string;
  fallbackName: string;
  fallbackPicture: string;
}

interface PreviewItem {
  key: string;
  name: string;
  url: string;
}

const STYLE_SUGGESTIONS = [
  "Goth",
  "Streetwear",
  "Minimalist",
  "Vintage",
  "Athleisure",
  "Avant-Garde",
];

function inferStyleFromFilenames(files: File[]): string {
  const text = files.map((file) => file.name.toLowerCase()).join(" ");
  if (text.includes("black") || text.includes("dark") || text.includes("punk")) {
    return "Goth";
  }
  if (text.includes("retro") || text.includes("vintage")) return "Vintage";
  if (text.includes("hoodie") || text.includes("sneaker")) return "Streetwear";
  if (text.includes("clean") || text.includes("neutral")) return "Minimalist";
  return STYLE_SUGGESTIONS[files.length % STYLE_SUGGESTIONS.length];
}

export default function PersonalizePanel({
  userId,
  fallbackName,
  fallbackPicture,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedStyle, setDetectedStyle] = useState("");
  const [manualStyle, setManualStyle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  const canAnalyze = files.length > 0 && !isAnalyzing;
  const canSave = !!(detectedStyle || manualStyle.trim());
  const styleToSave = (manualStyle.trim() || detectedStyle).trim();

  const fileNames = useMemo(() => files.map((file) => file.name), [files]);

  useEffect(() => {
    const previews = files.map((file) => ({
      key: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviewItems(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const limited = selected.slice(0, 10);
    setFiles(limited);
    setDetectedStyle("");
    setManualStyle("");
    setStatusMessage(
      selected.length > 10
        ? "Only the first 10 images were selected."
        : `${limited.length} image(s) selected.`,
    );
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setIsAnalyzing(true);
    setStatusMessage("Analyzing your style with AI (stub)...");

    // Placeholder: will be replaced with Gemini request.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const nextStyle = inferStyleFromFilenames(files);
    setDetectedStyle(nextStyle);
    setManualStyle(nextStyle);
    setIsAnalyzing(false);
    setStatusMessage(`AI returned: ${nextStyle}`);
  };

  const handleSaveStyle = () => {
    if (!styleToSave) return;

    const fallback: UserProfileData = {
      name: fallbackName,
      style: "",
      picture: fallbackPicture,
    };
    const existingProfile = loadUserProfile(userId, fallback);
    saveUserProfile(userId, {
      ...existingProfile,
      style: styleToSave,
    });
    setStatusMessage(`Saved style: ${styleToSave}`);
  };

  return (
    <div className="personalize-panel">
      <p className="shop-section-subtitle">
        Upload up to 10 images. AI analysis is stubbed for now and will be connected to
        Gemini later.
      </p>

      <section className="personalize-uploader">
        <div>
          <p className="personalize-uploader-title">Inspiration Upload</p>
          <p className="personalize-uploader-meta">
            JPG, PNG, WEBP · up to 10 photos
          </p>
        </div>
        <button
          type="button"
          className="btn-outline personalize-browse-btn"
          onClick={() => fileInputRef.current?.click()}>
          Browse Photos
        </button>
        <input
          ref={fileInputRef}
          id="personalize-images"
          type="file"
          accept="image/*"
          multiple
          className="personalize-input-file-hidden"
          onChange={handleFileChange}
        />
      </section>

      {previewItems.length > 0 && (
        <div className="personalize-thumb-grid">
          {previewItems.map((item) => (
            <article key={item.key} className="personalize-thumb-card">
              <img src={item.url} alt={item.name} className="personalize-thumb-img" />
              <p className="personalize-thumb-name">{item.name}</p>
            </article>
          ))}
        </div>
      )}

      {fileNames.length > 0 && (
        <div className="personalize-file-list">
          {fileNames.map((name) => (
            <span key={name} className="shop-tag">
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="personalize-actions">
        <button
          type="button"
          className="btn-primary shop-action-btn"
          onClick={handleAnalyze}
          disabled={!canAnalyze}>
          {isAnalyzing ? "Analyzing..." : "Analyze Style"}
        </button>
      </div>

      {(detectedStyle || manualStyle) && (
        <div className="personalize-result-card">
          <p className="personalize-result-line">
            AI Style: <strong>{detectedStyle || "No result yet"}</strong>
          </p>

          <label className="personalize-label" htmlFor="manual-style">
            Change Manually
          </label>
          <input
            id="manual-style"
            className="personalize-input"
            value={manualStyle}
            onChange={(event) => setManualStyle(event.target.value)}
            placeholder="e.g. Goth"
          />

          <button
            type="button"
            className="btn-outline shop-action-btn"
            onClick={handleSaveStyle}
            disabled={!canSave}>
            Save Style to Profile
          </button>
        </div>
      )}

      {statusMessage && <p className="shop-section-subtitle">{statusMessage}</p>}
    </div>
  );
}
