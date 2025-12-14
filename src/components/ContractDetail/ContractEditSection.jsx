// File: src/components/ContractDetail/ContractEditSection.jsx
// Edit mode for contract details

import React from 'react';

const ContractEditSection = ({ 
  editData, 
  loading,
  onDataChange,
  onVehicleChange,
  onSave,
  onCancel
}) => {
  return (
    <>
      <div style={styles.section}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Contract Number *</label>
          <input
            type="text"
            value={editData.contractNumber}
            onChange={(e) => onDataChange('contractNumber', e.target.value.toUpperCase())}
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
              onChange={(e) => onDataChange('totalCapital', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Total Interest *</label>
            <input
              type="number"
              step="0.01"
              value={editData.totalInterest}
              onChange={(e) => onDataChange('totalInterest', e.target.value)}
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
              onChange={(e) => onDataChange('totalInstalments', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Instalment Date *</label>
            <input
              type="date"
              value={editData.firstInstalmentDate}
              onChange={(e) => onDataChange('firstInstalmentDate', e.target.value)}
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
                  onChange={(e) => onVehicleChange(index, 'registration', e.target.value)}
                  style={styles.input}
                  disabled={vehicle.status === 'settled'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.labelSmall}>Make *</label>
                <input
                  type="text"
                  value={vehicle.make}
                  onChange={(e) => onVehicleChange(index, 'make', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.labelSmall}>Model *</label>
                <input
                  type="text"
                  value={vehicle.model}
                  onChange={(e) => onVehicleChange(index, 'model', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={onCancel} style={styles.cancelButton} disabled={loading}>
          Cancel
        </button>
        <button onClick={onSave} style={styles.saveButton} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
};

const styles = {
  section: {
    marginBottom: '24px'
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
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '16px'
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
  vehicleEditFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #E2E8F0'
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

export default ContractEditSection;