// File: src/components/ContractForm/VehiclesStep.jsx
// Step 2: Vehicles container component - PRODUCTION READY

import React from 'react';
import { Car } from 'lucide-react';
import { colors, fonts } from '../../styles/theme.js';
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
        <Car size={20} style={{color: colors.accent}} />
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
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  }
};

export default VehiclesStep;