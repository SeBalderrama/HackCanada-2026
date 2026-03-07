export type ListingStatus = "Draft" | "Live" | "Paused" | "Sold";

export interface Listing {
  _id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  dailyRate: number;
  cloudinaryUrl: string;
  publicId: string;
  tags: string[];
  bbLink?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  _id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  purchaseDate: string;
  cloudinaryUrl: string;
  title: string;
  price: number;
  tags: string[];
}

export interface CreateListingResponse {
  success: boolean;
  item: Listing;
}

export interface PurchaseResponse {
  success: boolean;
  purchase: {
    purchaseId: string;
    itemId: string;
    buyerId: string;
    title: string;
    price: number;
    cloudinaryUrl: string;
    purchaseDate: string;
  };
}
