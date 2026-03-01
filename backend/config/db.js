const mongoose = require("mongoose");

// Cache the connection across serverless invocations so Vercel warm instances
// don't reconnect on every request.
let cached = global._mongoConn || null;

/**
 * Connect to MongoDB. Throws on failure so the caller (server.js) can
 * handle gracefully — never calls process.exit() in serverless.
 */
const connectDB = async () => {
  // Reuse existing live connection
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  try {
    cached = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    global._mongoConn = cached;
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return cached;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Throw instead of process.exit — lets Vercel handle the 500 gracefully
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
