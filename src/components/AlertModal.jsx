// src/components/AlertModal.jsx
// Professional alert modal to replace ugly browser alert() dialogs

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Icon types for different alert scenarios
const ALERT_TYPES = {
  success: { icon: CheckCircle, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#A7F3D0' },
  error: { icon: XCircle, color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)', borderColor: '#FECACA' },
  warning: { icon: AlertCircle, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#FDE68A' },
  info: { icon: Info, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#BFDBFE' }
};

const AlertModal = ({
  isOpen,
  onClose,
  title = 'Notice',
  message = '',
  type = 'info', // success, error, warning, info
  buttonText = 'OK'
}) => {
  if (!isOpen) return null;

  const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.info;
  const IconComponent = alertConfig.icon;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Close Button */}
        <button onClick={onClose} style={styles.closeButton}>
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{
          ...styles.iconContainer,
          background: alertConfig.bgColor,
          border: `2px solid ${alertConfig.borderColor}`
        }}>
          <IconComponent size={32} style={{ color: alertConfig.color }} />
        </div>

        {/* Title */}
        <h2 style={{
          ...styles.title,
          color: alertConfig.color
        }}>{title}</h2>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Button */}
        <button
          onClick={onClose}
          style={{
            ...styles.button,
            background: `linear-gradient(135deg, ${alertConfig.color}, ${alertConfig.color}dd)`
          }}
        >
          {buttonText}
        </button>
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
    maxWidth: '380px',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    letterSpacing: '-0.3px'
  },
  message: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  button: {
    width: '100%',
    padding: '12px 24px',
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

// Add CSS animation (same as ConfirmModal)
if (typeof document !== 'undefined' && !document.getElementById('alert-modal-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'alert-modal-styles';
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

export default AlertModal;