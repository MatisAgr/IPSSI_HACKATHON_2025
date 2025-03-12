import express, { Application } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // URL de votre frontend
    credentials: true
  }
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string, {
    user: process.env.MONGO8_USER,
    pass: process.env.MONGO8_PASSWORD,
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

// Apply API routes
app.use("/api", routes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // Authentifier l'utilisateur et stocker son ID
  socket.on("authenticate", (userId) => {
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
    socket.data.userId = userId;
    // Joindre une salle spécifique à cet utilisateur pour les notifications
    socket.join(`user:${userId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Exporter io pour l'utiliser dans d'autres fichiers
export { io };

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));