import { useState } from "react";
import type { ImageTransformations } from "../types/listing";
import { DEFAULT_TRANSFORMATIONS } from "../types/listing";
import { buildDisplayUrl } from "../utils/cloudinaryUrl";

interface Props {
  cloudinaryUrl: string;
  onChange: (transforms: ImageTransformations) => void;
}

export default function ImageTransformPanel({ cloudinaryUrl, onChange }: Props) {
  const [transforms, setTransforms] = useState<ImageTransformations>({
    ...DEFAULT_TRANSFORMATIONS,
  });

  const update = (partial: Partial<ImageTransformations>) => {
    const next = { ...transforms, ...partial };
    setTransforms(next);
    onChange(next);
  };

  const previewUrl = buildDisplayUrl(cloudinaryUrl, {
    width: 400,
    height: 533,
    removeBg: transforms.removeBg,
    replaceBg: transforms.replaceBg ?? undefined,
    badge: transforms.badge ?? undefined,
    badgeColor: transforms.badgeColor,
  });

  const originalUrl = buildDisplayUrl(cloudinaryUrl, {
    width: 400,
    height: 533,
  });

  return (
    <div className="transform-panel">
      <h3 className="transform-panel-title">Enhance Your Photo</h3>
      <p className="transform-panel-subtitle">
        Apply Cloudinary AI features to make your listing stand out.
      </p>

      {/* Before / After Preview */}
      <div className="transform-preview-row">
        <div className="transform-preview-col">
          <span className="transform-preview-label">Original</span>
          <div className="transform-preview-box">
            <img src={originalUrl} alt="Original" className="transform-preview-img" />
          </div>
        </div>
        <div className="transform-preview-col">
          <span className="transform-preview-label">Enhanced</span>
          <div className="transform-preview-box transform-preview-box--active">
            <img src={previewUrl} alt="Enhanced preview" className="transform-preview-img" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="transform-controls">
        {/* Background Removal */}
        <label className="transform-toggle-row">
          <span className="transform-toggle-label">
            AI Background Removal
            <span className="transform-toggle-hint">
              Removes the background and keeps the garment
            </span>
          </span>
          <input
            type="checkbox"
            className="transform-checkbox"
            checked={transforms.removeBg}
            disabled={!!transforms.replaceBg}
            onChange={(e) =>
              update({ removeBg: e.target.checked })
            }
          />
        </label>

        {/* Background Replace */}
        <div className="transform-control-group">
          <label className="transform-toggle-row">
            <span className="transform-toggle-label">
              AI Background Replace
              <span className="transform-toggle-hint">
                Replace the background with an AI-generated scene
              </span>
            </span>
            <input
              type="checkbox"
              className="transform-checkbox"
              checked={!!transforms.replaceBg}
              onChange={(e) =>
                update({
                  replaceBg: e.target.checked ? "clean white studio background" : null,
                  removeBg: false,
                })
              }
            />
          </label>
          {transforms.replaceBg !== null && (
            <input
              type="text"
              className="transform-prompt-input"
              placeholder="e.g. minimalist studio, urban street, marble floor..."
              value={transforms.replaceBg}
              onChange={(e) => update({ replaceBg: e.target.value })}
            />
          )}
        </div>

        {/* Smart Crop */}
        <label className="transform-toggle-row">
          <span className="transform-toggle-label">
            Smart Crop
            <span className="transform-toggle-hint">
              Auto-detects the garment and crops around it
            </span>
          </span>
          <input
            type="checkbox"
            className="transform-checkbox"
            checked={transforms.smartCrop}
            onChange={(e) => update({ smartCrop: e.target.checked })}
          />
        </label>

        {/* Conditional Badge */}
        <div className="transform-control-group">
          <label className="transform-toggle-row">
            <span className="transform-toggle-label">
              Badge Overlay
              <span className="transform-toggle-hint">
                Add a text badge in the top-right corner
              </span>
            </span>
            <input
              type="checkbox"
              className="transform-checkbox"
              checked={!!transforms.badge}
              onChange={(e) =>
                update({ badge: e.target.checked ? "NEW" : null })
              }
            />
          </label>
          {transforms.badge !== null && (
            <div className="transform-badge-row">
              <input
                type="text"
                className="transform-prompt-input transform-badge-text"
                placeholder="NEW"
                maxLength={12}
                value={transforms.badge}
                onChange={(e) =>
                  update({ badge: e.target.value.toUpperCase() })
                }
              />
              <label className="transform-color-label">
                Color
                <input
                  type="color"
                  className="transform-color-input"
                  value={`#${transforms.badgeColor}`}
                  onChange={(e) =>
                    update({ badgeColor: e.target.value.replace("#", "") })
                  }
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Optimization note */}
      <p className="transform-note">
        ✓ Auto quality &amp; format optimization is always applied for fast delivery.
      </p>
    </div>
  );
}
