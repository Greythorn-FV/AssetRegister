// File: src/hooks/useContractDetail.js
// Custom hook for Contract Detail Modal business logic - WITH STATEMENT MODAL

import { useState } from 'react';
import { settleVehicle, updateContract, deleteContract } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';

export const useContractDetail = (contract, onUpdate, onClose) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateChangeModalOpen, setIsRateChangeModalOpen] = useState(false);
  const [isSettlementImpactOpen, setIsSettlementImpactOpen] = useState(false);
  const [selectedVehicleForSettlement, setSelectedVehicleForSettlement] = useState(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false); // NEW

  const metrics = contract ? calculateContractMetrics(contract) : null;

  // Enter edit mode
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

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setError('');
  };

  // Update vehicle data during edit
  const handleVehicleEditChange = (index, field, value) => {
    const newVehicles = [...editData.vehicles];
    newVehicles[index] = {
      ...newVehicles[index],
      [field]: field === 'registration' ? value.toUpperCase() : value
    };
    setEditData(prev => ({ ...prev, vehicles: newVehicles }));
  };

  // Validate edit form
  const validateEditForm = () => {
    if (!editData.contractNumber.trim()) {
      setError('Contract number is required');
      return false;
    }

    for (let i = 0; i < editData.vehicles.length; i++) {
      const v = editData.vehicles[i];
      if (!v.registration.trim()) {
        setError(`Vehicle ${i + 1}: Registration is required`);
        return false;
      }
      if (!v.make.trim()) {
        setError(`Vehicle ${i + 1}: Make is required`);
        return false;
      }
      if (!v.model.trim()) {
        setError(`Vehicle ${i + 1}: Model is required`);
        return false;
      }
    }

    return true;
  };

  // Save edited contract
  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    setLoading(true);
    setError('');

    try {
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

  // Open settlement impact modal
  const handleSettleVehicleClick = (vehicle) => {
    setSelectedVehicleForSettlement(vehicle);
    setIsSettlementImpactOpen(true);
  };

  // Confirm settlement with impact analysis
  const handleConfirmSettlement = async (registration, settlementDate) => {
    setLoading(true);
    setError('');

    try {
      await settleVehicle(contract.id, registration, settlementDate);
      setIsSettlementImpactOpen(false);
      setSelectedVehicleForSettlement(null);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to settle vehicle');
    } finally {
      setLoading(false);
    }
  };

  // Quick settle without impact analysis
  const handleQuickSettleVehicle = async (registration) => {
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

  // Delete entire contract
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

  // Open rate change modal
  const openRateChangeModal = () => {
    setIsRateChangeModalOpen(true);
  };

  // Close rate change modal
  const closeRateChangeModal = () => {
    setIsRateChangeModalOpen(false);
  };

  // Handle rate change success
  const handleRateChangeSuccess = () => {
    setIsRateChangeModalOpen(false);
    onUpdate();
  };

  // Close settlement impact modal
  const closeSettlementImpactModal = () => {
    setIsSettlementImpactOpen(false);
    setSelectedVehicleForSettlement(null);
  };

  // NEW: Statement modal handlers
  const openStatementModal = () => {
    setIsStatementModalOpen(true);
  };

  const closeStatementModal = () => {
    setIsStatementModalOpen(false);
  };

  return {
    // State
    isEditing,
    editData,
    loading,
    error,
    metrics,
    isRateChangeModalOpen,
    isSettlementImpactOpen,
    selectedVehicleForSettlement,
    isStatementModalOpen, // NEW
    
    // Actions
    handleEditClick,
    handleCancelEdit,
    handleVehicleEditChange,
    handleSaveEdit,
    handleSettleVehicleClick,
    handleConfirmSettlement,
    handleQuickSettleVehicle,
    handleDeleteContract,
    openRateChangeModal,
    closeRateChangeModal,
    handleRateChangeSuccess,
    closeSettlementImpactModal,
    openStatementModal, // NEW
    closeStatementModal, // NEW
    setEditData
  };
};