// File: src/components/Reports/MaturitySection.jsx
// Pure UI component for displaying maturity reports

import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currencyHelpers.js';
import { colors, gradients, fonts, shadows, radius } from '../../styles/theme.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const getStyles = (m) => ({
  section: {
    marginBottom: m ? '24px' : '40px',
    maxWidth: '100vw',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  },
  sectionHeader: {
    marginBottom: m ? '16px' : '24px'
  },
  sectionTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '10px' : '16px'
  },
  sectionIcon: {
    width: m ? '36px' : '48px',
    height: m ? '36px' : '48px',
    borderRadius: radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textOnDark,
    flexShrink: 0
  },
  sectionTitle: {
    margin: '0 0 4px 0',
    fontSize: m ? fonts.size.lg : fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: m ? fonts.size.sm : fonts.size.base,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  },
  emptyState: {
    textAlign: 'center',
    padding: m ? '32px 16px' : '60px 20px',
    background: colors.surface,
    borderRadius: radius.lg,
    border: `2px dashed ${colors.border}`
  },
  emptyIcon: {
    fontSize: m ? '36px' : '48px',
    marginBottom: '12px'
  },
  emptyTitle: {
    fontSize: m ? fonts.size.base : fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: '6px'
  },
  emptyText: {
    fontSize: m ? fonts.size.sm : fonts.size.base,
    color: colors.textSecondary
  },
  contractsGrid: {
    display: 'grid',
    gridTemplateColumns: m ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: m ? '12px' : '20px'
  },
  maturityCard: {
    padding: m ? '14px' : '24px',
    borderRadius: radius.lg,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: shadows.md,
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: m ? '12px' : '20px',
    paddingBottom: m ? '10px' : '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
    gap: '8px'
  },
  contractNumber: {
    fontSize: m ? '16px' : '20px',
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: m ? '4px' : '6px',
    wordBreak: 'break-word'
  },
  conclusionDate: {
    fontSize: m ? '11px' : '13px',
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  },
  daysCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '4px' : '6px',
    padding: m ? '6px 10px' : '8px 14px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.md,
    fontSize: m ? fonts.size.sm : fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.error,
    boxShadow: shadows.sm,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  cardMetrics: {
    display: 'grid',
    gridTemplateColumns: m ? '1fr 1fr' : 'repeat(3, 1fr)',
    gap: m ? '8px' : '16px',
    marginBottom: m ? '12px' : '16px'
  },
  cardMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: m ? '9px' : fonts.size.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricValue: {
    fontSize: m ? fonts.size.base : fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    wordBreak: 'break-word'
  },
  variableBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: m ? '4px 10px' : '6px 12px',
    background: `linear-gradient(135deg, ${colors.warningLight}, #FDE68A)`,
    borderRadius: radius.md,
    fontSize: m ? '11px' : fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.warningText,
    border: `1px solid ${colors.warningBorder}`,
    marginBottom: m ? '12px' : '16px'
  },
  vehiclesList: {
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radius.lg,
    padding: m ? '8px' : '12px',
    marginTop: m ? '8px' : '12px'
  },
  vehiclesTitle: {
    fontSize: m ? '11px' : fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    marginBottom: m ? '6px' : '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  vehicleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: m ? '4px 0' : '6px 0',
    fontSize: m ? '11px' : '13px',
    gap: '8px'
  },
  vehicleReg: {
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  vehicleMake: {
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    textAlign: 'right'
  },
  vehicleMore: {
    fontSize: m ? '11px' : fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    fontStyle: 'italic',
    paddingTop: '6px',
    borderTop: '1px solid rgba(100, 116, 139, 0.2)'
  }
});

const MaturitySection = ({ title, contracts, icon, iconColor, bgGradient, getTotalCapital, getTotalVehicles }) => {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  const totalCapital = getTotalCapital(contracts);
  const totalVehicles = getTotalVehicles(contracts);

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleArea}>
          <div style={{...styles.sectionIcon, background: iconColor}}>
            {icon}
          </div>
          <div>
            <h2 style={styles.sectionTitle}>{title}</h2>
            <p style={styles.sectionSubtitle}>
              {contracts.length} {contracts.length === 1 ? 'contract' : 'contracts'} •
              {totalVehicles} {totalVehicles === 1 ? 'vehicle' : 'vehicles'} •
              {formatCurrency(totalCapital)} outstanding
            </p>
          </div>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✅</div>
          <div style={styles.emptyTitle}>No contracts maturing in this period</div>
          <div style={styles.emptyText}>All clear for this timeframe</div>
        </div>
      ) : (
        <div style={styles.contractsGrid}>
          {contracts.map((contract, index) => (
            <div
              key={contract.id || index}
              style={{
                ...styles.maturityCard,
                background: bgGradient
              }}
            >
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.contractNumber}>{contract.contractNumber}</div>
                  <div style={styles.conclusionDate}>
                    Concludes: {formatDate(contract.conclusionDate)}
                  </div>
                </div>
                <div style={styles.daysCounter}>
                  <Clock size={isMobile ? 14 : 16} />
                  {contract.daysUntilConclusion} days
                </div>
              </div>

              <div style={styles.cardMetrics}>
                <div style={styles.cardMetric}>
                  <span style={styles.metricLabel}>Vehicles</span>
                  <span style={styles.metricValue}>
                    {contract.activeVehicles}/{contract.totalVehicles}
                  </span>
                </div>
                <div style={styles.cardMetric}>
                  <span style={styles.metricLabel}>Outstanding</span>
                  <span style={styles.metricValue}>
                    {formatCurrency(contract.capitalOutstanding)}
                  </span>
                </div>
                <div style={styles.cardMetric}>
                  <span style={styles.metricLabel}>Monthly Capital</span>
                  <span style={styles.metricValue}>
                    {formatCurrency(contract.monthlyCapital)}
                  </span>
                </div>
              </div>

              {contract.interestType === 'variable' && (
                <div style={styles.variableBadge}>
                  <TrendingUp size={12} />
                  Variable Rate
                </div>
              )}

              {contract.vehicles.length > 0 && (
                <div style={styles.vehiclesList}>
                  <div style={styles.vehiclesTitle}>Vehicles:</div>
                  {contract.vehicles.slice(0, 3).map((v, i) => (
                    <div key={i} style={styles.vehicleItem}>
                      <span style={styles.vehicleReg}>{v.registration}</span>
                      <span style={styles.vehicleMake}>{v.make} {v.model}</span>
                    </div>
                  ))}
                  {contract.vehicles.length > 3 && (
                    <div style={styles.vehicleMore}>
                      +{contract.vehicles.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaturitySection;
