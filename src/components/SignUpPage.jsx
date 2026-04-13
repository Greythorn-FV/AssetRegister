// src/components/SignUpPage.jsx
// Sign Up Page - Registration form with @greythorn.services domain validation

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const SignUpPage = ({ onNavigateToLogin }) => {
  const { signup, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const ALLOWED_DOMAIN = 'greythorn.services';

  // Check if email domain is valid
  const isValidDomain = (email) => {
    if (!email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
  };

  // Check if passwords match
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Validation
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (!isValidDomain(email.trim())) {
      setLocalError(`Only @${ALLOWED_DOMAIN} email addresses are allowed.`);
      return;
    }

    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      setLocalError('Please confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await signup(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setLocalError(result.error);
    }
    // If successful, AuthContext will automatically update and App.jsx will show the main app
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      <div style={styles.signupCard}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img 
            src="/logo.png" 
            alt="Greythorn Logo" 
            style={styles.logo}
          />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join the Asset Finance Register</p>

        {/* Domain Notice */}
        <div style={styles.domainNotice}>
          <span style={styles.domainIcon}>🔒</span>
          <span>Only @{ALLOWED_DOMAIN} email addresses are accepted</span>
        </div>

        {/* Error Message */}
        {displayError && (
          <div style={styles.errorContainer}>
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Work Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@greythorn.services"
                style={{
                  ...styles.input,
                  borderColor: email && !isValidDomain(email) ? '#DC2626' : 
                               email && isValidDomain(email) ? '#10B981' : '#D1D5DB'
                }}
                disabled={isLoading}
                autoComplete="email"
              />
              {email && isValidDomain(email) && (
                <CheckCircle size={18} style={styles.validIcon} />
              )}
            </div>
            {email && !isValidDomain(email) && (
              <span style={styles.fieldError}>Must be a @{ALLOWED_DOMAIN} email</span>
            )}
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                style={styles.input}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && password.length < 6 && (
              <span style={styles.fieldError}>Password must be at least 6 characters</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{
                  ...styles.input,
                  borderColor: passwordsDontMatch ? '#DC2626' : 
                               passwordsMatch ? '#10B981' : '#D1D5DB'
                }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {passwordsMatch && (
                <CheckCircle size={18} style={{ ...styles.validIcon, right: '44px' }} />
              )}
            </div>
            {passwordsDontMatch && (
              <span style={styles.fieldError}>Passwords do not match</span>
            )}
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
              <span style={styles.loadingText}>Creating account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={styles.loginContainer}>
          <span style={styles.loginText}>Already have an account?</span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={styles.loginLink}
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
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
  signupCard: {
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
    marginBottom: '24px'
  },
  logo: {
    height: '60px',
    width: 'auto'
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
    color: '#6B8CAE',
    textAlign: 'center',
    marginBottom: '20px'
  },
  domainNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, rgba(75, 109, 139, 0.1), rgba(107, 140, 174, 0.1))',
    border: '1px solid rgba(75, 109, 139, 0.2)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#4B6D8B',
    marginBottom: '20px'
  },
  domainIcon: {
    fontSize: '14px'
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
    gap: '18px'
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
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#6B8CAE',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  validIcon: {
    position: 'absolute',
    right: '14px',
    color: '#10B981',
    pointerEvents: 'none'
  },
  fieldError: {
    fontSize: '12px',
    color: '#DC2626',
    marginTop: '2px'
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
    fontFamily: 'inherit',
    marginTop: '8px'
  },
  loadingText: {
    color: 'white'
  },
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #E5E7EB'
  },
  loginText: {
    fontSize: '14px',
    color: '#6B7280'
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#4B6D8B',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit'
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

export default SignUpPage;