import { Router } from "express";
import multer from "multer";
import { uploadImageOnly } from "../controllers/uploadController";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/", upload.single("image"), uploadImageOnly);

export default router;
