import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./profilePage.css";
import {
  loadUserProfile,
  PROFILE_UPDATED_EVENT,
  saveUserProfile,
  type UserProfileData,
} from "../utils/profileStorage";
import LocationAutocompleteInput from "../components/LocationAutocompleteInput";
import { reverseGeocodeToSimpleAddress } from "../utils/location";
import {
  fetchListings,
  fetchPublicUserProfile,
  savePublicUserProfile,
} from "../api/listings";
import type { Listing } from "../types/listing";
import { buildDisplayUrl } from "../utils/cloudinaryUrl";
import TransactionsPanel from "../components/TransactionsPanel";

interface ProfilePageProps {
  profileUserId?: string;
  requireName?: boolean;
}

export default function ProfilePage({ profileUserId, requireName = false }: ProfilePageProps) {
  const { user } = useAuth0();
  const authUserId = useMemo(() => user?.sub ?? "anonymous", [user?.sub]);
  const viewedUserId = profileUserId ?? authUserId;
  const isOwnProfile = !profileUserId || profileUserId === authUserId;

  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [picture, setPicture] = useState("");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showPicPopup, setShowPicPopup] = useState(false);
  const [rightTab, setRightTab] = useState<"listings" | "purchases" | "sales">("listings");
  const picInputRef = useRef<HTMLInputElement>(null);

  // User's own listings
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    const fallback: UserProfileData = {
      name: user?.name ?? user?.nickname ?? "",
      style: "",
      picture: user?.picture ?? "",
      location: "",
    };

    if (isOwnProfile) {
      const profile = loadUserProfile(authUserId, fallback);
      setName(profile.name);
      setStyle(profile.style);
      setPicture(profile.picture);
      setLocation(profile.location);
      fetchPublicUserProfile(authUserId)
        .then((publicProfile) => {
          if (publicProfile.name) setName(publicProfile.name);
          if (publicProfile.picture) setPicture(publicProfile.picture);
          if (publicProfile.location) setLocation(publicProfile.location);
        })
        .catch(() => { });
      return;
    }

    setLoadingProfile(true);
    fetchPublicUserProfile(viewedUserId)
      .then((publicProfile) => {
        setName(publicProfile.name || viewedUserId);
        setPicture(publicProfile.picture || "");
        setLocation(publicProfile.location || "");
        setStyle("");
      })
      .catch(() => {
        setName(viewedUserId);
        setPicture("");
        setLocation("");
        setStyle("");
      })
      .finally(() => setLoadingProfile(false));
  }, [
    authUserId,
    isOwnProfile,
    user?.name,
    user?.nickname,
    user?.picture,
    viewedUserId,
  ]);

  // Fetch user's listings
  useEffect(() => {
    if (!viewedUserId || viewedUserId === "anonymous") return;
    setListingsLoading(true);
    fetchListings()
      .then((all) => {
        const mine = all.filter((l) => l.sellerId === viewedUserId);
        setUserListings(mine);
      })
      .catch(() => { })
      .finally(() => setListingsLoading(false));
  }, [viewedUserId]);

  useEffect(() => {
    if (!isOwnProfile) return;

    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<UserProfileData>;
      const updated = customEvent.detail;
      if (!updated) return;
      setName(updated.name);
      setStyle(updated.style);
      setPicture(updated.picture);
      setLocation(updated.location);
      setSaved(true);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, [isOwnProfile]);

  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPicture(reader.result);
        setSaved(false);
        setShowPicPopup(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (isOwnProfile && !name.trim()) {
      setNameError("Name is required.");
      setSaved(false);
      return;
    }

    const payload: UserProfileData = { name, style, picture, location };
    saveUserProfile(authUserId, payload);
    savePublicUserProfile(authUserId, {
      name,
      picture,
      location,
      email: user?.email,
    }).catch(() => { });
    setNameError(null);
    setSaved(true);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported in this browser.");
      return;
    }

    setLocationBusy(true);
    setLocationMessage("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const address = await reverseGeocodeToSimpleAddress(
          position.coords.latitude,
          position.coords.longitude,
        );

        if (!address) {
          setLocationMessage("Could not resolve your location to an address.");
          setLocationBusy(false);
          return;
        }

        setLocation(address);
        setSaved(false);
        setLocationBusy(false);
        setLocationMessage("Current location filled. Review and save profile.");
      },
      (error) => {
        setLocationBusy(false);
        if (error.code === 1) {
          setLocationMessage("Location permission denied.");
          return;
        }
        setLocationMessage("Could not get current location.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  // Helper to build listing card display URL
  const getListingDisplayUrl = (listing: Listing) => {
    if (!listing.cloudinaryUrl) return "";
    const t = listing.transformations;
    return buildDisplayUrl(listing.cloudinaryUrl, {
      width: 300,
      height: 400,
      removeBg: t?.removeBg,
      replaceBg: t?.replaceBg ?? undefined,
      badge: t?.badge ?? undefined,
      badgeColor: t?.badgeColor,
    });
  };

  // Listings sidebar component
  const listingsPanel = (
    <section className="profile-listings-panel">
      <h2 className="profile-listings-title">
        {isOwnProfile ? "Your Listings" : "Listings"}
      </h2>
      {listingsLoading ? (
        <p className="profile-listings-empty">Loading listings...</p>
      ) : userListings.length === 0 ? (
        <p className="profile-listings-empty">
          {isOwnProfile
            ? "No listings yet. Create your first listing!"
            : "No listings to show."}
        </p>
      ) : (
        <div className="profile-listings-grid">
          {userListings.map((listing) => {
            const imgUrl = getListingDisplayUrl(listing);
            return (
              <a
                key={listing._id}
                href={`/listing/${listing._id}`}
                className="profile-listing-card"
              >
                <div className="profile-listing-img-wrap">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={listing.title}
                      className="profile-listing-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="profile-listing-img profile-listing-img-placeholder">
                      No Image
                    </div>
                  )}
                </div>
                <div className="profile-listing-info">
                  <span className="profile-listing-name">{listing.title}</span>
                  <span className="profile-listing-price">${listing.price}</span>
                  <span className={`profile-listing-status profile-listing-status--${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
      {isOwnProfile && (
        <a href="/shop/new-listing" className="profile-new-listing-btn">
          + Create New Listing
        </a>
      )}
    </section>
  );

  if (loadingProfile) {
    return (
      <main className="profile-page">
        <div className="profile-layout">
          <section className="profile-card profile-card-loading">
            <div className="profile-loading-skeleton">
              <div className="profile-picture profile-picture-skeleton" />
              <div className="profile-skeleton-line profile-skeleton-line-title" />
              <div className="profile-skeleton-line profile-skeleton-line-short" />
              <div className="profile-skeleton-line" />
              <div className="profile-skeleton-line profile-skeleton-line-short" />
            </div>
            <div className="profile-loading-content">
              <div className="profile-spinner" />
              <p className="profile-loading-text">Loading profile...</p>
            </div>
          </section>
          <section className="profile-listings-panel profile-listings-panel-loading">
            <div className="profile-listings-skeleton">
              <div className="profile-skeleton-line profile-skeleton-line-title" />
              <div className="profile-skeleton-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="profile-skeleton-card" />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!isOwnProfile) {
    return (
      <main className="profile-page">
        <div className="profile-layout">
          <section className="profile-card">
            <a href="/shop" className="profile-back-link">
              Back to Shop
            </a>
            <h1 className="font-display profile-title">{name || "User Profile"}</h1>
            <p className="profile-subtitle">Public seller profile.</p>

            <div className="profile-picture-wrap">
              {picture ? (
                <img src={picture} alt="User profile" className="profile-picture" />
              ) : (
                <div className="profile-picture profile-picture-fallback">No Image</div>
              )}
            </div>

            <label className="profile-label">Name</label>
            <p className="profile-readonly-field">{name || viewedUserId}</p>

            <label className="profile-label">Location</label>
            <p className="profile-readonly-field">{location || "Not provided"}</p>
          </section>
          {listingsPanel}
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-layout">
        <section className="profile-card">
          <h1 className="font-display profile-title">Profile</h1>
          <p className="profile-subtitle">
            {requireName
              ? "Set your profile name to continue. Name is required."
              : "Manage your look and style identity."}
          </p>

          <div className="profile-picture-wrap">
            <div className="profile-pic-container">
              {picture ? (
                <img src={picture} alt="User profile" className="profile-picture" />
              ) : (
                <div className="profile-picture profile-picture-fallback">No Image</div>
              )}
              <button
                type="button"
                className="profile-pic-edit-btn"
                onClick={() => setShowPicPopup(true)}
                title="Change profile picture"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          <label className="profile-label" htmlFor="profile-name">
            Name
          </label>
          <input
            id="profile-name"
            className="profile-input"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
              setNameError(null);
            }}
            placeholder="Your name"
            required
          />
          {nameError && <p className="profile-error-message">{nameError}</p>}

          <label className="profile-label" htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            className="profile-input"
            value={user?.email ?? ""}
            readOnly
          />

          <label className="profile-label" htmlFor="profile-style">
            Style
          </label>
          <input
            id="profile-style"
            className="profile-input"
            value={style}
            onChange={(event) => {
              setStyle(event.target.value);
              setSaved(false);
            }}
            placeholder="e.g. Goth"
          />

          <label className="profile-label" htmlFor="profile-location">
            Location
          </label>
          <LocationAutocompleteInput
            id="profile-location"
            inputClassName="profile-input"
            value={location}
            onChange={(next) => {
              setLocation(next);
              setSaved(false);
              setLocationMessage(null);
            }}
            placeholder="e.g. 100 Queen St W, Toronto"
          />
          <div className="profile-location-row">
            <button
              type="button"
              className="btn-outline profile-location-btn"
              onClick={handleUseCurrentLocation}
              disabled={locationBusy}>
              {locationBusy ? "Locating..." : "Use Current Location"}
            </button>
            {locationMessage && (
              <p className="profile-location-message">{locationMessage}</p>
            )}
          </div>

          <div className="profile-actions">
            <button type="button" className="btn-primary profile-save-btn" onClick={handleSave}>
              Save Profile
            </button>
            {saved && <span className="profile-saved">Saved</span>}
          </div>
          <input
            ref={picInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePictureChange}
          />
        </section>
        {showPicPopup && (
          <div className="profile-pic-popup-backdrop" onClick={() => setShowPicPopup(false)}>
            <div className="profile-pic-popup" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="profile-pic-popup-close" onClick={() => setShowPicPopup(false)}>✕</button>
              <h3 className="profile-pic-popup-title font-display">Profile Picture</h3>
              <div className="profile-pic-popup-preview">
                {picture ? (
                  <img src={picture} alt="Preview" className="profile-pic-popup-img" />
                ) : (
                  <div className="profile-pic-popup-placeholder">No Image</div>
                )}
              </div>
              <button
                type="button"
                className="btn-primary profile-pic-popup-upload-btn"
                onClick={() => picInputRef.current?.click()}
              >
                Choose Photo
              </button>
              <p className="profile-pic-popup-hint">JPG, PNG, or WEBP. Will be saved with your profile.</p>
            </div>
          </div>
        )}
        <div className="profile-right-col">
          <section className="profile-listings-panel">
            <div className="profile-right-tabs">
              <button
                type="button"
                className={`profile-right-tab${rightTab === "listings" ? " active" : ""}`}
                onClick={() => setRightTab("listings")}
              >
                Listings
              </button>
              <button
                type="button"
                className={`profile-right-tab${rightTab === "purchases" ? " active" : ""}`}
                onClick={() => setRightTab("purchases")}
              >
                Purchases
              </button>
              <button
                type="button"
                className={`profile-right-tab${rightTab === "sales" ? " active" : ""}`}
                onClick={() => setRightTab("sales")}
              >
                Sales
              </button>
            </div>

            {rightTab === "listings" && (
              <>
                {listingsLoading ? (
                  <p className="profile-listings-empty">Loading listings...</p>
                ) : userListings.length === 0 ? (
                  <p className="profile-listings-empty">
                    {isOwnProfile ? "No listings yet. Create your first listing!" : "No listings to show."}
                  </p>
                ) : (
                  <div className="profile-listings-grid">
                    {userListings.map((listing) => {
                      const imgUrl = getListingDisplayUrl(listing);
                      return (
                        <a key={listing._id} href={`/listing/${listing._id}`} className="profile-listing-card">
                          <div className="profile-listing-img-wrap">
                            {imgUrl ? (
                              <img src={imgUrl} alt={listing.title} className="profile-listing-img" loading="lazy" />
                            ) : (
                              <div className="profile-listing-img profile-listing-img-placeholder">No Image</div>
                            )}
                          </div>
                          <div className="profile-listing-info">
                            <span className="profile-listing-name">{listing.title}</span>
                            <span className="profile-listing-price">${listing.price}</span>
                            <span className={`profile-listing-status profile-listing-status--${listing.status.toLowerCase()}`}>
                              {listing.status}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
                {isOwnProfile && (
                  <a href="/shop/new-listing" className="profile-new-listing-btn">+ Create New Listing</a>
                )}
              </>
            )}

            {rightTab === "purchases" && (
              <TransactionsPanel userId={authUserId} filter="purchases" />
            )}

            {rightTab === "sales" && (
              <TransactionsPanel userId={authUserId} filter="sales" />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
