const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

// Parse incoming JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Allow cross-origin requests from both local dev and deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // set this to your Vercel frontend URL in production
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/agents", require("./routes/agentRoutes"));
app.use("/api/lists", require("./routes/listRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);

  // Multer file type error
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
