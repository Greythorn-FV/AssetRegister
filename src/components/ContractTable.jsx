import React from 'react';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { formatDate } from '../utils/dateHelpers.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ContractTable = ({ contracts, onContractClick }) => {
  if (!contracts || contracts.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No contracts found</p>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Contract</th>
            <th style={styles.th}>Vehicles</th>
            <th style={styles.th}>Monthly Capital</th>
            <th style={styles.th}>Capital Outstanding</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Next Payment</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(contract => {
            const metrics = calculateContractMetrics(contract);
            
            return (
              <tr
                key={contract.id}
                style={styles.tr}
                onClick={() => onContractClick && onContractClick(contract)}
              >
                <td style={styles.td}>
  <div style={styles.contractNumber}>{contract.contractNumber}</div>
  <div style={styles.subtitle}>
    {contract.vehicles && contract.vehicles.length > 0 
      ? contract.vehicles.map(v => `${v.make} ${v.model}`).slice(0, 2).join(', ')
      : `${contract.originalVehicleCount} vehicles`}
    {contract.vehicles && contract.vehicles.length > 2 && ` +${contract.vehicles.length - 2} more`}
  </div>
</td>
                <td style={styles.td}>
                  <div style={styles.vehicleCount}>
                    {contract.activeVehiclesCount} of {contract.originalVehicleCount}
                  </div>
                  <div style={styles.subtitle}>active</div>
                </td>
                <td style={styles.td}>
                  <div style={styles.amount}>
  {formatCurrency(metrics.currentMonthlyCapital)}
</div>
<div style={styles.subtitle}>
  {formatCurrency(metrics.monthlyInterest)} interest
  {contract.interestType === 'variable' && (
    <span style={{ marginLeft: '4px', color: '#F59E0B' }}>
      ⚡ Variable
    </span>
  )}
</div>
                </td>
                <td style={styles.td}>
                  <div style={styles.amount}>
                    {formatCurrency(metrics.capitalOutstanding)}
                  </div>
                  <div style={styles.subtitle}>
                    {metrics.monthsRemaining} months left
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    ...(contract.status === 'active' ? styles.badgeActive : styles.badgeSettled)
                  }}>
                    {contract.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.date}>
                    {formatDate(contract.firstInstalmentDate)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: '#F7FAFC',
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #E2E8F0'
  },
  tr: {
    borderBottom: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1A202C'
  },
  contractNumber: {
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#A0AEC0'
  },
  vehicleCount: {
    fontWeight: '500',
    marginBottom: '4px'
  },
  amount: {
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '4px'
  },
  date: {
    fontSize: '14px',
    color: '#4A5568'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
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
  empty: {
    background: 'white',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: '14px'
  }
};

export default ContractTable;