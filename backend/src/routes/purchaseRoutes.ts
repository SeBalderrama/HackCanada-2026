import { Router } from "express";
import {
  getAllPurchases,
  getPurchasesByBuyer,
} from "../controllers/purchaseController";

const router = Router();

router.get("/", getAllPurchases);
router.get("/buyer/:buyerId", getPurchasesByBuyer);

export default router;
