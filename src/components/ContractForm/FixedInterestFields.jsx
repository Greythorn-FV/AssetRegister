// File: src/components/ContractForm/FixedInterestFields.jsx
// Fixed interest input fields - NO PLACEHOLDERS

import React from 'react';
import { colors, fonts, radius } from '../../styles/theme.js';

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
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary,
    letterSpacing: '-0.01em'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: `2px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface
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
  helpText: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginTop: '6px',
    fontStyle: 'italic'
  }
};

export default FixedInterestFields;