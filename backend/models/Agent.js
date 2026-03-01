const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Agent schema - represents field agents who will receive distributed tasks.
 * Each agent has contact details and a hashed password.
 */
const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Agent name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    // Mobile number stored with country code, e.g. "+91 9876543210"
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      default: "+91",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  { timestamps: true }
);

// Hash password before saving
agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Agent", agentSchema);
