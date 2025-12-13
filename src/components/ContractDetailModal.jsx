import React, { useState } from 'react';
import { X, Edit2, CheckCircle, Trash2, Percent } from 'lucide-react';
import RateChangeModal from './RateChangeModal.jsx';
import { settleVehicle, updateContract, deleteContract } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { formatDate } from '../utils/dateHelpers.js';

const ContractDetailModal = ({ contract, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateChangeModalOpen, setIsRateChangeModalOpen] = useState(false);

  if (!isOpen || !contract) return null;

  const metrics = calculateContractMetrics(contract);

  const handleEditClick = () => {
    setEditData({
      contractNumber: contract.contractNumber,
      totalCapital: contract.totalCapital,
      totalInterest: contract.totalInterest,
      totalInstalments: contract.totalInstalments,
      firstInstalmentDate: contract.firstInstalmentDate.split('T')[0],
      vehicles: contract.vehicles.map(v => ({ ...v }))
    });
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setError('');
  };

  const handleVehicleEditChange = (index, field, value) => {
    const newVehicles = [...editData.vehicles];
    newVehicles[index] = {
      ...newVehicles[index],
      [field]: field === 'registration' ? value.toUpperCase() : value
    };
    setEditData(prev => ({ ...prev, vehicles: newVehicles }));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!editData.contractNumber.trim()) {
        setError('Contract number is required');
        setLoading(false);
        return;
      }

      for (let i = 0; i < editData.vehicles.length; i++) {
        const v = editData.vehicles[i];
        if (!v.registration.trim()) {
          setError(`Vehicle ${i + 1}: Registration is required`);
          setLoading(false);
          return;
        }
        if (!v.make.trim()) {
          setError(`Vehicle ${i + 1}: Make is required`);
          setLoading(false);
          return;
        }
        if (!v.model.trim()) {
          setError(`Vehicle ${i + 1}: Model is required`);
          setLoading(false);
          return;
        }
      }

      const perVehicleRate = editData.totalCapital / editData.totalInstalments / editData.vehicles.length;
      const activeCount = editData.vehicles.filter(v => v.status === 'active').length;
      const monthlyInterest = editData.totalInterest / editData.totalInstalments;

      const updates = {
        contractNumber: editData.contractNumber.toUpperCase(),
        totalCapital: parseFloat(editData.totalCapital),
        totalInterest: parseFloat(editData.totalInterest),
        totalInstalments: parseInt(editData.totalInstalments),
        firstInstalmentDate: editData.firstInstalmentDate,
        vehicles: editData.vehicles,
        originalVehicleCount: editData.vehicles.length,
        activeVehiclesCount: activeCount,
        perVehicleCapitalRate: perVehicleRate,
        monthlyCapitalInstalment: editData.totalCapital / editData.totalInstalments,
        currentMonthlyCapital: perVehicleRate * activeCount,
        monthlyInterest,
        status: activeCount === 0 ? 'settled' : 'active'
      };

      await updateContract(contract.id, updates);
      
      setIsEditing(false);
      setEditData(null);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update contract');
    } finally {
      setLoading(false);
    }
  };

  const handleSettleVehicle = async (registration) => {
    if (!window.confirm(`Are you sure you want to settle vehicle ${registration}?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await settleVehicle(contract.id, registration);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to settle vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!window.confirm(`Are you sure you want to DELETE contract ${contract.contractNumber}? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteContract(contract.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete contract');
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {isEditing ? 'Edit Contract' : 'Contract Details'}
            </h2>
            <p style={styles.contractNumber}>{contract.contractNumber}</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {!isEditing ? (
            <>
              {/* View Mode */}
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
                    <div style={styles.infoLabel}>Total Interest</div>
                    <div style={styles.infoValueSecondary}>{formatCurrency(contract.totalInterest)}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Monthly Capital Instalment</div>
                    <div style={styles.infoValue}>{formatCurrency(metrics.currentMonthlyCapital)}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Capital Outstanding</div>
                    <div style={styles.infoValueHighlight}>{formatCurrency(metrics.capitalOutstanding)}</div>
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

              {/* Interest Rate Section - ONLY for Variable Interest */}
              {contract.interestType === 'variable' && (
                <div style={styles.section}>
                  <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>Interest Rate</h3>
                    <button 
                      onClick={() => setIsRateChangeModalOpen(true)} 
                      style={styles.updateRateButton}
                      disabled={loading}
                    >
                      <Percent size={16} />
                      Update Rate
                    </button>
                  </div>

                  <div style={styles.rateInfoBox}>
                    <div style={styles.rateRow}>
                      <span style={styles.rateLabel}>Current Base Rate:</span>
                      <span style={styles.rateValue}>{(contract.baseRate || 0).toFixed(2)}%</span>
                    </div>
                    <div style={styles.rateRow}>
                      <span style={styles.rateLabel}>Fixed Margin:</span>
                      <span style={styles.rateValue}>+{(contract.margin || 0).toFixed(2)}%</span>
                    </div>
                    <div style={styles.rateRow}>
                      <span style={styles.rateLabel}>Effective Rate:</span>
                      <span style={styles.rateValueBig}>
                        {((contract.baseRate || 0) + (contract.margin || 0)).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Rate History */}
                  {contract.rateHistory && contract.rateHistory.length > 0 && (
                    <div style={styles.rateHistory}>
                      <div style={styles.historyTitle}>Rate Change History</div>
                      {contract.rateHistory.map((change, index) => (
                        <div key={index} style={styles.historyItem}>
                          <div style={styles.historyDate}>
                            {new Date(change.date).toLocaleDateString('en-GB')}
                          </div>
                          <div style={styles.historyChange}>
                            {change.oldEffectiveRate.toFixed(2)}% → {change.newEffectiveRate.toFixed(2)}%
                            <span style={{
                              ...styles.historyDiff,
                              color: change.newEffectiveRate > change.oldEffectiveRate ? '#DC2626' : '#059669'
                            }}>
                              ({change.newEffectiveRate > change.oldEffectiveRate ? '+' : ''}
                              {(change.newEffectiveRate - change.oldEffectiveRate).toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Vehicles List */}
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
                            <button
                              onClick={() => handleSettleVehicle(vehicle.registration)}
                              style={styles.settleButton}
                              disabled={loading}
                            >
                              <CheckCircle size={16} />
                              Settle
                            </button>
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

              {/* Action Buttons */}
              <div style={styles.footer}>
                <button onClick={handleDeleteContract} style={styles.deleteButton} disabled={loading}>
                  <Trash2 size={18} />
                  Delete Contract
                </button>
                <button onClick={handleEditClick} style={styles.editButton} disabled={loading}>
                  <Edit2 size={18} />
                  Edit Contract
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div style={styles.section}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contract Number *</label>
                  <input
                    type="text"
                    value={editData.contractNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, contractNumber: e.target.value.toUpperCase() }))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Capital *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.totalCapital}
                      onChange={(e) => setEditData(prev => ({ ...prev, totalCapital: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Interest *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.totalInterest}
                      onChange={(e) => setEditData(prev => ({ ...prev, totalInterest: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Instalments *</label>
                    <input
                      type="number"
                      value={editData.totalInstalments}
                      onChange={(e) => setEditData(prev => ({ ...prev, totalInstalments: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>First Instalment Date *</label>
                    <input
                      type="date"
                      value={editData.firstInstalmentDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstInstalmentDate: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                </div>

                <h3 style={styles.sectionTitle}>Vehicles</h3>
                {editData.vehicles.map((vehicle, index) => (
                  <div key={index} style={styles.editVehicleCard}>
                    <div style={styles.vehicleEditHeader}>
                      <span style={styles.vehicleNumber}>Vehicle {index + 1}</span>
                      <span style={{
                        ...styles.vehicleBadge,
                        ...(vehicle.status === 'active' ? styles.vehicleBadgeActive : styles.vehicleBadgeSettled)
                      }}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div style={styles.vehicleEditFields}>
                      <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Registration *</label>
                        <input
                          type="text"
                          value={vehicle.registration}
                          onChange={(e) => handleVehicleEditChange(index, 'registration', e.target.value)}
                          style={styles.input}
                          disabled={vehicle.status === 'settled'}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Make *</label>
                        <input
                          type="text"
                          value={vehicle.make}
                          onChange={(e) => handleVehicleEditChange(index, 'make', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Model *</label>
                        <input
                          type="text"
                          value={vehicle.model}
                          onChange={(e) => handleVehicleEditChange(index, 'model', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.footer}>
                <button onClick={handleCancelEdit} style={styles.cancelButton} disabled={loading}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} style={styles.saveButton} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rate Change Modal */}
      {contract.interestType === 'variable' && (
        <RateChangeModal
          contract={contract}
          isOpen={isRateChangeModalOpen}
          onClose={() => setIsRateChangeModalOpen(false)}
          onSuccess={() => {
            setIsRateChangeModalOpen(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: '1px solid #E2E8F0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '4px'
  },
  contractNumber: {
    fontSize: '14px',
    color: '#718096'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#718096'
  },
  content: {
    padding: '24px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  updateRateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#F59E0B',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rateInfoBox: {
    background: '#FFFBEB',
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid #FCD34D',
    marginBottom: '16px'
  },
  rateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #FEF3C7'
  },
  rateLabel: {
    fontSize: '14px',
    color: '#92400E',
    fontWeight: '500'
  },
  rateValue: {
    fontSize: '14px',
    color: '#78350F',
    fontWeight: '600'
  },
  rateValueBig: {
    fontSize: '18px',
    color: '#78350F',
    fontWeight: '700'
  },
  rateHistory: {
    background: '#F7FAFC',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0'
  },
  historyTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: '12px'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'white',
    borderRadius: '6px',
    marginBottom: '8px',
    border: '1px solid #E2E8F0'
  },
  historyDate: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '500'
  },
  historyChange: {
    fontSize: '13px',
    color: '#1A202C',
    fontWeight: '600'
  },
  historyDiff: {
    marginLeft: '8px',
    fontSize: '12px',
    fontWeight: '700'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  infoItem: {
    padding: '12px',
    background: '#F7FAFC',
    borderRadius: '6px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C'
  },
  infoValueSecondary: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#718096'
  },
  infoValueHighlight: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#3182CE'
  },
  progressBar: {
    position: 'relative',
    height: '24px',
    background: '#E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: '#48BB78',
    transition: 'width 0.3s'
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1A202C'
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
  },
  editVehicleCard: {
    padding: '16px',
    background: '#F7FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    marginBottom: '12px'
  },
  vehicleEditHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  vehicleNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A202C'
  },
  vehicleEditFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4A5568'
  },
  labelSmall: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#4A5568'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  error: {
    background: '#FED7D7',
    color: '#C53030',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #E2E8F0'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#FED7D7',
    color: '#C53030',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#EDF2F7',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4A5568'
  },
  saveButton: {
    padding: '10px 20px',
    background: '#48BB78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default ContractDetailModal;