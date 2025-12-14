// File: src/components/ContractForm/VehiclesStep.jsx
// Step 2: Vehicles container component - PRODUCTION READY

import React from 'react';
import { Car } from 'lucide-react';
import VehiclesInputSection from './VehiclesInputSection.jsx';

const VehiclesStep = ({ 
  vehicles, 
  onVehicleChange, 
  onAddVehicle, 
  onRemoveVehicle 
}) => {
  return (
    <div>
      <div style={styles.sectionHeader}>
        <Car size={20} style={{color: '#667eea'}} />
        <span>Vehicles on this contract</span>
      </div>

      <VehiclesInputSection
        vehicles={vehicles}
        onVehicleChange={onVehicleChange}
        onAddVehicle={onAddVehicle}
        onRemoveVehicle={onRemoveVehicle}
      />
    </div>
  );
};

const styles = {
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  }
};

export default VehiclesStep;