import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return;
    api("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const r = await api(path, { method: "POST", body });
    tokenStore.set(r.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const value = {
    user,
    loading,
    login: (email, password) => authenticate("/auth/login", { email, password }),
    register: (form) => authenticate("/auth/register", form),
    logout: async () => {
      try {
        await api("/auth/logout", { method: "POST" });
      } catch {
        /* logging out locally is enough */
      }
      tokenStore.clear();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
