// File: src/components/ContractDetail/InterestRateSection.jsx
// Compact version with Greythorn colors

import React from 'react';
import { Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { colors, gradients, fonts, shadows, radius } from '../../styles/theme.js';

const InterestRateSection = ({ contract, loading, onUpdateRate }) => {
  const effectiveRate = (contract.baseRate || 0) + (contract.margin || 0);

  return (
    <div style={styles.section}>
      <div style={styles.compactCard}>
        <div style={styles.cardHeader}>
          <div style={styles.headerContent}>
            <div style={styles.iconBadge}>
              <Percent size={14} />
            </div>
            <div style={styles.titleArea}>
              <h4 style={styles.cardTitle}>Variable Interest Rate</h4>
              <p style={styles.cardSubtitle}>BoE rate {(contract.baseRate || 0).toFixed(2)}% + margin {(contract.margin || 0).toFixed(2)}% = <strong>{effectiveRate.toFixed(2)}%</strong></p>
            </div>
          </div>
          <button 
            onClick={onUpdateRate} 
            style={styles.updateButton}
            disabled={loading}
          >
            Update Rate
          </button>
        </div>

        {/* Rate History Timeline - Compact */}
        {contract.rateHistory && contract.rateHistory.length > 0 && (
          <div style={styles.historySection}>
            <div style={styles.historyTitle}>Rate Change History</div>
            <div style={styles.timeline}>
              {contract.rateHistory.slice(-3).map((change, index) => {
                const isIncrease = change.newEffectiveRate > change.oldEffectiveRate;
                const diff = Math.abs(change.newEffectiveRate - change.oldEffectiveRate);
                
                return (
                  <div key={index} style={styles.timelineItem}>
                    <div style={styles.timelineIcon}>
                      {isIncrease ? (
                        <TrendingUp size={12} color={colors.error} />
                      ) : (
                        <TrendingDown size={12} color={colors.success} />
                      )}
                    </div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineDate}>
                        {new Date(change.date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div style={styles.timelineChange}>
                        {change.oldEffectiveRate.toFixed(2)}% → {change.newEffectiveRate.toFixed(2)}%
                        <span style={{
                          ...styles.changeIndicator,
                          color: isIncrease ? colors.error : colors.success
                        }}>
                          ({isIncrease ? '+' : ''}{diff.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {contract.rateHistory.length > 3 && (
              <div style={styles.moreHistory}>
                +{contract.rateHistory.length - 3} more changes
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: '20px'
  },
  compactCard: {
    background: `linear-gradient(135deg, ${colors.surfaceHover} 0%, ${colors.background} 100%)`,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: colors.surface,
    borderBottom: `1px solid ${colors.border}`
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  iconBadge: {
    width: '28px',
    height: '28px',
    borderRadius: radius.md,
    background: gradients.gold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.warningText,
    flexShrink: 0
  },
  titleArea: {
    flex: 1
  },
  cardTitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    margin: 0,
    marginBottom: '2px'
  },
  cardSubtitle: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary,
    margin: 0,
    fontWeight: fonts.weight.medium
  },
  updateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.md
  },
  historySection: {
    padding: '12px 18px',
    background: colors.surfaceHover
  },
  historyTitle: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: colors.surface,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`
  },
  timelineIcon: {
    width: '24px',
    height: '24px',
    borderRadius: radius.sm,
    background: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  timelineContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  timelineDate: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  },
  timelineChange: {
    fontSize: fonts.size.xs,
    color: colors.textPrimary,
    fontWeight: fonts.weight.semibold,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  changeIndicator: {
    fontSize: '10px',
    fontWeight: fonts.weight.bold
  },
  moreHistory: {
    marginTop: '8px',
    padding: '6px 12px',
    background: colors.surface,
    borderRadius: radius.sm,
    textAlign: 'center',
    fontSize: fonts.size.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    border: `1px solid ${colors.border}`
  }
};

export default InterestRateSection;