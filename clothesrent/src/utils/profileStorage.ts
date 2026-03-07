export interface UserProfileData {
  name: string;
  style: string;
  picture: string;
  location: string;
}

export const PROFILE_UPDATED_EVENT = "profile-updated";

export function getProfileStorageKey(userId: string): string {
  return `clothesrent-profile-${userId || "anonymous"}`;
}

export function loadUserProfile(
  userId: string,
  fallback: UserProfileData,
): UserProfileData {
  const storageKey = getProfileStorageKey(userId);
  const raw = localStorage.getItem(storageKey);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfileData>;
    return {
      name: parsed.name || fallback.name,
      style: parsed.style || fallback.style,
      picture: parsed.picture || fallback.picture,
      location: parsed.location || fallback.location,
    };
  } catch {
    return fallback;
  }
}

export function saveUserProfile(userId: string, profile: UserProfileData): void {
  const storageKey = getProfileStorageKey(userId);
  localStorage.setItem(storageKey, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile }));
}
