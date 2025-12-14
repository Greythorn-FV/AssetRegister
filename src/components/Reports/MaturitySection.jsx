// File: src/components/Reports/MaturitySection.jsx
// Pure UI component for displaying maturity reports

import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currencyHelpers.js';

const MaturitySection = ({ title, contracts, icon, iconColor, bgGradient, getTotalCapital, getTotalVehicles }) => {
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
                  <Clock size={16} />
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

const styles = {
  section: {
    marginBottom: '40px'
  },
  sectionHeader: {
    marginBottom: '24px'
  },
  sectionTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  sectionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0
  },
  sectionTitle: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#0F172A'
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '16px',
    border: '2px dashed #E2E8F0'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '6px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748B'
  },
  contractsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  maturityCard: {
    padding: '24px',
    borderRadius: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.4)'
  },
  contractNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '6px'
  },
  conclusionDate: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: '600'
  },
  daysCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#DC2626',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  cardMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  cardMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A'
  },
  variableBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#92400E',
    border: '1px solid #FCD34D',
    marginBottom: '16px'
  },
  vehiclesList: {
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    padding: '12px',
    marginTop: '12px'
  },
  vehiclesTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  vehicleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '13px'
  },
  vehicleReg: {
    fontWeight: '700',
    color: '#0F172A'
  },
  vehicleMake: {
    color: '#64748B',
    fontWeight: '600'
  },
  vehicleMore: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600',
    fontStyle: 'italic',
    paddingTop: '6px',
    borderTop: '1px solid rgba(100, 116, 139, 0.2)'
  }
};

export default MaturitySection;