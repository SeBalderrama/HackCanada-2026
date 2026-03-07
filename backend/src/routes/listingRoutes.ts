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

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getAllListings);
router.get("/:id", getListingById);
router.post("/", upload.single("image"), createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);
router.post("/:id/purchase", purchaseListing);

export default router;
