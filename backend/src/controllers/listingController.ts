import { Request, Response } from "express";
import UserItemSell from "../models/UserItemSell";
import UserItemBuy from "../models/UserItemBuy";
import { uploadImage } from "../services/cloudinaryService";
import { generateBBLink } from "../services/backboardService";
import { CreateListingBody, PurchaseBody } from "../types";

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const filter = statusFilter ? { status: statusFilter } : {};
    const listings = await UserItemSell.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const listing = await UserItemSell.findById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const { title, description, price, dailyRate, tags, sellerId } =
      req.body as CreateListingBody;

    if (!title || !description || price == null) {
      res.status(400).json({ error: "title, description, and price are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "image file is required" });
      return;
    }

    // Upload to Cloudinary
    const cloudResult = await uploadImage(req.file.buffer, req.file.originalname);

    // Check for duplicate publicId
    const existing = await UserItemSell.findOne({ publicId: cloudResult.publicId });
    if (existing) {
      res.status(409).json({ error: "Duplicate listing for this image" });
      return;
    }

    // Optionally generate Backboard vector link
    const bbLink = await generateBBLink(cloudResult.url, title, description);

    // Merge auto-tags from Cloudinary with user-supplied tags
    const mergedTags = [
      ...new Set([...(tags ?? []), ...cloudResult.tags]),
    ];

    const listing = new UserItemSell({
      sellerId: sellerId ?? "",
      title,
      description,
      price,
      dailyRate: dailyRate ?? 0,
      cloudinaryUrl: cloudResult.url,
      publicId: cloudResult.publicId,
      tags: mergedTags,
      bbLink: bbLink || undefined,
      status: "Live",
    });

    await listing.save();

    res.status(201).json({
      success: true,
      item: {
        itemId: listing._id,
        sellerId: listing.sellerId,
        title: listing.title,
        description: listing.description,
        cloudinaryUrl: listing.cloudinaryUrl,
        publicId: listing.publicId,
        tags: listing.tags,
        bbLink: listing.bbLink,
        status: listing.status,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      },
    });
  } catch (error: any) {
    const message = error?.message || "Failed to create listing";
    res.status(500).json({ error: message });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const listing = await UserItemSell.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
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
    const listing = await UserItemSell.findByIdAndDelete(req.params.id);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

export const purchaseListing = async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.body as PurchaseBody;
    if (!buyerId) {
      res.status(400).json({ error: "buyerId is required" });
      return;
    }

    const item = await UserItemSell.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (item.status === "Sold") {
      res.status(410).json({ error: "Item is already sold" });
      return;
    }

    if (item.sellerId && item.sellerId === buyerId) {
      res.status(400).json({ error: "Cannot purchase your own listing" });
      return;
    }

    // Create purchase record
    const purchase = new UserItemBuy({
      itemId: item._id,
      buyerId,
      sellerId: item.sellerId,
      purchaseDate: new Date(),
      cloudinaryUrl: item.cloudinaryUrl,
      title: item.title,
      price: item.price,
      tags: item.tags,
    });
    await purchase.save();

    // Mark listing as sold
    item.status = "Sold";
    await item.save();

    res.status(201).json({
      success: true,
      purchase: {
        purchaseId: purchase._id,
        itemId: purchase.itemId,
        buyerId: purchase.buyerId,
        title: purchase.title,
        price: purchase.price,
        cloudinaryUrl: purchase.cloudinaryUrl,
        purchaseDate: purchase.purchaseDate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Purchase failed" });
  }
};
