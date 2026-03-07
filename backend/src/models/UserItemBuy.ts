import mongoose, { Schema } from "mongoose";
import { IUserItemBuy } from "../types";

const UserItemBuySchema = new Schema<IUserItemBuy>({
  itemId: { type: String, required: true },
  buyerId: { type: String, required: true },
  sellerId: { type: String, default: "" },
  purchaseDate: { type: Date, default: Date.now },
  cloudinaryUrl: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  tags: { type: [String], default: [] },
});

export default mongoose.model<IUserItemBuy>("UserItemBuy", UserItemBuySchema);
