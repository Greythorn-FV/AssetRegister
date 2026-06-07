// src/context/AuthContext.jsx
// Authentication Context - Simple temporary login for internal/shared access.
//
// NOTE: This is a lightweight, client-side-only login intended for temporary
// internal use. It checks a hardcoded list of allowed emails against a shared
// password. It does NOT use Firebase Auth and provides no real security — anyone
// who can read the bundled JS can see these credentials. Replace with proper
// authentication before exposing this app publicly.

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Temporary hardcoded credentials -------------------------------------
// Allowed emails (case-insensitive). All share the same password below.
const ALLOWED_EMAILS = [
  'rp@greythorn.services',
  'nlb@greythorn.services',
  'visitor@greythorn.services'
];
const SHARED_PASSWORD = 'Awesome1!';
const STORAGE_KEY = 'asset-register-auth-user';
// -------------------------------------------------------------------------

// Read the persisted user from storage (session or local) on first load.
const readStoredUser = () => {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore any persisted session on mount
  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setError(null);

    const normalizedEmail = (email || '').trim().toLowerCase();
    const isAllowedEmail = ALLOWED_EMAILS.includes(normalizedEmail);
    const isCorrectPassword = password === SHARED_PASSWORD;

    // Use a single generic message so we don't reveal which part was wrong.
    if (!isAllowedEmail || !isCorrectPassword) {
      const message = 'Invalid email or password.';
      setError(message);
      return { success: false, error: message };
    }

    const loggedInUser = { email: normalizedEmail };

    try {
      // "Remember me" -> persist across browser sessions; otherwise session-only.
      const store = rememberMe ? window.localStorage : window.sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch {
      // Storage may be unavailable (private mode); the in-memory state below
      // still lets the user use the app for this tab.
    }

    setUser(loggedInUser);
    return { success: true, user: loggedInUser };
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    setUser(null);
    return { success: true };
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
