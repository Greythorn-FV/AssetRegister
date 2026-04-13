// src/components/ForgotPasswordPage.jsx
// Forgot Password Page - Password reset email functionality

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = ({ onNavigateToLogin }) => {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setIsSuccess(false);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setLocalError(result.error);
    }
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img 
            src="/logo.png" 
            alt="Greythorn Logo" 
            style={styles.logo}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={onNavigateToLogin}
          style={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft size={18} />
          <span>Back to Sign In</span>
        </button>

        {/* Title */}
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Success Message */}
        {isSuccess && (
          <div style={styles.successContainer}>
            <CheckCircle size={20} />
            <div style={styles.successContent}>
              <strong>Check your inbox</strong>
              <p style={styles.successText}>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {displayError && !isSuccess && (
          <div style={styles.errorContainer}>
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Reset Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@greythorn.services"
                  style={styles.input}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={styles.loadingText}>Sending...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Try Again Button (after success) */}
        {isSuccess && (
          <div style={styles.tryAgainContainer}>
            <p style={styles.tryAgainText}>Didn't receive the email?</p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              style={styles.tryAgainButton}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2025 Greythorn Services. All rights reserved.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a2a3a 0%, #2d4a5c 50%, #1a2a3a 100%)',
    padding: '20px',
    fontFamily: "'Avenir', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  logo: {
    height: '60px',
    width: 'auto'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#4B6D8B',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '24px',
    fontFamily: 'inherit'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a2a3a',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: '28px',
    lineHeight: '1.5'
  },
  successContainer: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
    color: '#047857',
    marginBottom: '20px'
  },
  successContent: {
    flex: 1
  },
  successText: {
    fontSize: '13px',
    marginTop: '6px',
    lineHeight: '1.5',
    color: '#065F46'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#FEE2E2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    color: '#DC2626',
    fontSize: '14px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#6B8CAE',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: '15px',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit'
  },
  loadingText: {
    color: 'white'
  },
  tryAgainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #E5E7EB'
  },
  tryAgainText: {
    fontSize: '14px',
    color: '#6B7280'
  },
  tryAgainButton: {
    background: 'none',
    border: '1px solid #4B6D8B',
    color: '#4B6D8B',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s'
  },
  footer: {
    marginTop: '32px'
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center'
  }
};

export default ForgotPasswordPage;