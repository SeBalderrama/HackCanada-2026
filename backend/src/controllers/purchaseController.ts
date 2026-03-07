import { Request, Response } from "express";
import UserItemBuy from "../models/UserItemBuy";

export const getAllPurchases = async (_req: Request, res: Response) => {
  try {
    const purchases = await UserItemBuy.find().sort({ purchaseDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};

export const getPurchasesByBuyer = async (req: Request, res: Response) => {
  try {
    const purchases = await UserItemBuy.find({
      buyerId: req.params.buyerId,
    }).sort({ purchaseDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};
