// File: src/components/ContractModal.jsx
// Two-step modal with premium theme

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, FileText, Car } from 'lucide-react';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';
import { useContractForm } from '../hooks/useContractForm.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import FinancingStep from './ContractForm/FinancingStep.jsx';
import VehiclesStep from './ContractForm/VehiclesStep.jsx';

const ContractModal = ({ isOpen, onClose, onSuccess }) => {
  const isMobile = useIsMobile();
  const s = getStyles(isMobile);
  const [currentStep, setCurrentStep] = useState(1);

  // Reset to step 1 whenever the modal opens
  useEffect(() => {
    if (isOpen) setCurrentStep(1);
  }, [isOpen]);

  // Lock body scroll on mobile when modal is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const {
    formData,
    loading,
    error,
    handleInputChange,
    handleVehicleChange,
    addVehicleField,
    removeVehicleField,
    handleSubmit,
    effectiveRate,
    canShowCalculation
  } = useContractForm(onSuccess, onClose);

  if (!isOpen) return null;

  const validateStep1 = () => {
    if (!formData.contractNumber.trim()) return false;
    if (!formData.totalCapital || parseFloat(formData.totalCapital) <= 0) return false;
    if (!formData.totalInstalments || parseInt(formData.totalInstalments) <= 0) return false;
    if (!formData.firstInstalmentDate) return false;
    
    if (formData.interestType === 'fixed') {
      if (!formData.totalInterest || parseFloat(formData.totalInterest) < 0) return false;
    } else {
      if (!formData.baseRate || parseFloat(formData.baseRate) < 0) return false;
      if (!formData.margin || parseFloat(formData.margin) < 0) return false;
    }
    
    return true;
  };

  const validateVehicles = () => {
    return formData.vehicles.every(v => 
      v.registration.trim() && v.make.trim() && v.model.trim()
    );
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 2 && validateVehicles()) {
      handleSubmit(e);
    }
  };

  return (
    <div style={s.overlay} onClick={handleClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Premium Theme Header */}
        <div style={s.header}>
          <div style={s.headerContent}>
            <div style={s.stepIndicator}>
              <div style={{
                ...s.stepDot,
                ...(currentStep === 1 ? s.stepDotActive : s.stepDotComplete)
              }}>
                {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <div style={s.stepLine}></div>
              <div style={{
                ...s.stepDot,
                ...(currentStep === 2 ? s.stepDotActive : {})
              }}>
                2
              </div>
            </div>
            <h2 style={s.title}>
              {currentStep === 1 ? (
                <><FileText size={24} style={{marginRight: '12px'}} />Financing Details</>
              ) : (
                <><Car size={24} style={{marginRight: '12px'}} />Vehicle Information</>
              )}
            </h2>
            <p style={s.subtitle}>
              {currentStep === 1 
                ? 'Contract terms and interest details'
                : 'Add vehicles to this finance agreement'
              }
            </p>
          </div>
          <button onClick={handleClose} style={s.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div style={s.content}>
          {error && (
            <div style={s.errorBanner}>
              <div style={s.errorIcon}>⚠️</div>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={onFormSubmit}>
            {currentStep === 1 ? (
              <FinancingStep
                formData={formData}
                onInputChange={handleInputChange}
                effectiveRate={effectiveRate}
                canShowCalculation={canShowCalculation}
              />
            ) : (
              <VehiclesStep
                vehicles={formData.vehicles}
                onVehicleChange={handleVehicleChange}
                onAddVehicle={addVehicleField}
                onRemoveVehicle={removeVehicleField}
              />
            )}

            {/* Navigation Footer */}
            <div style={s.footer}>
              {currentStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={s.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      ...s.nextButton,
                      opacity: validateStep1() ? 1 : 0.5,
                      cursor: validateStep1() ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!validateStep1()}
                  >
                    Next: Vehicles
                    <ArrowRight size={18} style={{marginLeft: '8px'}} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={s.backButton}
                    disabled={loading}
                  >
                    <ArrowLeft size={18} style={{marginRight: '8px'}} />
                    Back
                  </button>
                  <button
                    type="submit"
                    style={s.submitButton}
                    disabled={loading || !validateVehicles()}
                  >
                    {loading ? 'Adding Contract...' : 'Complete & Add Contract'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const getStyles = (m) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: m ? 'stretch' : 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.xl,
    width: m ? '100%' : '90%',
    maxWidth: m ? 'none' : '700px',
    maxHeight: m ? '100vh' : '90vh',
    height: m ? '100vh' : undefined,
    overflow: 'hidden',
    boxShadow: m ? 'none' : shadows.xl,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: gradients.primary,
    padding: m ? '12px 14px' : '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerContent: {
    flex: 1
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '6px' : '8px',
    marginBottom: m ? '8px' : '20px'
  },
  stepDot: {
    width: m ? '28px' : '36px',
    height: m ? '28px' : '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.6)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease'
  },
  stepDotActive: {
    background: colors.surface,
    color: colors.primary,
    border: `2px solid ${colors.surface}`,
    transform: 'scale(1.1)',
    boxShadow: shadows.lg
  },
  stepDotComplete: {
    background: colors.successBorder,
    color: colors.successText,
    border: `2px solid ${colors.successBorder}`
  },
  stepLine: {
    flex: 1,
    height: '3px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
    maxWidth: '80px'
  },
  title: {
    fontSize: m ? fonts.size.lg : fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textOnDark,
    margin: 0,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: fonts.size.base,
    color: colors.textOnDarkMuted,
    margin: 0
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    padding: '8px',
    color: colors.textOnDark,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease'
  },
  content: {
    padding: m ? '12px' : '32px',
    overflowY: 'auto',
    flex: 1
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: `linear-gradient(135deg, ${colors.errorLight} 0%, ${colors.errorBorder} 100%)`,
    borderRadius: radius.lg,
    marginBottom: '24px',
    fontSize: fonts.size.base,
    color: colors.errorText,
    fontWeight: fonts.weight.medium,
    border: `1px solid ${colors.errorBorder}`
  },
  errorIcon: {
    fontSize: '20px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: m ? '20px' : '32px',
    paddingTop: m ? '16px' : '24px',
    borderTop: `2px solid ${colors.borderLight}`
  },
  cancelButton: {
    padding: '12px 24px',
    background: colors.background,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    color: colors.textSecondary,
    transition: 'all 0.2s ease'
  },
  backButton: {
    padding: '12px 24px',
    background: colors.background,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  nextButton: {
    padding: '12px 28px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: shadows.lg,
    transition: 'all 0.2s ease'
  },
  submitButton: {
    padding: '12px 28px',
    background: gradients.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    boxShadow: shadows.lg,
    transition: 'all 0.2s ease'
  }
});

export default ContractModal;