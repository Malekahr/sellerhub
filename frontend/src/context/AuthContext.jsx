import { createContext, useContext, useEffect, useState } from "react";

import { apiGet, getToken, removeToken } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  async function refreshCurrentUser() {
    const token = getToken();

    if (!token) {
      setCurrentUser(null);
      return null;
    }

    try {
      const user = await apiGet("/users/me");
      setCurrentUser(user);
      return user;
    } catch {
      removeToken();
      setCurrentUser(null);
      return null;
    }
  }

  function logout() {
    removeToken();
    setCurrentUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      setIsAuthLoading(true);
      await refreshCurrentUser();
      setIsAuthLoading(false);
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        refreshCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}