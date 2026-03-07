import { Request, Response } from "express";
import { analyzeStyle } from "../services/geminiService";
import { searchByStyle } from "../services/backboardService";
import UserItemSell from "../models/UserItemSell";

export const analyzeStyleFromImages = async (req: Request, res: Response) => {
  try {
    const { images } = req.body as { images: string[] };
    if (!images || !images.length) {
      res.status(400).json({ error: "images array is required" });
      return;
    }
    const result = await analyzeStyle(images);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Style analysis failed" });
  }
};

export const searchListingsByStyle = async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };
    if (!query) {
      res.status(400).json({ error: "query is required" });
      return;
    }

    const listingIds = await searchByStyle(query);

    if (listingIds.length === 0) {
      // Fallback: text search on description / title / tags
      const listings = await UserItemSell.find({
        status: "Live",
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      }).limit(20);
      res.json(listings);
      return;
    }

    const listings = await UserItemSell.find({ _id: { $in: listingIds } });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Style search failed" });
  }
};
