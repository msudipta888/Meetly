// index.js
import http from "http";
import express from "express";
import cors from "cors";
import { Server as IOServer } from "socket.io";
import "dotenv/config";
import { MediaSoup } from "./mediasoup.js";
import { clerkMiddleware, createClerkClient, verifyToken } from "@clerk/express";
import rateLimit from "express-rate-limit";
import prisma from "./db/prisma.js";
import apiRoutes from "./routes/api.js";

const PORT = process.env.PORT || 8000;
const corsOptions = {
  origin: ["https://d2f8-103-101-212-190.ngrok-free.app", "http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors(corsOptions));
// app.use(limiter);
const httpServer = http.createServer(app);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export const io = new IOServer(httpServer, {
  cors: corsOptions,
});

// io.use middleware handles Clerk token verification
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers["authorization"]?.split(" ")[1];
    if (!token) {
      console.error("Socket Auth Error: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }
    const sessionClaims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    socket.user = sessionClaims;
    socket.userId = sessionClaims.sub;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

app.use(express.json());
app.use(clerkMiddleware());

// Connect to DB with retry logic for Neon cold starts
const ConnectDb = async (retries = 3) => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    if (retries > 0) {
      console.log(`Problem with database connection, retrying in 3s... (${retries} retries left)`);
      setTimeout(() => ConnectDb(retries - 1), 3000);
    } else {
      console.error("Failed to connect to database after several attempts:", error);
    }
  }
};
ConnectDb();

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Mount all API routes under /api
app.use("/api", apiRoutes);

// Start Mediasoup
MediaSoup(io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
