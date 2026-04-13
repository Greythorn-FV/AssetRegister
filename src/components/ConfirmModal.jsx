// src/components/ConfirmModal.jsx
// Professional confirmation modal to replace ugly browser dialogs

import React from 'react';
import { AlertTriangle, LogOut, Trash2, X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

// Icon types for different confirmation scenarios
const ICON_TYPES = {
  warning: { icon: AlertTriangle, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  danger: { icon: Trash2, color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  logout: { icon: LogOut, color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  info: { icon: AlertCircle, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  success: { icon: CheckCircle, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  question: { icon: HelpCircle, color: '#4B6D8B', bgColor: 'rgba(75, 109, 139, 0.1)' }
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, logout, info, success, question
  isLoading = false
}) => {
  if (!isOpen) return null;

  const iconConfig = ICON_TYPES[type] || ICON_TYPES.warning;
  const IconComponent = iconConfig.icon;
  
  // Determine button styling based on type
  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
          color: 'white'
        };
      case 'logout':
        return {
          background: 'linear-gradient(135deg, #6B7280, #4B5563)',
          color: 'white'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white'
        };
      case 'info':
        return {
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          color: 'white'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
          color: 'white'
        };
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

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
        <div style={{
          ...styles.iconContainer,
          background: iconConfig.bgColor
        }}>
          <IconComponent size={32} style={{ color: iconConfig.color }} />
        </div>

        {/* Title */}
        <h2 style={styles.title}>{title}</h2>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={onClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              ...styles.confirmButton,
              ...getConfirmButtonStyle(),
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : confirmText}
          </button>
        </div>
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
    maxWidth: '400px',
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
    transition: 'color 0.2s, background 0.2s'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a2a3a',
    marginBottom: '12px',
    letterSpacing: '-0.3px'
  },
  message: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '28px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
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
    transition: 'background 0.2s, border-color 0.2s'
  },
  confirmButton: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }
};

// Add CSS animation via style tag (will be injected once)
if (typeof document !== 'undefined' && !document.getElementById('confirm-modal-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'confirm-modal-styles';
  styleTag.textContent = `
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  document.head.appendChild(styleTag);
}

export default ConfirmModal;