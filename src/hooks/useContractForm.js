// File: src/hooks/useContractForm.js
// Custom hook for Contract Modal business logic

import { useState } from 'react';
import { addContract } from '../services/firestoreService.js';

const INITIAL_FORM_STATE = {
  contractNumber: '',
  totalCapital: '',
  totalInterest: '',
  interestType: 'fixed',
  baseRate: '',
  margin: '',
  totalInstalments: '',
  firstInstalmentDate: '',
  vehicles: [{ registration: '', make: '', model: '', netPrice: '', grossPrice: '' }]
};

export const useContractForm = (onSuccess, onClose) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Handle vehicle field changes - supports single field or multiple fields
  const handleVehicleChange = (index, fieldOrFields, value) => {
    const newVehicles = [...formData.vehicles];
    
    // Check if fieldOrFields is an object (multiple fields) or string (single field)
    if (typeof fieldOrFields === 'object') {
      // Multiple fields passed as an object like { netPrice: '100', grossPrice: '120' }
      newVehicles[index] = {
        ...newVehicles[index],
        ...fieldOrFields
      };
    } else {
      // Single field passed
      newVehicles[index] = {
        ...newVehicles[index],
        [fieldOrFields]: fieldOrFields === 'registration' ? value.toUpperCase() : value
      };
    }
    
    setFormData(prev => ({ ...prev, vehicles: newVehicles }));
  };

  // Add new vehicle field
  const addVehicleField = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { registration: '', make: '', model: '', netPrice: '', grossPrice: '' }]
    }));
  };

  // Remove vehicle field
  const removeVehicleField = (index) => {
    if (formData.vehicles.length > 1) {
      const newVehicles = formData.vehicles.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, vehicles: newVehicles }));
    }
  };

  // Validate form data
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

  // Build contract data object
  const buildContractData = () => {
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
        model: v.model.trim(),
        netPrice: parseFloat(v.netPrice) || 0,
        grossPrice: parseFloat(v.grossPrice) || 0
      }))
    };

    // Add interest fields based on type
    if (formData.interestType === 'fixed') {
      contractData.totalInterest = parseFloat(formData.totalInterest);
    } else {
      contractData.baseRate = parseFloat(formData.baseRate);
      contractData.margin = parseFloat(formData.margin);
      contractData.interestRateAnnual = parseFloat(formData.baseRate) + parseFloat(formData.margin);
      contractData.totalInterest = 0; // Will be calculated dynamically
    }

    return contractData;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const contractData = buildContractData();
      await addContract(contractData);

      // Reset form
      setFormData(INITIAL_FORM_STATE);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add contract');
    } finally {
      setLoading(false);
    }
  };

  // Calculate effective rate for variable interest
  const getEffectiveRate = () => {
    if (formData.baseRate && formData.margin) {
      return (parseFloat(formData.baseRate || 0) + parseFloat(formData.margin || 0)).toFixed(2);
    }
    return null;
  };

  // Check if we can show interest calculation
  const canShowInterestCalculation = () => {
    return formData.baseRate && 
           formData.margin && 
           formData.totalCapital && 
           formData.totalInstalments && 
           formData.firstInstalmentDate;
  };

  return {
    // State
    formData,
    loading,
    error,

    // Actions
    handleInputChange,
    handleVehicleChange,
    addVehicleField,
    removeVehicleField,
    handleSubmit,

    // Computed values
    effectiveRate: getEffectiveRate(),
    canShowCalculation: canShowInterestCalculation()
  };
};