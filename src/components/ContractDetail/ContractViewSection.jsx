// File: src/components/ContractDetail/ContractViewSection.jsx
// View mode for contract details - FIXED VERSION

import React from 'react';
import { Edit2, Trash2, FileText } from 'lucide-react';
import { colors, gradients, fonts, shadows, radius } from '../../styles/theme.js';
import { formatCurrency } from '../../utils/currencyHelpers.js';
import { formatDate } from '../../utils/dateHelpers.js';
import InterestRateSection from './InterestRateSection.jsx';
import VehiclesList from './VehiclesList.jsx';

const ContractViewSection = ({ 
  contract, 
  metrics, 
  loading,
  onEditClick,
  onDeleteContract,
  onSettleVehicle,
  onUnsettleVehicle,
  onUpdateVehicleNote,
  onSettleVehicleWithImpact,
  onSoldVehicle,
  onUndoSoldVehicle,
  onUpdateRate,
  onViewStatement
}) => {
  // Calculate TOTAL interest properly for variable contracts
  const getTotalInterest = () => {
    if (contract.interestType === 'variable') {
      const monthsElapsed = metrics.monthsElapsed || 0;
      const interestPaid = (metrics.monthlyInterest || 0) * monthsElapsed;
      return interestPaid + (metrics.interestOutstanding || 0);
    }
    return contract.totalInterest;
  };

  return (
    <>
      {/* Contract Info Grid */}
      <div style={styles.section}>
        <div style={styles.statusBadge}>
          <span style={{
            ...styles.badge,
            ...(contract.status === 'active' ? styles.badgeActive : styles.badgeSettled)
          }}>
            {contract.status}
          </span>
        </div>

        <div style={styles.grid}>
          {/* Total Capital */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Total Capital</div>
            <div style={styles.infoValue}>{formatCurrency(contract.totalCapital)}</div>
          </div>
          
          {/* Total Interest */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>
              Total Interest
              {contract.interestType === 'variable' && (
                <span style={styles.estimatedBadge}>(Est.)</span>
              )}
            </div>
            <div style={styles.infoValueSecondary}>
              {formatCurrency(getTotalInterest())}
            </div>
          </div>
          
          {/* Monthly Capital Instalment - FIXED: Uses monthlyCapitalInstalment */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Monthly Capital Instalment</div>
            <div style={styles.infoValue}>{formatCurrency(metrics.monthlyCapitalInstalment)}</div>
            {contract.activeVehiclesCount < contract.originalVehicleCount && (
              <div style={{fontSize: fonts.size.xs, color: colors.textSecondary, marginTop: '4px'}}>
                Current: {formatCurrency(metrics.currentMonthlyCapital)} ({contract.activeVehiclesCount} active)
              </div>
            )}
          </div>

          {/* Monthly Interest Payment */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Monthly Interest Payment</div>
            <div style={styles.infoValue}>{formatCurrency(metrics.monthlyInterest || 0)}</div>
          </div>
          
          {/* Capital Outstanding - FIXED: Now uses correct calculation */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Capital Outstanding</div>
            <div style={styles.infoValueHighlight}>{formatCurrency(metrics.capitalOutstanding)}</div>
          </div>

          {/* Interest Outstanding */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Interest Outstanding</div>
            <div style={styles.infoValueHighlight}>{formatCurrency(metrics.interestOutstanding || 0)}</div>
          </div>
          
          {/* Total Instalments */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Total Instalments</div>
            <div style={styles.infoValue}>{contract.totalInstalments} months</div>
          </div>
          
          {/* Months Remaining */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Months Remaining</div>
            <div style={styles.infoValue}>{metrics.monthsRemaining} months</div>
          </div>
          
          {/* First Instalment Date */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>First Instalment Date</div>
            <div style={styles.infoValue}>{formatDate(contract.firstInstalmentDate)}</div>
          </div>
          
          {/* Progress */}
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Progress</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${metrics.progress}%`}}></div>
              <span style={styles.progressText}>{Math.round(metrics.progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statement of Account Button */}
      <div style={styles.statementSection}>
        <button onClick={onViewStatement} style={styles.statementButton} disabled={loading}>
          <FileText size={20} />
          <div style={styles.statementButtonText}>
            <span style={styles.statementButtonTitle}>Statement of Account</span>
            <span style={styles.statementButtonSubtitle}>View detailed transaction history</span>
          </div>
        </button>
      </div>

      {/* Interest Rate Section - Only for Variable Interest */}
      {contract.interestType === 'variable' && (
        <InterestRateSection 
          contract={contract} 
          loading={loading}
          onUpdateRate={onUpdateRate}
        />
      )}

      {/* Vehicles List */}
      <VehiclesList
        contract={contract}
        metrics={metrics}
        loading={loading}
        onSettleVehicle={onSettleVehicle}
        onUnsettleVehicle={onUnsettleVehicle}
        onUpdateVehicleNote={onUpdateVehicleNote}
        onSettleVehicleWithImpact={onSettleVehicleWithImpact}
        onSoldVehicle={onSoldVehicle}
        onUndoSoldVehicle={onUndoSoldVehicle}
      />

      {/* Action Buttons */}
      <div style={styles.footer}>
        <button onClick={onDeleteContract} style={styles.deleteButton} disabled={loading}>
          <Trash2 size={18} />
          Delete Contract
        </button>
        <button onClick={onEditClick} style={styles.editButton} disabled={loading}>
          <Edit2 size={18} />
          Edit Contract
        </button>
      </div>
    </>
  );
};

const styles = {
  section: {
    marginBottom: '24px'
  },
  statusBadge: {
    marginBottom: '24px'
  },
  badge: {
    padding: '6px 16px',
    borderRadius: radius.lg,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    textTransform: 'capitalize'
  },
  badgeActive: {
    background: colors.successLight,
    color: colors.successText
  },
  badgeSettled: {
    background: colors.settledBg,
    color: colors.settled
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  infoItem: {
    background: colors.surface,
    padding: '16px',
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`
  },
  infoLabel: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginBottom: '8px',
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  estimatedBadge: {
    fontSize: '10px',
    marginLeft: '6px',
    color: colors.info,
    fontWeight: fonts.weight.medium,
    fontStyle: 'italic'
  },
  infoValue: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  infoValueSecondary: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.info
  },
  infoValueHighlight: {
    fontSize: '20px',
    fontWeight: fonts.weight.bold,
    color: colors.success
  },
  progressBar: {
    position: 'relative',
    width: '100%',
    height: '32px',
    background: colors.background,
    borderRadius: radius.md,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: gradients.success,
    borderRadius: radius.md,
    transition: 'width 0.5s ease'
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  statementSection: {
    marginBottom: '24px'
  },
  statementButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    padding: '20px 24px',
    background: gradients.primary,
    border: 'none',
    borderRadius: radius.xl,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.lg,
    color: colors.textOnDark
  },
  statementButtonText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px'
  },
  statementButtonTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    letterSpacing: '-0.01em'
  },
  statementButtonSubtitle: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textOnDarkMuted
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: `2px solid ${colors.borderLight}`
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: `linear-gradient(135deg, ${colors.errorLight}, ${colors.errorBorder})`,
    color: colors.error,
    border: 'none',
    borderRadius: radius.lg,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.lg,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.lg
  }
};

export default ContractViewSection;