// src/components/InactivityMonitor.jsx
// Inactivity Monitor - Tracks user activity and handles auto-logout after 10 minutes
// Shows warning popup at 9 minutes with option to stay logged in

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Clock, AlertTriangle } from 'lucide-react';

// Timeout configuration (in milliseconds)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIMEOUT = 9 * 60 * 1000; // 9 minutes (show warning 1 minute before logout)

const InactivityMonitor = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  
  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset all timers and hide warning
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Hide warning if showing
    setShowWarning(false);
    setCountdown(60);

    // Only set new timers if authenticated
    if (isAuthenticated) {
      // Set warning timer (9 minutes)
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        setCountdown(60);
        
        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, WARNING_TIMEOUT);

      // Set logout timer (10 minutes)
      logoutTimeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    // Clear all timers
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    setShowWarning(false);
    await logout();
  }, [logout]);

  // Handle "Stay Logged In" button click
  const handleStayLoggedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers when not authenticated
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setShowWarning(false);
      return;
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttled activity handler (only reset if not showing warning)
    let throttleTimer = null;
    const handleActivity = () => {
      if (showWarning) return; // Don't reset if warning is showing (user must click button)
      
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetTimers();
          throttleTimer = null;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimers();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isAuthenticated, showWarning, resetTimers]);

  // Don't render warning modal if not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Warning Modal */}
      {showWarning && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* Warning Icon */}
            <div style={styles.iconContainer}>
              <Clock size={48} style={styles.clockIcon} />
            </div>

            {/* Title */}
            <h2 style={styles.title}>Session Timeout Warning</h2>

            {/* Message */}
            <p style={styles.message}>
              You've been inactive for a while. For security, you'll be automatically logged out in:
            </p>

            {/* Countdown */}
            <div style={styles.countdownContainer}>
              <span style={styles.countdown}>{countdown}</span>
              <span style={styles.countdownLabel}>seconds</span>
            </div>

            {/* Warning Text */}
            <div style={styles.warningText}>
              <AlertTriangle size={16} />
              <span>Any unsaved changes may be lost</span>
            </div>

            {/* Buttons */}
            <div style={styles.buttonContainer}>
              <button
                onClick={handleStayLoggedIn}
                style={styles.stayButton}
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Avenir', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  clockIcon: {
    color: '#F59E0B'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a2a3a',
    marginBottom: '12px',
    letterSpacing: '-0.3px'
  },
  message: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  countdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px'
  },
  countdown: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#F59E0B',
    lineHeight: '1'
  },
  countdownLabel: {
    fontSize: '14px',
    color: '#9CA3AF',
    marginTop: '4px'
  },
  warningText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#DC2626',
    marginBottom: '24px'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  stayButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.2s'
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#6B7280',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s'
  }
};

export default InactivityMonitor;