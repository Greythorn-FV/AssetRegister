// src/components/AuthenticatedApp.jsx
// Authenticated App Wrapper - Shows main app content or auth pages based on login state

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LoginPage from './LoginPage.jsx';
import InactivityMonitor from './InactivityMonitor.jsx';

const AuthenticatedApp = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <img 
            src="/logo.png" 
            alt="Greythorn Logo" 
            style={styles.loadingLogo}
          />
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
        
        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated, show the login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If authenticated, show main app wrapped in inactivity monitor
  return (
    <InactivityMonitor>
      {children}
    </InactivityMonitor>
  );
};

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a2a3a 0%, #2d4a5c 50%, #1a2a3a 100%)',
    fontFamily: "'Avenir', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  },
  loadingLogo: {
    height: '60px',
    width: 'auto'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.2)',
    borderTop: '3px solid #6B8CAE',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default AuthenticatedApp;