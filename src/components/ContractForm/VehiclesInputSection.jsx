// File: src/components/ContractForm/VehiclesInputSection.jsx
// Vehicles input section with DVLA lookup

import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const VehiclesInputSection = ({ 
  vehicles, 
  onVehicleChange, 
  onAddVehicle, 
  onRemoveVehicle 
}) => {
  const [lookupLoading, setLookupLoading] = useState({});
  const [lookupErrors, setLookupErrors] = useState({});

  const handleVehicleLookup = async (index) => {
    const registration = vehicles[index]?.registration;
    
    console.log('Registration value:', registration); // DEBUG
    
    if (!registration || registration.trim().length < 2) {
      setLookupErrors({ ...lookupErrors, [index]: 'Enter a registration number first' });
      return;
    }

    setLookupLoading({ ...lookupLoading, [index]: true });
    setLookupErrors({ ...lookupErrors, [index]: null });

    try {
      const functions = getFunctions();
      const lookupVehicle = httpsCallable(functions, 'lookupVehicle');
      
      console.log('Calling function with:', { registration: registration.trim() }); // DEBUG
      
      const result = await lookupVehicle({ registration: registration.trim() });
      
      if (result.data.success) {
        // Auto-fill the make and model
        onVehicleChange(index, 'make', result.data.make);
        onVehicleChange(index, 'model', result.data.model);
        
        // Optionally update registration to the cleaned format
        onVehicleChange(index, 'registration', result.data.registration);
        
        setLookupErrors({ ...lookupErrors, [index]: null });
      }
    } catch (error) {
      console.error('Lookup error:', error);
      
      let errorMessage = 'Failed to lookup vehicle';
      
      if (error.code === 'not-found') {
        errorMessage = 'Vehicle not found in DVLA database';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid registration format';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'API key invalid';
      } else if (error.code === 'resource-exhausted') {
        errorMessage = 'Too many requests, try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLookupErrors({ ...lookupErrors, [index]: errorMessage });
    } finally {
      setLookupLoading({ ...lookupLoading, [index]: false });
    }
  };

  return (
    <div style={styles.container}>
      {vehicles.map((vehicle, index) => (
        <div key={index} style={styles.vehicleCard}>
          <div style={styles.vehicleHeader}>
            <span style={styles.vehicleNumber}>Vehicle {index + 1}</span>
            {vehicles.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveVehicle(index)}
                style={styles.removeButton}
              >
                <X size={16} />
                Remove
              </button>
            )}
          </div>

          <div style={styles.vehicleGrid}>
            <div style={styles.formGroupWithButton}>
              <label style={styles.label}>Registration *</label>
              <div style={styles.inputButtonGroup}>
                <input
                  type="text"
                  value={vehicle.registration}
                  onChange={(e) => onVehicleChange(index, 'registration', e.target.value.toUpperCase())}
                  style={styles.inputWithButton}
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => handleVehicleLookup(index)}
                  style={styles.lookupButton}
                  disabled={lookupLoading[index]}
                >
                  <Search size={16} />
                  {lookupLoading[index] ? 'Looking up...' : 'Lookup'}
                </button>
              </div>
              {lookupErrors[index] && (
                <div style={styles.errorText}>{lookupErrors[index]}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Make *</label>
              <input
                type="text"
                value={vehicle.make}
                onChange={(e) => onVehicleChange(index, 'make', e.target.value)}
                style={styles.input}
                placeholder=""
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Model *</label>
              <input
                type="text"
                value={vehicle.model}
                onChange={(e) => onVehicleChange(index, 'model', e.target.value)}
                style={styles.input}
                placeholder=""
              />
            </div>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={onAddVehicle} 
        style={styles.addButton}
      >
        <Plus size={18} />
        Add Another Vehicle
      </button>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px'
  },
  vehicleCard: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  vehicleNumber: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px'
  },
  formGroup: {
    marginBottom: '0'
  },
  formGroupWithButton: {
    marginBottom: '0'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: '#ffffff'
  },
  inputButtonGroup: {
    display: 'flex',
    gap: '8px'
  },
  inputWithButton: {
    flex: 1,
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: '#ffffff'
  },
  lookupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(75, 109, 139, 0.2)'
  },
  errorText: {
    fontSize: '11px',
    color: '#DC2626',
    marginTop: '4px',
    fontWeight: '500'
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#991b1b',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    transition: 'all 0.2s ease'
  }
};

export default VehiclesInputSection;