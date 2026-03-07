import { Router } from "express";
import {
  analyzeStyleFromImages,
  searchListingsByStyle,
} from "../controllers/styleController";

const router = Router();

router.post("/analyze", analyzeStyleFromImages);
router.post("/search", searchListingsByStyle);

export default router;
