import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and makes user/auth state
 * accessible to all child components via the useAuth hook.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore user from localStorage if a token exists
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Set the token on the axios instance so every request includes it
        api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      } catch {
        // If stored data is corrupted, clear it
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Log in: call the API, store user data and token.
   */
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    return data;
  };

  /**
   * Log out: clear state and storage.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 * Must be used inside an AuthProvider.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
