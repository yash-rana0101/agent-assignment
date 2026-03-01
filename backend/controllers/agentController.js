const Agent = require("../models/Agent");

/**
 * @route   GET /api/agents
 * @desc    Get all agents (password excluded)
 * @access  Private
 */
const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(agents);
  } catch (error) {
    console.error("Get agents error:", error.message);
    res.status(500).json({ message: "Server error while fetching agents" });
  }
};

/**
 * @route   POST /api/agents
 * @desc    Create a new agent
 * @access  Private
 */
const createAgent = async (req, res) => {
  const { name, email, mobile, countryCode, password } = req.body;

  // Validate required fields
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  // Basic email format check
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  // Password length check
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Check for duplicate email
    const existingAgent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (existingAgent) {
      return res.status(409).json({ message: "An agent with this email already exists" });
    }

    const agent = await Agent.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      countryCode: countryCode || "+91",
      password,
    });

    // Return created agent without password
    res.status(201).json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      countryCode: agent.countryCode,
      createdAt: agent.createdAt,
    });
  } catch (error) {
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "An agent with this email already exists" });
    }
    console.error("Create agent error:", error.message);
    res.status(500).json({ message: "Server error while creating agent" });
  }
};

/**
 * @route   DELETE /api/agents/:id
 * @desc    Delete an agent by ID
 * @access  Private
 */
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    await agent.deleteOne();
    res.status(200).json({ message: "Agent removed successfully" });
  } catch (error) {
    console.error("Delete agent error:", error.message);
    res.status(500).json({ message: "Server error while deleting agent" });
  }
};

module.exports = { getAgents, createAgent, deleteAgent };
