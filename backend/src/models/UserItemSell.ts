import mongoose, { Schema } from "mongoose";
import { IUserItemSell } from "../types";

const UserItemSellSchema = new Schema<IUserItemSell>(
  {
    sellerId: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    dailyRate: { type: Number, default: 0 },
    cloudinaryUrl: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    tags: { type: [String], default: [] },
    bbLink: { type: String },
    status: {
      type: String,
      enum: ["Draft", "Live", "Paused", "Sold"],
      default: "Live",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserItemSell>("UserItemSell", UserItemSellSchema);
