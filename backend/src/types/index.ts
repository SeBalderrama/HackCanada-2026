import { Document } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  username: string;
  backboardProfileRef?: string;
  styleProfileJSON?: object;
}

export interface IUserItemSell extends Document {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  dailyRate: number;
  cloudinaryUrl: string;
  publicId: string;
  tags: string[];
  bbLink?: string;
  status: "Draft" | "Live" | "Paused" | "Sold";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserItemBuy extends Document {
  itemId: string;
  buyerId: string;
  sellerId: string;
  purchaseDate: Date;
  cloudinaryUrl: string;
  title: string;
  price: number;
  tags: string[];
}

export interface CreateListingBody {
  sellerId?: string;
  title: string;
  description: string;
  price: number;
  dailyRate: number;
  tags?: string[];
}

export interface PurchaseBody {
  buyerId: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  tags: string[];
}
