import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import AgentsPage from "./pages/AgentsPage";
import UploadPage from "./pages/UploadPage";
import ListsPage from "./pages/ListsPage";

/**
 * A wrapper that redirects unauthenticated users to login.
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected routes inside the dashboard layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AgentsPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="lists" element={<ListsPage />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
