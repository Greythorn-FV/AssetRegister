// File: src/components/ContractForm/InterestCalculationDisplay.jsx
// Simplified interest calculation display

import React from 'react';
import { colors, fonts, radius, shadows } from '../../styles/theme.js';
import { formatCurrency } from '../../utils/currencyHelpers.js';
import { calculateExactInterest } from '../../utils/interestCalculator.js';

const InterestCalculationDisplay = ({ formData }) => {
  const capital = parseFloat(formData.totalCapital || 0);
  const baseRate = parseFloat(formData.baseRate || 0);
  const margin = parseFloat(formData.margin || 0);
  const months = parseInt(formData.totalInstalments || 0);
  const startDate = new Date(formData.firstInstalmentDate);

  // Calculate interest using exact method
  const { totalInterest, monthSamples, dayCount } = calculateExactInterest(
    capital,
    baseRate,
    margin,
    months,
    startDate
  );

  return (
    <div style={styles.calculatedInterest}>
      <div style={styles.calculationTitle}>
        💰 Estimated Total Interest
      </div>

      <div style={styles.calculationSteps}>
        <div style={styles.calculationStep}>
          <span style={styles.stepLabel}>Annual Rate:</span>
          <span style={styles.stepValue}>{(baseRate + margin).toFixed(2)}%</span>
        </div>
        <div style={styles.calculationStep}>
          <span style={styles.stepLabel}>Base Rate:</span>
          <span style={styles.stepValue}>{baseRate.toFixed(2)}%</span>
        </div>
        <div style={styles.calculationStep}>
          <span style={styles.stepLabel}>Margin:</span>
          <span style={styles.stepValue}>+{margin.toFixed(2)}%</span>
        </div>
        <div style={styles.calculationStep}>
          <span style={styles.stepLabel}>Contract Duration:</span>
          <span style={styles.stepValue}>{months} months</span>
        </div>
      </div>

      <div style={styles.methodNote}>
        <div style={styles.noteIcon}>ℹ️</div>
        <div style={styles.noteText}>
          Interest calculated daily on declining balance with actual calendar days.
        </div>
      </div>

      {/* Day Distribution */}
      <div style={styles.dateAnalysis}>
        <div style={styles.dateAnalysisTitle}>📊 Month Distribution:</div>
        <div style={styles.dateGrid}>
          {dayCount[31] > 0 && <span>31 days: {dayCount[31]} months</span>}
          {dayCount[30] > 0 && <span>30 days: {dayCount[30]} months</span>}
          {dayCount[29] > 0 && <span>29 days: {dayCount[29]} months (leap)</span>}
          {dayCount[28] > 0 && <span>28 days: {dayCount[28]} months (Feb)</span>}
        </div>
      </div>

      {/* Sample Months */}
      <div style={styles.calculationBreakdown}>
        <div style={styles.breakdownTitle}>Sample Interest Calculations:</div>
        {monthSamples.map((sample, idx) => (
          <div key={idx} style={styles.breakdownRow}>
            <span>{sample.monthName} ({sample.days} days):</span>
            <span>{formatCurrency(sample.interest)}</span>
          </div>
        ))}
      </div>

      {/* Total Interest */}
      <div style={styles.totalInterestBox}>
        <div style={styles.totalInterestLabel}>ESTIMATED TOTAL INTEREST:</div>
        <div style={styles.totalInterestValue}>{formatCurrency(totalInterest)}</div>
        <div style={styles.totalInterestNote}>
          ✅ Based on current interest rate
        </div>
        <div style={styles.totalInterestNote}>
          Rate changes will affect final amount
        </div>
      </div>
    </div>
  );
};

const styles = {
  calculatedInterest: {
    background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successLight} 100%)`,
    border: `2px solid ${colors.successBorder}`,
    borderRadius: radius.lg,
    padding: '20px',
    marginTop: '20px'
  },
  calculationTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.successText,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  calculationSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  calculationStep: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: colors.surface,
    borderRadius: radius.md,
    border: `1px solid ${colors.successBorder}`
  },
  stepLabel: {
    fontSize: fonts.size.sm,
    color: colors.success,
    fontWeight: fonts.weight.semibold
  },
  stepValue: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.successText
  },
  methodNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: radius.md,
    marginBottom: '16px',
    border: `1px solid ${colors.successBorder}`
  },
  noteIcon: {
    fontSize: '18px',
    flexShrink: 0
  },
  noteText: {
    fontSize: fonts.size.sm,
    color: colors.success,
    fontWeight: fonts.weight.medium,
    lineHeight: '1.5'
  },
  dateAnalysis: {
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '14px',
    borderRadius: radius.md,
    marginBottom: '16px',
    border: `1px solid ${colors.successBorder}`
  },
  dateAnalysisTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.successText,
    marginBottom: '10px'
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    fontSize: fonts.size.sm,
    color: colors.success,
    fontWeight: fonts.weight.semibold
  },
  calculationBreakdown: {
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '14px',
    borderRadius: radius.md,
    marginBottom: '16px',
    border: `1px solid ${colors.successBorder}`
  },
  breakdownTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.successText,
    marginBottom: '10px'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: fonts.size.sm,
    color: colors.success,
    fontWeight: fonts.weight.semibold,
    borderBottom: `1px solid ${colors.successLight}`
  },
  totalInterestBox: {
    background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successBorder} 100%)`,
    padding: '18px',
    borderRadius: radius.md,
    textAlign: 'center',
    border: `2px solid ${colors.successBorder}`,
    boxShadow: shadows.md
  },
  totalInterestLabel: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.success,
    marginBottom: '8px',
    letterSpacing: '0.5px'
  },
  totalInterestValue: {
    fontSize: '32px',
    fontWeight: fonts.weight.extrabold,
    color: colors.successText,
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  },
  totalInterestNote: {
    fontSize: fonts.size.xs,
    color: colors.success,
    fontWeight: fonts.weight.medium,
    marginTop: '4px'
  }
};

export default InterestCalculationDisplay;