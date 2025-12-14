// File: src/components/ContractForm/FixedInterestFields.jsx
// Fixed interest input fields - NO PLACEHOLDERS

import React from 'react';

const FixedInterestFields = ({ formData, onInputChange }) => {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>Total Interest (Estimated) *</label>
      <div style={styles.inputWrapper}>
        <span style={styles.currency}>£</span>
        <input
          type="number"
          step="0.01"
          value={formData.totalInterest}
          onChange={(e) => onInputChange('totalInterest', e.target.value)}
          style={{...styles.input, paddingLeft: '28px'}}
          placeholder=""
        />
      </div>
      <div style={styles.helpText}>
        Total estimated interest for the entire contract period
      </div>
    </div>
  );
};

const styles = {
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: '-0.01em'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: '#ffffff'
  },
  inputWrapper: {
    position: 'relative'
  },
  currency: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    pointerEvents: 'none'
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    fontStyle: 'italic'
  }
};

export default FixedInterestFields;