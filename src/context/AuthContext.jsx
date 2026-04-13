// src/context/AuthContext.jsx
// Authentication Context - Manages user auth state across the entire app

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig.js';

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

// Allowed email domain
const ALLOWED_DOMAIN = 'greythorn.services';

// Validate email domain
const validateEmailDomain = (email) => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === ALLOWED_DOMAIN;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setError(null);
    try {
      // Set persistence based on "remember me" choice
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (err) {
      let message = 'Login failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        default:
          message = err.message || 'Login failed. Please try again.';
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  // Sign up function
  const signup = async (email, password) => {
    setError(null);
    
    // Frontend domain validation
    if (!validateEmailDomain(email)) {
      const message = `Only @${ALLOWED_DOMAIN} email addresses are allowed.`;
      setError(message);
      return { success: false, error: message };
    }

    try {
      // Set local persistence for new signups (they can change on next login)
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (err) {
      let message = 'Sign up failed. Please try again.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          break;
        default:
          // Check if it's our custom Cloud Function error
          if (err.message?.includes('unauthorized domain')) {
            message = `Only @${ALLOWED_DOMAIN} email addresses are allowed.`;
          } else {
            message = err.message || 'Sign up failed. Please try again.';
          }
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      return { success: true };
    } catch (err) {
      setError('Logout failed. Please try again.');
      return { success: false, error: err.message };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      let message = 'Password reset failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        default:
          message = err.message || 'Password reset failed. Please try again.';
      }
      
      setError(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
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