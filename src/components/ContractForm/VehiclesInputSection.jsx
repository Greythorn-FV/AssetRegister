// File: src/components/ContractForm/VehiclesInputSection.jsx
// Vehicles input section with DVLA lookup and Net/Gross pricing

import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { colors, gradients, fonts, shadows, radius } from '../../styles/theme.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';

const VehiclesInputSection = ({
  vehicles,
  onVehicleChange,
  onAddVehicle,
  onRemoveVehicle
}) => {
  const isMobile = useIsMobile();
  const [lookupLoading, setLookupLoading] = useState({});
  const [lookupErrors, setLookupErrors] = useState({});

  // Handle net price change and auto-calculate gross
  const handleNetPriceChange = (index, value) => {
    // Calculate gross price (net + 20% VAT)
    const netAmount = parseFloat(value) || 0;
    const grossAmount = netAmount * 1.2;
    
    // Update both fields at once using object syntax
    onVehicleChange(index, {
      netPrice: value,
      grossPrice: grossAmount > 0 ? grossAmount.toFixed(2) : ''
    });
  };

  const handleVehicleLookup = async (index) => {
    const registration = vehicles[index]?.registration;
    
    if (!registration || registration.trim().length < 2) {
      setLookupErrors({ ...lookupErrors, [index]: 'Enter a registration number first' });
      return;
    }

    setLookupLoading({ ...lookupLoading, [index]: true });
    setLookupErrors({ ...lookupErrors, [index]: null });

    try {
      const functions = getFunctions();
      const lookupVehicle = httpsCallable(functions, 'lookupVehicle');
      const result = await lookupVehicle({ registration: registration.trim() });
      
      if (result.data.success) {
        onVehicleChange(index, 'make', result.data.make);
        onVehicleChange(index, 'model', result.data.model);
        onVehicleChange(index, 'registration', result.data.registration);
        setLookupErrors({ ...lookupErrors, [index]: null });
      }
    } catch (error) {
      console.error('Lookup error:', error);
      let errorMessage = 'Failed to lookup vehicle';
      if (error.code === 'not-found') errorMessage = 'Vehicle not found in DVLA database';
      else if (error.code === 'invalid-argument') errorMessage = 'Invalid registration format';
      else if (error.code === 'permission-denied') errorMessage = 'API key invalid';
      else if (error.code === 'resource-exhausted') errorMessage = 'Too many requests, try again later';
      else if (error.message) errorMessage = error.message;
      setLookupErrors({ ...lookupErrors, [index]: errorMessage });
    } finally {
      setLookupLoading({ ...lookupLoading, [index]: false });
    }
  };

  // Format number with commas for display
  const formatCurrency = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

          {/* Row 1: Registration, Make, Model */}
          <div style={{...styles.vehicleGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr'}}>
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

            {isMobile ? null : (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Make *</label>
                  <input type="text" value={vehicle.make} onChange={(e) => onVehicleChange(index, 'make', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Model *</label>
                  <input type="text" value={vehicle.model} onChange={(e) => onVehicleChange(index, 'model', e.target.value)} style={styles.input} />
                </div>
              </>
            )}
          </div>

          {/* Mobile: Make & Model row */}
          {isMobile && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Make *</label>
                <input type="text" value={vehicle.make} onChange={(e) => onVehicleChange(index, 'make', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Model *</label>
                <input type="text" value={vehicle.model} onChange={(e) => onVehicleChange(index, 'model', e.target.value)} style={styles.input} />
              </div>
            </div>
          )}

          {/* Row 2: Net Price and Gross Price */}
          <div style={styles.priceRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Net Price (excl. VAT)</label>
              <div style={styles.currencyInputWrapper}>
                <span style={styles.currencySymbol}>£</span>
                <input
                  type="number"
                  value={vehicle.netPrice || ''}
                  onChange={(e) => handleNetPriceChange(index, e.target.value)}
                  style={styles.currencyInput}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gross Price (incl. 20% VAT)</label>
              <div style={styles.currencyInputWrapper}>
                <span style={styles.currencySymbol}>£</span>
                <input
                  type="text"
                  value={formatCurrency(vehicle.grossPrice)}
                  style={{...styles.currencyInput, ...styles.readOnlyInput}}
                  readOnly
                  placeholder="0.00"
                />
              </div>
              <span style={styles.vatHint}>Auto-calculated</span>
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
    background: `linear-gradient(135deg, ${colors.surfaceHover} 0%, ${colors.background} 100%)`,
    padding: '20px',
    borderRadius: radius.lg,
    marginBottom: '16px',
    border: `2px solid ${colors.border}`,
    transition: 'all 0.2s ease'
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  vehicleNumber: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },
  priceRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.border}`
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
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textSecondary
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: `2px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface,
    boxSizing: 'border-box'
  },
  currencyInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  currencySymbol: {
    position: 'absolute',
    left: '14px',
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.base,
    zIndex: 1
  },
  currencyInput: {
    width: '100%',
    padding: '12px 14px 12px 30px',
    border: `2px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface,
    boxSizing: 'border-box'
  },
  readOnlyInput: {
    background: colors.background,
    color: colors.textPrimary,
    fontWeight: fonts.weight.semibold,
    cursor: 'not-allowed'
  },
  vatHint: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary,
    marginTop: '4px',
    fontStyle: 'italic'
  },
  inputButtonGroup: {
    display: 'flex',
    gap: '8px'
  },
  inputWithButton: {
    flex: 1,
    padding: '12px 14px',
    border: `2px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: fonts.size.base,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: colors.surface
  },
  lookupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    boxShadow: shadows.md
  },
  errorText: {
    fontSize: fonts.size.xs,
    color: colors.error,
    marginTop: '4px',
    fontWeight: fonts.weight.medium
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: `linear-gradient(135deg, ${colors.errorLight} 0%, ${colors.errorBorder} 100%)`,
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    color: colors.errorText,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    transition: 'all 0.2s ease'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px',
    background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.border} 100%)`,
    border: `2px dashed ${colors.borderDark}`,
    borderRadius: radius.lg,
    cursor: 'pointer',
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textSecondary,
    transition: 'all 0.2s ease'
  }
};

export default VehiclesInputSection;