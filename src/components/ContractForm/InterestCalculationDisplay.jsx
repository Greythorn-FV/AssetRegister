// File: src/components/ContractForm/InterestCalculationDisplay.jsx
// Simplified interest calculation display

import React from 'react';
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
    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    border: '2px solid #86EFAC',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px'
  },
  calculationTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#065F46',
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
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #BBF7D0'
  },
  stepLabel: {
    fontSize: '13px',
    color: '#047857',
    fontWeight: '600'
  },
  stepValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#065F46'
  },
  methodNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #BBF7D0'
  },
  noteIcon: {
    fontSize: '18px',
    flexShrink: 0
  },
  noteText: {
    fontSize: '12px',
    color: '#047857',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  dateAnalysis: {
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #BBF7D0'
  },
  dateAnalysisTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#065F46',
    marginBottom: '10px'
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    fontSize: '12px',
    color: '#047857',
    fontWeight: '600'
  },
  calculationBreakdown: {
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #BBF7D0'
  },
  breakdownTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#065F46',
    marginBottom: '10px'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '12px',
    color: '#047857',
    fontWeight: '600',
    borderBottom: '1px solid #D1FAE5'
  },
  totalInterestBox: {
    background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    padding: '18px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '2px solid #86EFAC',
    boxShadow: '0 4px 6px -1px rgba(6, 95, 70, 0.1)'
  },
  totalInterestLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#047857',
    marginBottom: '8px',
    letterSpacing: '0.5px'
  },
  totalInterestValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#065F46',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  },
  totalInterestNote: {
    fontSize: '11px',
    color: '#047857',
    fontWeight: '500',
    marginTop: '4px'
  }
};

export default InterestCalculationDisplay;