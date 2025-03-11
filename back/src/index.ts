import express, { Application } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string, {
    user: process.env.MONGO8_USER,
    pass: process.env.MONGO8_PASSWORD,
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("🚀 Tweeter API in TypeScript is running!");
});

// Apply API routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));