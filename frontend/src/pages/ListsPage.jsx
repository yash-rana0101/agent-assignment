import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

/**
 * Lists page - shows all upload batches and the tasks assigned to each agent.
 */
const ListsPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchLists, setBatchLists] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingLists, setLoadingLists] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);

  // Load all batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await api.get("/lists/batches");
        setBatches(data);
        // Auto-select the most recent batch
        if (data.length > 0) {
          handleSelectBatch(data[0]._id);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load batches");
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  // Load lists for a selected batch
  const handleSelectBatch = async (batchId) => {
    setSelectedBatch(batchId);
    setActiveAgent(null);
    setLoadingLists(true);
    try {
      const { data } = await api.get(`/lists/batch/${batchId}`);
      setBatchLists(data);
      if (data.length > 0) setActiveAgent(data[0].agent._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load lists");
    } finally {
      setLoadingLists(false);
    }
  };

  const activeLists = batchLists.find((l) => l.agent._id === activeAgent);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Distributed Lists</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse uploaded batches and view each agent's assigned tasks
        </p>
      </div>

      {loadingBatches ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-sm">No uploads yet.</p>
          <p className="text-gray-400 text-xs mt-1">Go to "Upload CSV" to distribute a list.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-5">
          {/* ── Batch selector ── */}
          <div className="w-full md:w-64 md:flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
              Upload Batches
            </p>
            {/* Horizontal scroll on mobile, vertical stack on md+ */}
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 md:overflow-x-visible">
              {batches.map((batch) => (
                <button
                  key={batch._id}
                  onClick={() => handleSelectBatch(batch._id)}
                  className={`flex-shrink-0 w-56 md:w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${selectedBatch === batch._id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                    }`}
                >
                  <p className="font-medium truncate">{batch.fileName || "Unnamed File"}</p>
                  <p className={`text-xs mt-0.5 ${selectedBatch === batch._id ? "text-blue-100" : "text-gray-400"}`}>
                    {batch.totalTasks} tasks • {batch.agentCount} agents
                  </p>
                  <p className={`text-xs mt-0.5 ${selectedBatch === batch._id ? "text-blue-200" : "text-gray-300"}`}>
                    {new Date(batch.uploadedAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Agent tabs + task table ── */}
          <div className="flex-1 min-w-0">
            {loadingLists ? (
              <div className="flex justify-center py-20">
                <svg className="animate-spin w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : (
              <>
                {/* Agent tabs – scrollable on mobile */}
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1">
                  {batchLists.map((list) => (
                    <button
                      key={list.agent._id}
                      onClick={() => setActiveAgent(list.agent._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${activeAgent === list.agent._id
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeAgent === list.agent._id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                        {list.agent.name.charAt(0).toUpperCase()}
                      </div>
                      {list.agent.name}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeAgent === list.agent._id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                        {list.tasks.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Task table */}
                {activeLists && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{activeLists.agent.name}</p>
                        <p className="text-xs text-gray-400">{activeLists.agent.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activeLists.tasks.length} task{activeLists.tasks.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                            <th className="text-left px-4 py-3 w-8">#</th>
                            <th className="text-left px-4 py-3">First Name</th>
                            <th className="text-left px-4 py-3">Phone</th>
                            <th className="text-left px-4 py-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeLists.tasks.map((task, idx) => (
                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{task.firstName}</td>
                              <td className="px-4 py-3 text-gray-600 font-mono text-xs">{task.phone}</td>
                              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                {task.notes || <span className="text-gray-300 italic">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListsPage;
