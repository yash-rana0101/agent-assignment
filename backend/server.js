const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables before anything else
dotenv.config();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

// Parse incoming JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Connect to DB lazily on first request — required for Vercel serverless where
// the module is evaluated fresh on cold starts and there's no persistent process.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection middleware error:", err.message);
    res.status(503).json({ message: "Database unavailable, please try again" });
  }
});

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
app.use("/api/seed", require("./routes/seedRoutes"));

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

// ─── Start Server (local dev only) ───────────────────────────────────────────

// On Vercel, the app is exported as a serverless function — no listen() needed.
// Locally, we still start the HTTP server normally.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Required by Vercel — it imports this file as the serverless handler
module.exports = app;
