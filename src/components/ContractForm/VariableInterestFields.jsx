// File: src/components/ContractForm/VariableInterestFields.jsx
// Variable interest input fields - NO PLACEHOLDERS

import React from 'react';

const VariableInterestFields = ({ formData, onInputChange, effectiveRate }) => {
  return (
    <>
      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>ℹ️</span>
        <span>Variable interest is calculated daily on outstanding balance. Like HSBC Fully Variable Purchase.</span>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Base Rate (%) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.baseRate}
            onChange={(e) => onInputChange('baseRate', e.target.value)}
            style={styles.input}
            placeholder=""
          />
          <div style={styles.helpText}>Bank of England base rate</div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Margin (%) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.margin}
            onChange={(e) => onInputChange('margin', e.target.value)}
            style={styles.input}
            placeholder=""
          />
          <div style={styles.helpText}>Fixed margin above base rate</div>
        </div>
      </div>

      {effectiveRate && (
        <div style={styles.calculatedRate}>
          <strong>Effective Annual Rate:</strong> {effectiveRate}%
        </div>
      )}
    </>
  );
};

const styles = {
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    border: '2px solid #93c5fd',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#1e3a8a',
    fontWeight: '500'
  },
  infoIcon: {
    fontSize: '18px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
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
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  calculatedRate: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    border: '2px solid #6ee7b7',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#065f46',
    fontWeight: '600'
  }
};

export default VariableInterestFields;