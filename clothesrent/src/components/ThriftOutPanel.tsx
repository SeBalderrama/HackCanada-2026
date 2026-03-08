import { useEffect, useMemo, useState } from "react";
import {
  fetchListings,
  searchListings,
} from "../api/listings";
import type { Listing } from "../types/listing";
import { buildDisplayUrl } from "../utils/cloudinaryUrl";
import { loadUserProfile, type UserProfileData } from "../utils/profileStorage";
import { geocodeAddressToCoords } from "../utils/location";

interface Props {
  userId: string;
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  proximityOnly: boolean;
  radiusKm: string;
  sortBy: string;
  selectedSizes: string[];
  selectedTags: string[];
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) *
    Math.cos(toRad(b.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function ThriftOutPanel({
  userId,
  searchQuery,
  minPrice,
  maxPrice,
  proximityOnly,
  radiusKm,
  sortBy,
  selectedSizes,
  selectedTags,
}: Props) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCoords, setProfileCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationCoords, setLocationCoords] = useState<
    Record<string, { lat: number; lng: number } | null>
  >({});

  const loadLive = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings("Live");
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLive();
  }, []);

  // React to search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadLive();
      return;
    }
    setLoading(true);
    setError(null);
    searchListings(searchQuery.trim())
      .then((results) => setItems(results))
      .catch((err: any) => setError(err.message || "Search failed"))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  // Load profile coords for proximity
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId) { setProfileCoords(null); return; }
      const fallback: UserProfileData = { name: "", style: "", picture: "", location: "" };
      const profile = loadUserProfile(userId, fallback);
      if (!profile.location.trim()) { setProfileCoords(null); return; }
      const coords = await geocodeAddressToCoords(profile.location);
      if (!cancelled) setProfileCoords(coords);
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Geocode listing locations for proximity
  useEffect(() => {
    let cancelled = false;
    if (!proximityOnly || !profileCoords) return;
    const locations = Array.from(
      new Set(items.map((item) => item.location?.trim() || "").filter((l) => l.length > 0)),
    );
    const missing = locations.filter((l) => !(l in locationCoords));
    if (!missing.length) return;
    const loadMissing = async () => {
      const entries = await Promise.all(
        missing.map(async (l) => [l, await geocodeAddressToCoords(l)] as const),
      );
      if (cancelled) return;
      setLocationCoords((prev) => {
        const next = { ...prev };
        entries.forEach(([l, coords]) => { next[l] = coords; });
        return next;
      });
    };
    loadMissing();
    return () => { cancelled = true; };
  }, [items, locationCoords, profileCoords, proximityOnly]);

  const getBadge = (item: Listing): string | undefined => {
    const created = new Date(item.createdAt).getTime();
    if (Date.now() - created < 24 * 60 * 60 * 1000) return "NEW";
    return undefined;
  };

  const filteredItems = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const radius = Number(radiusKm);

    let result = items.filter((item) => {
      if (userId && item.sellerId === userId) return false;
      if (min != null && Number.isFinite(min) && item.price < min) return false;
      if (max != null && Number.isFinite(max) && item.price > max) return false;

      if (selectedSizes.length > 0) {
        if (!item.size?.letter || !selectedSizes.includes(item.size.letter)) return false;
      }

      if (selectedTags.length > 0) {
        const itemTagsLower = item.tags.map((t) => t.toLowerCase());
        const hasMatch = selectedTags.some((tag) =>
          itemTagsLower.some((t) => t.includes(tag.toLowerCase())),
        );
        if (!hasMatch) return false;
      }

      if (!proximityOnly) return true;
      if (!profileCoords || !item.location?.trim()) return false;
      const coords = locationCoords[item.location.trim()];
      if (!coords) return false;
      return distanceKm(profileCoords, coords) <= radius;
    });

    if (sortBy === "price-asc") result = result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = result.sort((a, b) => b.price - a.price);
    else result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [items, locationCoords, maxPrice, minPrice, profileCoords, proximityOnly, radiusKm, selectedSizes, selectedTags, sortBy, userId]);

  return (
    <div>
      {proximityOnly && !profileCoords && (
        <p className="shop-section-subtitle">
          Save a profile location to enable proximity filtering.
        </p>
      )}

      {error && <p className="shop-section-subtitle" style={{ color: "#b44" }}>{error}</p>}
      {!loading && filteredItems.length === 0 && (
        <p className="shop-section-subtitle">No items found. Try adjusting your filters.</p>
      )}

      <div className="shop-grid">
        {filteredItems.map((item) => {
          const badge = item.transformations?.badge || getBadge(item);
          const t = item.transformations;
          const itemCoords = item.location?.trim() ? locationCoords[item.location.trim()] : null;
          const itemDistance =
            proximityOnly && profileCoords && itemCoords
              ? distanceKm(profileCoords, itemCoords)
              : null;
          const displayUrl = item.cloudinaryUrl
            ? buildDisplayUrl(item.cloudinaryUrl, {
              width: 400,
              height: 533,
              removeBg: t?.removeBg,
              replaceBg: t?.replaceBg ?? undefined,
              badge,
              badgeColor: t?.badgeColor,
            })
            : "";

          const sellerDisplayName = item.sellerName?.trim() || "Anonymous";
          const sellerProfileHref = item.sellerId?.trim()
            ? `/profile/${encodeURIComponent(item.sellerId.trim())}`
            : "";

          return (
            <article
              key={item._id}
              className="shop-card shop-card-link"
              onClick={() => { window.location.href = `/listing/${item._id}`; }}
              style={{ cursor: "pointer" }}
            >
              {displayUrl && (
                <div className="shop-card-img-wrap">
                  <img
                    src={displayUrl}
                    alt={item.title}
                    className="shop-card-img"
                    loading="lazy"
                  />
                </div>
              )}
              <h3 className="shop-card-title">{item.title}</h3>
              <p className="shop-card-meta">{item.description}</p>
              {item.location && (
                <p className="shop-card-meta shop-card-location">📍 {item.location}</p>
              )}
              <p className="shop-card-meta shop-card-location">
                Listed by:{" "}
                {sellerProfileHref ? (
                  <a className="shop-card-user-link" href={sellerProfileHref} onClick={(e) => e.stopPropagation()}>
                    {sellerDisplayName}
                  </a>
                ) : (
                  sellerDisplayName
                )}
              </p>
              {itemDistance != null && (
                <p className="shop-card-meta shop-card-location">
                  {itemDistance.toFixed(1)} km away
                </p>
              )}
              {item.size && (item.size.letter || item.size.waist || item.size.shoe) && (
                <div className="shop-card-sizes">
                  {item.size.letter && <span className="shop-size-pill">{item.size.letter}</span>}
                  {item.size.waist && <span className="shop-size-pill">W{item.size.waist}</span>}
                  {item.size.shoe && <span className="shop-size-pill">US{item.size.shoe}</span>}
                </div>
              )}
              <p className="shop-card-rate">
                ${item.price}
                {item.dailyRate > 0 && (
                  <span className="shop-card-daily"> · ${item.dailyRate}/day</span>
                )}
              </p>
              {item.tags.length > 0 && (
                <div className="shop-card-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="shop-tag">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
