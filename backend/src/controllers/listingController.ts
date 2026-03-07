import { Request, Response } from "express";
import Listing from "../models/Listing";
import { CreateListingBody } from "../types";

export const getAllListings = async (_req: Request, res: Response) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};

export const createListing = async (
  req: Request<{}, {}, CreateListingBody>,
  res: Response
) => {
  try {
    const { title, description, price, size, imageUrl, publicId, cloudinaryTags, dailyRate } =
      req.body;

    const listing = new Listing({
      title,
      description,
      price: price ?? 0,
      size,
      imageUrl,
      publicId,
      images: imageUrl ? [imageUrl] : [],
      cloudinaryTags: cloudinaryTags ?? [],
      dailyRate: dailyRate ?? 0,
      status: "Draft",
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to create listing" });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to update listing" });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
};
