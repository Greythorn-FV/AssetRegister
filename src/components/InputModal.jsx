// src/components/InputModal.jsx
// Professional input modal to replace ugly browser prompt() dialogs

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Enter Value',
  message = '',
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requiredValue = null, // If set, user must type this exact value to proceed
  caseSensitive = true,
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
      // Focus input after a brief delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (requiredValue) {
      const compareInput = caseSensitive ? inputValue : inputValue.toLowerCase();
      const compareRequired = caseSensitive ? requiredValue : requiredValue.toLowerCase();
      
      if (compareInput !== compareRequired) {
        setError(`You must type "${requiredValue}" exactly to confirm.`);
        return;
      }
    }
    
    onConfirm(inputValue);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const isConfirmDisabled = requiredValue 
    ? (caseSensitive ? inputValue !== requiredValue : inputValue.toLowerCase() !== requiredValue.toLowerCase())
    : !inputValue.trim();

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={styles.closeButton}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={styles.iconContainer}>
          <AlertTriangle size={32} style={{ color: '#DC2626' }} />
        </div>

        {/* Title */}
        <h2 style={styles.title}>{title}</h2>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder={placeholder}
            style={{
              ...styles.input,
              borderColor: error ? '#DC2626' : '#D1D5DB'
            }}
            disabled={isLoading}
            autoComplete="off"
          />

          {/* Error Message */}
          {error && (
            <p style={styles.error}>{error}</p>
          )}

          {/* Helper text for required value */}
          {requiredValue && (
            <p style={styles.helper}>
              Type <strong style={styles.requiredText}>{requiredValue}</strong> to confirm
            </p>
          )}

          {/* Buttons */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="submit"
              style={{
                ...styles.confirmButton,
                opacity: isConfirmDisabled || isLoading ? 0.5 : 1,
                cursor: isConfirmDisabled || isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isConfirmDisabled || isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)',
    padding: '20px'
  },
  modal: {
    position: 'relative',
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Avenir', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif",
    animation: 'modalSlideIn 0.2s ease-out'
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'color 0.2s'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(220, 38, 38, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: '12px',
    letterSpacing: '-0.3px'
  },
  message: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '2px solid #D1D5DB',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: '1px',
    transition: 'border-color 0.2s'
  },
  error: {
    fontSize: '13px',
    color: '#DC2626',
    marginTop: '8px',
    marginBottom: '0'
  },
  helper: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '12px',
    marginBottom: '0'
  },
  requiredText: {
    color: '#DC2626',
    fontFamily: 'monospace',
    background: '#FEE2E2',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'white',
    color: '#4B5563',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s'
  },
  confirmButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }
};

export default InputModal;