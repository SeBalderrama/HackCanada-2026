export interface NominatimAddress {
  house_number?: string;
  road?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}

export function formatSimpleAddress(address?: NominatimAddress): string {
  if (!address) return "";

  const street = [address.house_number, address.road].filter(Boolean).join(" ").trim();
  const postal = address.postcode?.trim() ?? "";
  const city = (address.city || address.town || address.village || address.county || address.state || "").trim();
  const country = (address.country || "").trim();

  return [street, postal, city, country].filter(Boolean).join(", ");
}

export async function geocodeAddressToCoords(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    const lat = Number(data[0].lat);
    const lng = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function reverseGeocodeToSimpleAddress(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(
        String(latitude),
      )}&lon=${encodeURIComponent(String(longitude))}`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };
    const simple = formatSimpleAddress(data.address);
    return simple || data.display_name || null;
  } catch {
    return null;
  }
}
