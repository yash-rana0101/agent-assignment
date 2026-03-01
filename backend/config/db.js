const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google's public DNS (8.8.8.8) instead of the system
// resolver. This fixes "querySrv ECONNREFUSED" on networks where ISP/Windows
// DNS does not support SRV record lookups required by mongodb+srv:// URIs.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 4000;

/**
 * Connect to MongoDB with retry logic.
 * Retries up to MAX_RETRIES times before giving up and exiting.
 */
const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 – fixes querySrv ECONNREFUSED on Windows
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

    if (error.message.includes("querySrv") || error.message.includes("ECONNREFUSED")) {
      console.error(
        "\n⚠️  Tip: If using MongoDB Atlas, make sure your current IP is whitelisted.\n" +
        "   Go to: https://cloud.mongodb.com → Network Access → Add IP Address\n"
      );
    }

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    console.error("Could not connect to MongoDB after multiple attempts. Exiting.");
    process.exit(1);
  }
};

module.exports = connectDB;
