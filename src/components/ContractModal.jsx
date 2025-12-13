// File: C:\Asset Register\src\components\ContractModal.jsx
// UPDATED VERSION WITH INTEREST TYPE OPTIONS

import React, { useState } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { addContract } from '../services/firestoreService.js';
import { formatCurrency } from '../utils/currencyHelpers.js';

const ContractModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    contractNumber: '',
    totalCapital: '',
    totalInterest: '',
    interestType: 'fixed', // 'fixed' or 'variable'
    baseRate: '',
    margin: '',
    totalInstalments: '',
    firstInstalmentDate: '',
    vehicles: [{ registration: '', make: '', model: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };
  
  const handleVehicleChange = (index, field, value) => {
    const newVehicles = [...formData.vehicles];
    newVehicles[index] = {
      ...newVehicles[index],
      [field]: field === 'registration' ? value.toUpperCase() : value
    };
    setFormData(prev => ({ ...prev, vehicles: newVehicles }));
  };
  
  const addVehicleField = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { registration: '', make: '', model: '' }]
    }));
  };
  
  const removeVehicleField = (index) => {
    if (formData.vehicles.length > 1) {
      const newVehicles = formData.vehicles.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, vehicles: newVehicles }));
    }
  };
  
  const validateForm = () => {
    if (!formData.contractNumber.trim()) {
      setError('Contract number is required');
      return false;
    }
    if (!formData.totalCapital || parseFloat(formData.totalCapital) <= 0) {
      setError('Valid total capital is required');
      return false;
    }
    
    // Validate interest based on type
    if (formData.interestType === 'fixed') {
      if (!formData.totalInterest || parseFloat(formData.totalInterest) < 0) {
        setError('Valid total interest is required for fixed interest contracts');
        return false;
      }
    } else {
      if (!formData.baseRate || parseFloat(formData.baseRate) < 0) {
        setError('Valid base rate is required for variable interest contracts');
        return false;
      }
      if (!formData.margin || parseFloat(formData.margin) < 0) {
        setError('Valid margin is required for variable interest contracts');
        return false;
      }
    }
    
    if (!formData.totalInstalments || parseInt(formData.totalInstalments) <= 0) {
      setError('Valid number of instalments is required');
      return false;
    }
    if (!formData.firstInstalmentDate) {
      setError('First instalment date is required');
      return false;
    }
    
    const validVehicles = formData.vehicles.filter(v => v.registration.trim() !== '');
    if (validVehicles.length === 0) {
      setError('At least one vehicle registration is required');
      return false;
    }
    
    for (let i = 0; i < validVehicles.length; i++) {
      if (!validVehicles[i].make.trim()) {
        setError(`Vehicle ${i + 1}: Make is required`);
        return false;
      }
      if (!validVehicles[i].model.trim()) {
        setError(`Vehicle ${i + 1}: Model is required`);
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const validVehicles = formData.vehicles.filter(v => v.registration.trim() !== '');
      
      const contractData = {
        contractNumber: formData.contractNumber.trim(),
        totalCapital: parseFloat(formData.totalCapital),
        interestType: formData.interestType,
        totalInstalments: parseInt(formData.totalInstalments),
        firstInstalmentDate: formData.firstInstalmentDate,
        originalVehicleCount: validVehicles.length,
        vehicles: validVehicles.map(v => ({
          registration: v.registration.trim(),
          make: v.make.trim(),
          model: v.model.trim()
        }))
      };
      
      // Add interest fields based on type
      if (formData.interestType === 'fixed') {
        contractData.totalInterest = parseFloat(formData.totalInterest);
      } else {
        contractData.baseRate = parseFloat(formData.baseRate);
        contractData.margin = parseFloat(formData.margin);
        contractData.interestRateAnnual = parseFloat(formData.baseRate) + parseFloat(formData.margin);
        // For variable, calculate estimated total interest
        contractData.totalInterest = 0; // Will be calculated dynamically
      }
      
      await addContract(contractData);
      
      setFormData({
        contractNumber: '',
        totalCapital: '',
        totalInterest: '',
        interestType: 'fixed',
        baseRate: '',
        margin: '',
        totalInstalments: '',
        firstInstalmentDate: '',
        vehicles: [{ registration: '', make: '', model: '' }]
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add contract');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Contract</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Contract Number *</label>
            <input
              type="text"
              value={formData.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value.toUpperCase())}
              style={styles.input}
              placeholder="CT001"
            />
          </div>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Finance Due (Capital) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalCapital}
                onChange={(e) => handleInputChange('totalCapital', e.target.value)}
                style={styles.input}
                placeholder="14436.83"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Interest Type *</label>
              <select
                value={formData.interestType}
                onChange={(e) => handleInputChange('interestType', e.target.value)}
                style={styles.input}
              >
                <option value="fixed">Fixed Interest (Total Amount)</option>
                <option value="variable">Variable Interest (Base Rate + Margin)</option>
              </select>
            </div>
          </div>
          
          {/* FIXED INTEREST */}
          {formData.interestType === 'fixed' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Interest (Estimated) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalInterest}
                onChange={(e) => handleInputChange('totalInterest', e.target.value)}
                style={styles.input}
                placeholder="1950.80"
              />
              <div style={styles.helpText}>
                Total estimated interest for the entire contract period
              </div>
            </div>
          )}
          
          {/* VARIABLE INTEREST */}
{formData.interestType === 'variable' && (
  <>
    <div style={styles.infoBox}>
      <Info size={16} />
      <span>Variable interest is calculated daily on outstanding balance. Like HSBC Fully Variable Purchase.</span>
    </div>
    
    <div style={styles.row}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Base Rate (%) *</label>
        <input
          type="number"
          step="0.01"
          value={formData.baseRate}
          onChange={(e) => handleInputChange('baseRate', e.target.value)}
          style={styles.input}
          placeholder="5.25"
        />
        <div style={styles.helpText}>Bank of England base rate</div>
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Margin (%) *</label>
        <input
          type="number"
          step="0.01"
          value={formData.margin}
          onChange={(e) => handleInputChange('margin', e.target.value)}
          style={styles.input}
          placeholder="3.50"
        />
        <div style={styles.helpText}>Fixed margin above base rate</div>
      </div>
    </div>
    
    {formData.baseRate && formData.margin && (
      <div style={styles.calculatedRate}>
        <strong>Effective Annual Rate:</strong> {(parseFloat(formData.baseRate || 0) + parseFloat(formData.margin || 0)).toFixed(2)}%
      </div>
    )}

    {/* AUTO-CALCULATE TOTAL INTEREST */}
    {formData.baseRate && formData.margin && formData.totalCapital && formData.totalInstalments && (
      <div style={styles.calculatedInterest}>
        <div style={styles.calculationTitle}>
          💰 Estimated Total Interest Calculation
        </div>
        
        <div style={styles.calculationSteps}>
          <div style={styles.calculationStep}>
            <span style={styles.stepLabel}>Capital Amount:</span>
            <span style={styles.stepValue}>{formatCurrency(parseFloat(formData.totalCapital))}</span>
          </div>
          
          <div style={styles.calculationStep}>
            <span style={styles.stepLabel}>Annual Rate:</span>
            <span style={styles.stepValue}>
              {(parseFloat(formData.baseRate || 0) + parseFloat(formData.margin || 0)).toFixed(2)}%
            </span>
          </div>
          
          <div style={styles.calculationStep}>
            <span style={styles.stepLabel}>Contract Length:</span>
            <span style={styles.stepValue}>{formData.totalInstalments} months</span>
          </div>
          
          <div style={styles.calculationDivider}></div>
          
          <div style={styles.calculationFormula}>
            <div style={styles.formulaTitle}>How it's calculated:</div>
            <div style={styles.formulaText}>
              Interest is calculated daily on the outstanding balance. 
              As you pay down capital each month, interest decreases.
            </div>
          </div>
          
          {(() => {
            const capital = parseFloat(formData.totalCapital || 0);
            const rate = (parseFloat(formData.baseRate || 0) + parseFloat(formData.margin || 0)) / 100;
            const months = parseInt(formData.totalInstalments || 0);
            
            // Calculate declining balance interest
            let totalInterest = 0;
            let remainingCapital = capital;
            const monthlyCapitalPayment = capital / months;
            
            for (let i = 0; i < months; i++) {
              const dailyRate = rate / 365;
              const monthlyInterest = remainingCapital * dailyRate * 30; // Approximate 30 days
              totalInterest += monthlyInterest;
              remainingCapital -= monthlyCapitalPayment;
              if (remainingCapital < 0) remainingCapital = 0;
            }
            
            return (
              <>
                <div style={styles.calculationBreakdown}>
                  <div style={styles.breakdownRow}>
                    <span>Month 1 Interest:</span>
                    <span>{formatCurrency(capital * (rate / 365) * 30)}</span>
                  </div>
                  <div style={styles.breakdownRow}>
                    <span>Month {Math.floor(months/2)} Interest:</span>
                    <span>{formatCurrency((capital * 0.5) * (rate / 365) * 30)}</span>
                  </div>
                  <div style={styles.breakdownRow}>
                    <span>Final Month Interest:</span>
                    <span>{formatCurrency((monthlyCapitalPayment) * (rate / 365) * 30)}</span>
                  </div>
                </div>
                
                <div style={styles.totalInterestBox}>
                  <div style={styles.totalInterestLabel}>ESTIMATED TOTAL INTEREST:</div>
                  <div style={styles.totalInterestValue}>{formatCurrency(totalInterest)}</div>
                  <div style={styles.totalInterestNote}>
                    ⚠️ Compare this with your contract's "Estimated Financed Charges"
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}
  </>
)}
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Instalments *</label>
              <input
                type="number"
                value={formData.totalInstalments}
                onChange={(e) => handleInputChange('totalInstalments', e.target.value)}
                style={styles.input}
                placeholder="36"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>First Instalment Date *</label>
              <input
                type="date"
                value={formData.firstInstalmentDate}
                onChange={(e) => handleInputChange('firstInstalmentDate', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Vehicles *</label>
            {formData.vehicles.map((vehicle, index) => (
              <div key={index} style={styles.vehicleCard}>
                <div style={styles.vehicleHeader}>
                  <span style={styles.vehicleNumber}>Vehicle {index + 1}</span>
                  {formData.vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVehicleField(index)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
                
                <div style={styles.vehicleFields}>
                  <div style={styles.formGroup}>
                    <label style={styles.labelSmall}>Registration *</label>
                    <input
                      type="text"
                      value={vehicle.registration}
                      onChange={(e) => handleVehicleChange(index, 'registration', e.target.value)}
                      style={styles.input}
                      placeholder="ABC123"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.labelSmall}>Make *</label>
                    <input
                      type="text"
                      value={vehicle.make}
                      onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                      style={styles.input}
                      placeholder="Ford"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.labelSmall}>Model *</label>
                    <input
                      type="text"
                      value={vehicle.model}
                      onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                      style={styles.input}
                      placeholder="Transit"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVehicleField} style={styles.addButton}>
              <Plus size={18} />
              Add Another Vehicle
            </button>
          </div>
          
          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelButton} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Adding...' : 'Add Contract'}
            </button>
          </div>
        </form>
      </div>
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
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E2E8F0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#718096'
  },
  form: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568'
  },
  labelSmall: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4A5568'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  helpText: {
    fontSize: '11px',
    color: '#718096',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  infoBox: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    background: '#DBEAFE',
    border: '1px solid #93C5FD',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#1E3A8A'
  },
  calculatedRate: {
    padding: '12px',
    background: '#F0FDF4',
    border: '1px solid #86EFAC',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#14532D'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  vehicleCard: {
    background: '#F7FAFC',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #E2E8F0'
  },
  vehicleHeader: {
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
  vehicleFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px'
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#FED7D7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#C53030',
    fontSize: '12px',
    fontWeight: '600'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#EDF2F7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568',
    marginTop: '8px'
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
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #E2E8F0'
  },
  calculatedInterest: {
  background: '#F0FDF4',
  border: '2px solid #86EFAC',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '16px',
  marginBottom: '16px'
},
calculationTitle: {
  fontSize: '16px',
  fontWeight: '700',
  color: '#14532D',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
},
calculationSteps: {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
},
calculationStep: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  background: 'white',
  borderRadius: '6px',
  border: '1px solid #BBF7D0'
},
stepLabel: {
  fontSize: '13px',
  color: '#15803D',
  fontWeight: '500'
},
stepValue: {
  fontSize: '14px',
  color: '#14532D',
  fontWeight: '700'
},
calculationDivider: {
  height: '1px',
  background: '#BBF7D0',
  margin: '8px 0'
},
calculationFormula: {
  padding: '12px',
  background: 'white',
  borderRadius: '6px',
  border: '1px solid #BBF7D0'
},
formulaTitle: {
  fontSize: '12px',
  fontWeight: '600',
  color: '#15803D',
  marginBottom: '6px'
},
formulaText: {
  fontSize: '12px',
  color: '#4A5568',
  lineHeight: '1.5'
},
calculationBreakdown: {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  background: 'white',
  borderRadius: '6px',
  border: '1px solid #BBF7D0',
  marginTop: '12px'
},
breakdownRow: {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: '#4A5568'
},
totalInterestBox: {
  marginTop: '16px',
  padding: '16px',
  background: '#DCFCE7',
  borderRadius: '8px',
  border: '2px solid #22C55E',
  textAlign: 'center'
},
totalInterestLabel: {
  fontSize: '12px',
  fontWeight: '600',
  color: '#15803D',
  letterSpacing: '0.5px',
  marginBottom: '8px'
},
totalInterestValue: {
  fontSize: '28px',
  fontWeight: '700',
  color: '#14532D',
  marginBottom: '8px'
},
totalInterestNote: {
  fontSize: '12px',
  color: '#15803D',
  fontWeight: '500',
  marginTop: '8px'
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
  submitButton: {
    padding: '10px 20px',
    background: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};


export default ContractModal;