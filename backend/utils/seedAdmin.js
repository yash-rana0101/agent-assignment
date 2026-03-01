/**
 * Seed script - creates the default admin user in the database.
 * Run with: npm run seed
 *
 * This only needs to run once after setting up the project.
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

const seedAdmin = async () => {
  await connectDB();

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", process.env.ADMIN_PASSWORD || "Admin@123");
    console.log("\nYou can now log in with the above credentials.");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
