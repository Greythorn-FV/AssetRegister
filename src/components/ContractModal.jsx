// File: src/components/ContractModal.jsx
// Two-step modal with Greythorn brand colors

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, FileText, Car } from 'lucide-react';
import { useContractForm } from '../hooks/useContractForm.js';
import FinancingStep from './ContractForm/FinancingStep.jsx';
import VehiclesStep from './ContractForm/VehiclesStep.jsx';

const ContractModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
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
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Greythorn Gradient Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.stepIndicator}>
              <div style={{
                ...styles.stepDot,
                ...(currentStep === 1 ? styles.stepDotActive : styles.stepDotComplete)
              }}>
                {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <div style={styles.stepLine}></div>
              <div style={{
                ...styles.stepDot,
                ...(currentStep === 2 ? styles.stepDotActive : {})
              }}>
                2
              </div>
            </div>
            <h2 style={styles.title}>
              {currentStep === 1 ? (
                <><FileText size={24} style={{marginRight: '12px'}} />Financing Details</>
              ) : (
                <><Car size={24} style={{marginRight: '12px'}} />Vehicle Information</>
              )}
            </h2>
            <p style={styles.subtitle}>
              {currentStep === 1 
                ? 'Contract terms and interest details'
                : 'Add vehicles to this finance agreement'
              }
            </p>
          </div>
          <button onClick={handleClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div style={styles.content}>
          {error && (
            <div style={styles.errorBanner}>
              <div style={styles.errorIcon}>⚠️</div>
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
            <div style={styles.footer}>
              {currentStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      ...styles.nextButton,
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
                    style={styles.backButton}
                    disabled={loading}
                  >
                    <ArrowLeft size={18} style={{marginRight: '8px'}} />
                    Back
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
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

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: 'linear-gradient(135deg, #4B6D8B 0%, #6B8CAE 100%)',
    padding: '32px',
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
    gap: '8px',
    marginBottom: '20px'
  },
  stepDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.6)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease'
  },
  stepDotActive: {
    background: 'white',
    color: '#4B6D8B',
    border: '2px solid white',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  stepDotComplete: {
    background: 'rgba(134, 239, 172, 0.9)',
    color: '#065f46',
    border: '2px solid #86efac'
  },
  stepLine: {
    flex: 1,
    height: '3px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
    maxWidth: '80px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '8px',
    color: 'white',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease'
  },
  content: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#991b1b',
    fontWeight: '500',
    border: '1px solid #fca5a5'
  },
  errorIcon: {
    fontSize: '20px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #f1f5f9'
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#475569',
    transition: 'all 0.2s ease'
  },
  backButton: {
    padding: '12px 24px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  nextButton: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #4B6D8B 0%, #6B8CAE 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(75, 109, 139, 0.3)',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease'
  }
};

export default ContractModal;