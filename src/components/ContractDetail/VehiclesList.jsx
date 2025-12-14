// File: src/components/ContractDetail/VehiclesList.jsx
// Vehicles list component

import React from 'react';
import { CheckCircle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyHelpers.js';
import { formatDate } from '../../utils/dateHelpers.js';

const VehiclesList = ({ 
  contract, 
  metrics, 
  loading,
  onSettleVehicle,
  onSettleVehicleWithImpact
}) => {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        Vehicles ({contract.activeVehiclesCount} active of {contract.originalVehicleCount} total)
      </h3>
      <div style={styles.vehiclesList}>
        {contract.vehicles.map((vehicle, index) => (
          <div key={index} style={styles.vehicleCard}>
            <div style={styles.vehicleHeader}>
              <div>
                <div style={styles.vehicleReg}>{vehicle.registration}</div>
                <div style={styles.vehicleMakeModel}>{vehicle.make} {vehicle.model}</div>
              </div>
              <div style={styles.vehicleActions}>
                <span style={{
                  ...styles.vehicleBadge,
                  ...(vehicle.status === 'active' ? styles.vehicleBadgeActive : styles.vehicleBadgeSettled)
                }}>
                  {vehicle.status}
                </span>
                {vehicle.status === 'active' && (
                  <>
                    {contract.interestType === 'variable' ? (
                      <button
                        onClick={() => onSettleVehicleWithImpact(vehicle)}
                        style={styles.analyzeButton}
                        disabled={loading}
                      >
                        <TrendingDown size={16} />
                        Analyze Settlement
                      </button>
                    ) : (
                      <button
                        onClick={() => onSettleVehicle(vehicle.registration)}
                        style={styles.settleButton}
                        disabled={loading}
                      >
                        <CheckCircle size={16} />
                        Settle
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {vehicle.status === 'active' && (
              <div style={styles.vehicleMetrics}>
                <div style={styles.vehicleMetric}>
                  <span style={styles.metricLabel}>Monthly Capital:</span>
                  <span style={styles.metricValue}>{formatCurrency(contract.perVehicleCapitalRate)}</span>
                </div>
                <div style={styles.vehicleMetric}>
                  <span style={styles.metricLabel}>Outstanding:</span>
                  <span style={styles.metricValue}>
                    {formatCurrency(contract.perVehicleCapitalRate * metrics.monthsRemaining)}
                  </span>
                </div>
              </div>
            )}
            {vehicle.status === 'settled' && vehicle.settledDate && (
              <div style={styles.settledInfo}>
                Settled on: {formatDate(vehicle.settledDate)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '16px'
  },
  vehiclesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  vehicleCard: {
    padding: '16px',
    background: '#F7FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0'
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  vehicleReg: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C'
  },
  vehicleMakeModel: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '2px'
  },
  vehicleActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  vehicleBadge: {
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  vehicleBadgeActive: {
    background: '#C6F6D5',
    color: '#22543D'
  },
  vehicleBadgeSettled: {
    background: '#E2E8F0',
    color: '#4A5568'
  },
  settleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#48BB78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  vehicleMetrics: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #E2E8F0'
  },
  vehicleMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '11px',
    color: '#718096'
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A202C'
  },
  settledInfo: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '8px',
    fontStyle: 'italic'
  }
};

export default VehiclesList;