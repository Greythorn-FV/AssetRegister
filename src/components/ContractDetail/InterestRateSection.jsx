// File: src/components/ContractDetail/InterestRateSection.jsx
// Compact version with Greythorn colors

import React from 'react';
import { Percent, TrendingUp, TrendingDown } from 'lucide-react';

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
                        <TrendingUp size={12} color="#DC2626" />
                      ) : (
                        <TrendingDown size={12} color="#059669" />
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
                          color: isIncrease ? '#DC2626' : '#059669'
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
    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: 'white',
    borderBottom: '1px solid #E5E7EB'
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
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#92400E',
    flexShrink: 0
  },
  titleArea: {
    flex: 1
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
    marginBottom: '2px'
  },
  cardSubtitle: {
    fontSize: '11px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500'
  },
  updateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(75, 109, 139, 0.2)'
  },
  historySection: {
    padding: '12px 18px',
    background: '#FAFAFA'
  },
  historyTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6B7280',
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
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  },
  timelineIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: '#F9FAFB',
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
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600'
  },
  timelineChange: {
    fontSize: '11px',
    color: '#1F2937',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  changeIndicator: {
    fontSize: '10px',
    fontWeight: '700'
  },
  moreHistory: {
    marginTop: '8px',
    padding: '6px 12px',
    background: 'white',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600',
    border: '1px solid #E5E7EB'
  }
};

export default InterestRateSection;