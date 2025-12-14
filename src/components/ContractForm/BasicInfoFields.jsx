// File: src/components/ContractForm/BasicInfoFields.jsx
// Basic contract information fields - NO PLACEHOLDERS

import React from 'react';

const BasicInfoFields = ({ formData, onInputChange }) => {
  return (
    <>
      <div style={styles.formGroup}>
        <label style={styles.label}>Contract Number *</label>
        <input
          type="text"
          value={formData.contractNumber}
          onChange={(e) => onInputChange('contractNumber', e.target.value.toUpperCase())}
          style={styles.input}
          placeholder=""
        />
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Total Finance Due (Capital) *</label>
          <div style={styles.inputWrapper}>
            <span style={styles.currency}>£</span>
            <input
              type="number"
              step="0.01"
              value={formData.totalCapital}
              onChange={(e) => onInputChange('totalCapital', e.target.value)}
              style={{...styles.input, paddingLeft: '28px'}}
              placeholder=""
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Interest Type *</label>
          <select
            value={formData.interestType}
            onChange={(e) => onInputChange('interestType', e.target.value)}
            style={styles.select}
          >
            <option value="fixed">Fixed Interest</option>
            <option value="variable">Variable Interest</option>
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Number of Instalments *</label>
          <input
            type="number"
            value={formData.totalInstalments}
            onChange={(e) => onInputChange('totalInstalments', e.target.value)}
            style={styles.input}
            placeholder=""
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>First Instalment Date *</label>
          <input
            type="date"
            value={formData.firstInstalmentDate}
            onChange={(e) => onInputChange('firstInstalmentDate', e.target.value)}
            style={styles.input}
          />
        </div>
      </div>
    </>
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
  select: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: '#ffffff',
    cursor: 'pointer'
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  }
};

export default BasicInfoFields;