const express = require("express");
const router = express.Router();
const {
  getAgents,
  createAgent,
  deleteAgent,
} = require("../controllers/agentController");
const { protect } = require("../middleware/authMiddleware");

// All agent routes are protected - require authentication
router.use(protect);

// @route GET  /api/agents   - List all agents
// @route POST /api/agents   - Create a new agent
router.route("/").get(getAgents).post(createAgent);

// @route DELETE /api/agents/:id  - Remove an agent
router.route("/:id").delete(deleteAgent);

module.exports = router;
