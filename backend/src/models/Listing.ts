import mongoose, { Schema } from "mongoose";
import { IListing } from "../types";

const ListingSchema = new Schema<IListing>(
  {
    sellerId: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    size: { type: String, required: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    images: { type: [String], default: [] },
    cloudinaryTags: { type: [String], default: [] },
    geminiKeywords: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Live", "Draft", "Paused"],
      default: "Draft",
    },
    views: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IListing>("Listing", ListingSchema);
