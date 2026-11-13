import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => socket.join(userId));
  socket.on("disconnect", () => {});
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
