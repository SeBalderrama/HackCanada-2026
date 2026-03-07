// Legacy Listing model — kept for reference / migration.
// New code should use UserItemSell and UserItemBuy models.
import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  cloudinaryUrl: string;
  publicId: string;
  tags: string[];
  status: string;
}

const ListingSchema = new Schema<IListing>(
  {
    sellerId: { type: String },
    title: { type: String },
    description: { type: String },
    price: { type: Number, default: 0 },
    cloudinaryUrl: { type: String },
    publicId: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String, default: "Draft" },
  },
  { timestamps: true }
);

export default mongoose.model<IListing>("Listing", ListingSchema);
