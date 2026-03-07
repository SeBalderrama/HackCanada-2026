import { Document } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  username: string;
  backboardProfileRef?: string;
  styleProfileJSON?: object;
}

export interface IListing extends Document {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  size: string;
  imageUrl: string;
  publicId: string;
  images: string[];
  cloudinaryTags: string[];
  geminiKeywords: string[];
  status: "Live" | "Draft" | "Paused";
  views: number;
  dailyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingBody {
  title: string;
  description: string;
  price?: number;
  size: string;
  imageUrl: string;
  publicId: string;
  cloudinaryTags?: string[];
  dailyRate?: number;
}
