import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";


dotenv.config();

const app = express();

// Middlewares FIRST
const allowedOrigins = [
  "http://localhost:5173",
  "https://jam-verse4-seven.vercel.app",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guard", guardRoutes);
app.use("/template", express.static("template"));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JamVerse API Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
