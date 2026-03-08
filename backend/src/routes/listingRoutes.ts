import { Router } from "express";
import multer from "multer";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  purchaseListing,
} from "../controllers/listingController";
import { generateListingContent } from "../services/geminiService";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/generate-content", async (req, res) => {
  try {
    const { imageUrl } = req.body as { imageUrl?: string };
    if (!imageUrl) { res.status(400).json({ error: "imageUrl required" }); return; }
    const result = await generateListingContent(imageUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Gemini generation failed" });
  }
});

router.get("/", getAllListings);
router.get("/:id", getListingById);
router.post("/", upload.single("image"), createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);
router.post("/:id/purchase", purchaseListing);

export default router;
