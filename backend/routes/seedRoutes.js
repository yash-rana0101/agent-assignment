const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * @route   GET /api/seed?secret=<SEED_SECRET>
 * @desc    One-time endpoint to create the admin user on hosted environments.
 *          Protected by a secret query param. Safe to leave in — it won't
 *          overwrite an existing admin.
 * @access  Public (but secret-gated)
 */
router.get("/", async (req, res) => {
  // Validate secret
  if (req.query.secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid seed secret" });
  }

  try {
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      return res.status(200).json({
        message: "Admin already exists — nothing to do.",
        email: existing.email,
      });
    }

    const admin = await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin user created successfully!",
      email: admin.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
