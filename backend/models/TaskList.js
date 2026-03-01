const mongoose = require("mongoose");

/**
 * Task item sub-schema - each row from the uploaded CSV file.
 * Contains FirstName, Phone, and Notes fields.
 */
const taskItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    default: "",
    trim: true,
  },
});

/**
 * TaskList schema - holds all distributed items for a specific upload batch.
 * Each entry links an agent to their assigned list of tasks.
 */
const taskListSchema = new mongoose.Schema(
  {
    // Reference to the agent this list belongs to
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    // The actual task items assigned to this agent
    tasks: [taskItemSchema],
    // Batch identifier - groups all distributions from a single upload
    batchId: {
      type: String,
      required: true,
    },
    // Original file name for reference
    originalFileName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskList", taskListSchema);
