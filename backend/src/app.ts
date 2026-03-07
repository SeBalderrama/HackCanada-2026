import express from "express";
import cors from "cors";
import listingRoutes from "./routes/listingRoutes";
import styleRoutes from "./routes/styleRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/listings", listingRoutes);
app.use("/api/style", styleRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
