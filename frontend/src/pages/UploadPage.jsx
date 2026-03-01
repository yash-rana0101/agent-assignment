import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const ACCEPTED_TYPES = [".csv", ".xlsx", ".xls"];

/**
 * Upload page - lets admin upload a CSV/XLSX file.
 * Shows a preview of the distribution result after upload.
 */
const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Validate file extension on selection
  const validateFile = (selected) => {
    if (!selected) return false;
    const ext = "." + selected.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast.error("Only .csv, .xlsx and .xls files are accepted");
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (validateFile(selected)) {
      setFile(selected);
      setResult(null);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (validateFile(dropped)) {
      setFile(dropped);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const { data } = await api.post("/lists/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setFile(null);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Upload CSV / Excel</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a file with FirstName, Phone and Notes columns. Tasks will be
          distributed equally among all registered agents.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-4 sm:px-6 py-10 sm:py-14 text-center cursor-pointer transition-colors ${dragOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {file ? (
          <div>
            <p className="text-sm font-medium text-blue-600">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / 1024).toFixed(1)} KB — Click to change
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-600">
              Drag &amp; drop a file here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Accepts .csv, .xlsx, .xls (max 10MB)</p>
          </div>
        )}
      </div>

      {/* Expected format info */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm font-medium text-amber-700 mb-2">Expected column headers:</p>
        <div className="flex gap-3 flex-wrap">
          {["FirstName", "Phone", "Notes"].map((col) => (
            <span key={col} className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-mono">
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-amber-600 mt-2">
          Headers are case-insensitive. Extra columns are ignored.
        </p>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Upload & Distribute"
        )}
      </button>

      {/* Result summary */}
      {result && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Distribution Complete</p>
              <p className="text-xs text-gray-500">
                {result.totalItems} items distributed among {result.agentsCount} agents
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {result.distribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">
                      {item.agent?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.agent?.name}</span>
                </div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full">
                  {item.taskCount} tasks
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard/lists")}
            className="mt-4 w-full text-center text-sm text-blue-600 hover:underline"
          >
            View all distributed lists →
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
