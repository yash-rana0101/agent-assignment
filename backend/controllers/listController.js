const { Readable } = require("stream");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const Agent = require("../models/Agent");
const TaskList = require("../models/TaskList");

/**
 * Parse a CSV buffer and return an array of task objects.
 * Uses csv-parser on a Readable stream created from the in-memory buffer.
 * @param {Buffer} buffer
 * @returns {Promise<Array>}
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    // Create a readable stream from the buffer so csv-parser can consume it
    const stream = Readable.from(buffer.toString("utf-8"));
    stream
      .pipe(csv())
      .on("data", (row) => {
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[key.trim().toLowerCase()] = String(row[key]).trim();
        });
        results.push({
          firstName: normalizedRow["firstname"] || normalizedRow["first_name"] || "",
          phone: normalizedRow["phone"] || normalizedRow["mobile"] || "",
          notes: normalizedRow["notes"] || normalizedRow["note"] || "",
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

/**
 * Parse an XLSX / XLS buffer and return an array of task objects.
 * @param {Buffer} buffer
 * @returns {Array}
 */
const parseXLSX = (buffer) => {
  // XLSX.read() works directly with a Buffer — no filesystem needed
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rows.map((row) => {
    const normalizedRow = {};
    Object.keys(row).forEach((key) => {
      normalizedRow[key.trim().toLowerCase()] = String(row[key]).trim();
    });
    return {
      firstName: normalizedRow["firstname"] || normalizedRow["first_name"] || "",
      phone: normalizedRow["phone"] || normalizedRow["mobile"] || "",
      notes: normalizedRow["notes"] || normalizedRow["note"] || "",
    };
  });
};


/**
 * Distribute an array of items equally among agents.
 * Remaining items (when not evenly divisible) are assigned sequentially.
 *
 * @param {Array} items   - All task items from the file
 * @param {Array} agents  - Array of agent documents
 * @returns {Array}       - Array of { agent, tasks[] }
 */
const distributeItems = (items, agents) => {
  const totalAgents = agents.length;
  const distribution = agents.map((agent) => ({ agent, tasks: [] }));

  items.forEach((item, index) => {
    // Round-robin assignment guarantees sequential distribution of remainders
    const agentIndex = index % totalAgents;
    distribution[agentIndex].tasks.push(item);
  });

  return distribution;
};

/**
 * @route   POST /api/lists/upload
 * @desc    Upload a CSV/XLSX buffer and distribute rows among agents.
 *          Uses req.file.buffer (memoryStorage) — no disk I/O needed.
 * @access  Private
 */
const uploadAndDistribute = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const originalFileName = req.file.originalname;
  const ext = path.extname(originalFileName).toLowerCase();
  const buffer = req.file.buffer; // in-memory buffer from multer memoryStorage

  try {
    // Step 1: Parse the buffer based on file extension
    let parsedItems = [];

    if (ext === ".csv") {
      parsedItems = await parseCSV(buffer);
    } else if (ext === ".xlsx" || ext === ".xls") {
      parsedItems = parseXLSX(buffer);
    } else {
      return res.status(400).json({ message: "Unsupported file format. Use .csv, .xlsx, or .xls" });
    }

    // Step 2: Filter out completely empty rows
    const validItems = parsedItems.filter(
      (item) => item.firstName.trim() !== "" || item.phone.trim() !== ""
    );

    if (validItems.length === 0) {
      return res.status(400).json({
        message: "The file is empty or does not match expected columns (FirstName, Phone, Notes)",
      });
    }

    // Step 3: Get all agents from the database
    const agents = await Agent.find().select("-password");
    if (agents.length === 0) {
      return res.status(400).json({
        message: "No agents found. Please add agents before uploading a list.",
      });
    }

    // Step 4: Distribute items round-robin among agents
    const distribution = distributeItems(validItems, agents);

    // Step 5: Unique batch ID to group all distributions from this upload
    const batchId = Date.now().toString(36) + Math.random().toString(36).slice(2);

    // Step 6: Persist each agent's task list
    const savedLists = await Promise.all(
      distribution.map(({ agent, tasks }) =>
        TaskList.create({ agent: agent._id, tasks, batchId, originalFileName })
      )
    );

    res.status(201).json({
      message: `Successfully distributed ${validItems.length} items among ${agents.length} agents`,
      batchId,
      totalItems: validItems.length,
      agentsCount: agents.length,
      distribution: savedLists.map((list) => ({
        agent: agents.find((a) => a._id.toString() === list.agent.toString()),
        taskCount: list.tasks.length,
        listId: list._id,
      })),
    });
  } catch (error) {
    console.error("Upload and distribute error:", error.message);
    res.status(500).json({ message: "Server error while processing the file" });
  }
};

/**
 * @route   GET /api/lists
 * @desc    Get all distributed task lists grouped by agent
 * @access  Private
 */
const getAllLists = async (req, res) => {
  try {
    const lists = await TaskList.find()
      .populate("agent", "name email mobile countryCode")
      .sort({ createdAt: -1 });

    res.status(200).json(lists);
  } catch (error) {
    console.error("Get lists error:", error.message);
    res.status(500).json({ message: "Server error while fetching lists" });
  }
};

/**
 * @route   GET /api/lists/batches
 * @desc    Get all unique batch IDs with summary info
 * @access  Private
 */
const getBatches = async (req, res) => {
  try {
    const batches = await TaskList.aggregate([
      {
        $group: {
          _id: "$batchId",
          fileName: { $first: "$originalFileName" },
          totalTasks: { $sum: { $size: "$tasks" } },
          agentCount: { $sum: 1 },
          uploadedAt: { $first: "$createdAt" },
        },
      },
      { $sort: { uploadedAt: -1 } },
    ]);

    res.status(200).json(batches);
  } catch (error) {
    console.error("Get batches error:", error.message);
    res.status(500).json({ message: "Server error while fetching batches" });
  }
};

/**
 * @route   GET /api/lists/batch/:batchId
 * @desc    Get all agent task lists for a specific upload batch
 * @access  Private
 */
const getBatchById = async (req, res) => {
  try {
    const lists = await TaskList.find({ batchId: req.params.batchId })
      .populate("agent", "name email mobile countryCode")
      .sort({ createdAt: 1 });

    if (!lists || lists.length === 0) {
      return res.status(404).json({ message: "No lists found for this batch" });
    }

    res.status(200).json(lists);
  } catch (error) {
    console.error("Get batch by ID error:", error.message);
    res.status(500).json({ message: "Server error while fetching batch" });
  }
};

module.exports = { uploadAndDistribute, getAllLists, getBatches, getBatchById };
