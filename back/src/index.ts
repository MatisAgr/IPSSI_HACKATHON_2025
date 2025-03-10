import express, { Application } from "express";
import * as dotenv from "dotenv"; // Correct import
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

// Connexion à MongoDB (supprime les options obsolètes)
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error("Erreur MongoDB :", err));

app.get("/", (req, res) => {
  res.send("🚀 API Tweeter en TypeScript est opérationnelle !");
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
