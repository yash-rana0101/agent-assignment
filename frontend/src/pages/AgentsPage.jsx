import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import AddAgentModal from "../components/AddAgentModal";

/**
 * Agents page - lists all agents and allows adding/deleting them.
 */
const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch agents from the API
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/agents");
      setAgents(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Called after a new agent is successfully created
  const handleAgentAdded = (newAgent) => {
    setAgents((prev) => [newAgent, ...prev]);
    setShowModal(false);
    toast.success("Agent added successfully!");
  };

  // Delete an agent
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this agent?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a._id !== id));
      toast.success("Agent removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete agent");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Agents</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
            Manage field agents who receive distributed task lists
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Agent</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No agents found.</p>
          <p className="text-gray-400 text-xs mt-1">Tap "Add" to get started.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span className="col-span-2">Agent</span>
              <span>Mobile</span>
              <span>Added On</span>
              <span className="text-right">Actions</span>
            </div>
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">{agent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{agent.name}</p>
                    <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{agent.countryCode} {agent.mobile}</span>
                <span className="text-sm text-gray-500">
                  {new Date(agent.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <div className="flex justify-end">
                  <button onClick={() => handleDelete(agent._id)} disabled={deletingId === agent._id}
                    className="text-red-400 hover:text-red-600 disabled:opacity-40 p-1.5 rounded-lg hover:bg-red-50" title="Remove agent">
                    {deletingId === agent._id ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {agents.map((agent) => (
              <div key={agent._id} className="bg-white rounded-xl border border-gray-200 px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{agent.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{agent.name}</p>
                      <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(agent._id)} disabled={deletingId === agent._id}
                    className="text-red-400 hover:text-red-600 disabled:opacity-40 p-2 rounded-lg hover:bg-red-50 flex-shrink-0">
                    {deletingId === agent._id ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>📱 {agent.countryCode} {agent.mobile}</span>
                  <span>🗓 {new Date(agent.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <AddAgentModal onClose={() => setShowModal(false)} onSuccess={handleAgentAdded} />
      )}
    </div>
  );
};

export default AgentsPage;
