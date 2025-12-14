// File: src/components/ContractDetail/ContractViewSection.jsx
// View mode for contract details - FIXED FOR VARIABLE INTEREST

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
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
  onSettleVehicleWithImpact,
  onUpdateRate
}) => {
  // Calculate TOTAL interest properly for variable contracts
  const getTotalInterest = () => {
    if (contract.interestType === 'variable') {
      // For variable: interestOutstanding + interest already paid
      const monthsElapsed = metrics.monthsElapsed || 0;
      const interestPaid = (metrics.monthlyInterest || 0) * monthsElapsed;
      return interestPaid + (metrics.interestOutstanding || 0);
    }
    // For fixed: use stored value
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
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Total Capital</div>
            <div style={styles.infoValue}>{formatCurrency(contract.totalCapital)}</div>
          </div>
          
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
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Monthly Capital Instalment</div>
            <div style={styles.infoValue}>{formatCurrency(metrics.currentMonthlyCapital)}</div>
          </div>

          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Monthly Interest Payment</div>
            <div style={styles.infoValue}>{formatCurrency(metrics.monthlyInterest || 0)}</div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Capital Outstanding</div>
            <div style={styles.infoValueHighlight}>{formatCurrency(metrics.capitalOutstanding)}</div>
          </div>

          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Interest Outstanding</div>
            <div style={styles.infoValueHighlight}>{formatCurrency(metrics.interestOutstanding || 0)}</div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Total Instalments</div>
            <div style={styles.infoValue}>{contract.totalInstalments} months</div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Months Remaining</div>
            <div style={styles.infoValue}>{metrics.monthsRemaining} months</div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>First Instalment Date</div>
            <div style={styles.infoValue}>{formatDate(contract.firstInstalmentDate)}</div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Progress</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${metrics.progress}%`}}></div>
              <span style={styles.progressText}>{Math.round(metrics.progress)}%</span>
            </div>
          </div>
        </div>
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
        onSettleVehicleWithImpact={onSettleVehicleWithImpact}
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
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  badgeActive: {
    background: '#C6F6D5',
    color: '#22543D'
  },
  badgeSettled: {
    background: '#E2E8F0',
    color: '#4A5568'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  infoItem: {
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  estimatedBadge: {
    fontSize: '10px',
    marginLeft: '6px',
    color: '#3B82F6',
    fontWeight: '500',
    fontStyle: 'italic'
  },
  infoValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A202C'
  },
  infoValueSecondary: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#3182CE'
  },
  infoValueHighlight: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#10B981'
  },
  progressBar: {
    position: 'relative',
    width: '100%',
    height: '32px',
    background: '#F1F5F9',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10B981, #34D399)',
    borderRadius: '8px',
    transition: 'width 0.5s ease'
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1A202C'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #F1F5F9'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
    color: '#DC2626',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  }
};

export default ContractViewSection;