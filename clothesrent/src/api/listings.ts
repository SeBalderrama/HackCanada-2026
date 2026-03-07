import { apiFetch, apiFormFetch } from "./client";
import type {
  Listing,
  Purchase,
  CreateListingResponse,
  PurchaseResponse,
} from "../types/listing";

export async function fetchListings(status?: string): Promise<Listing[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<Listing[]>(`/api/listings${query}`);
}

export async function fetchListingById(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${id}`);
}

export async function createListing(
  formData: FormData
): Promise<CreateListingResponse> {
  return apiFormFetch<CreateListingResponse>("/api/listings", formData);
}

export async function updateListing(
  id: string,
  data: Partial<Listing>
): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteListing(
  id: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/listings/${id}`, {
    method: "DELETE",
  });
}

export async function purchaseListing(
  id: string,
  buyerId: string
): Promise<PurchaseResponse> {
  return apiFetch<PurchaseResponse>(`/api/listings/${id}/purchase`, {
    method: "POST",
    body: JSON.stringify({ buyerId }),
  });
}

export async function searchListings(query: string): Promise<Listing[]> {
  return apiFetch<Listing[]>("/api/style/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function fetchPurchases(): Promise<Purchase[]> {
  return apiFetch<Purchase[]>("/api/purchases");
}
