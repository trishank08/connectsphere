import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, logout }}>{children}</AuthContext.Provider>;
}
