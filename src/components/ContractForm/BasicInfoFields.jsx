// File: src/components/ContractForm/BasicInfoFields.jsx
// Basic contract information fields - NO PLACEHOLDERS

import React from 'react';
import { colors, fonts, radius } from '../../styles/theme.js';

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
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary,
    letterSpacing: '-0.01em'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface,
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
    fontSize: fonts.size.base,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    pointerEvents: 'none'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  }
};

export default BasicInfoFields;