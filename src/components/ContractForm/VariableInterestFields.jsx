// File: src/components/ContractForm/VariableInterestFields.jsx
// Variable interest input fields - NO PLACEHOLDERS

import React from 'react';
import { colors, fonts, radius } from '../../styles/theme.js';

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
    background: colors.infoLight,
    border: `2px solid ${colors.infoBorder}`,
    borderRadius: radius.lg,
    marginBottom: '20px',
    fontSize: fonts.size.sm,
    color: colors.info,
    fontWeight: fonts.weight.medium
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
  helpText: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginTop: '6px',
    fontStyle: 'italic'
  },
  calculatedRate: {
    padding: '14px 16px',
    background: colors.successLight,
    border: `2px solid ${colors.successBorder}`,
    borderRadius: radius.lg,
    marginBottom: '20px',
    fontSize: fonts.size.base,
    color: colors.successText,
    fontWeight: fonts.weight.semibold
  }
};

export default VariableInterestFields;