// File: src/components/ContractDetailModal.jsx
// Updated with Statement of Account Modal integration

import React from 'react';
import { X } from 'lucide-react';
import RateChangeModal from './RateChangeModal.jsx';
import SettlementImpactModal from './SettlementImpactModal.jsx';
import StatementOfAccountModal from './StatementOfAccountModal.jsx'; // NEW
import ContractViewSection from './ContractDetail/ContractViewSection.jsx';
import ContractEditSection from './ContractDetail/ContractEditSection.jsx';
import { useContractDetail } from '../hooks/useContractDetail.js';

const ContractDetailModal = ({ contract, isOpen, onClose, onUpdate }) => {
  const {
    isEditing,
    editData,
    loading,
    error,
    metrics,
    isRateChangeModalOpen,
    isSettlementImpactOpen,
    selectedVehicleForSettlement,
    isStatementModalOpen, // NEW
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
  } = useContractDetail(contract, onUpdate, onClose);

  if (!isOpen || !contract) return null;

  const handleEditDataChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header with Greythorn gradient */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h2 style={styles.title}>
                {isEditing ? 'Edit Contract' : 'Contract Details'}
              </h2>
              <div style={styles.contractMeta}>
                <span style={styles.contractNumber}>{contract.contractNumber}</span>
                {!isEditing && (
                  <span style={{
                    ...styles.statusPill,
                    ...(contract.status === 'active' ? styles.statusActive : styles.statusSettled)
                  }}>
                    {contract.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content with smooth scrolling */}
        <div style={styles.content}>
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.errorIcon}>⚠️</div>
              <div style={styles.errorText}>{error}</div>
            </div>
          )}

          {!isEditing ? (
            <ContractViewSection
              contract={contract}
              metrics={metrics}
              loading={loading}
              onEditClick={handleEditClick}
              onDeleteContract={handleDeleteContract}
              onSettleVehicle={handleQuickSettleVehicle}
              onSettleVehicleWithImpact={handleSettleVehicleClick}
              onUpdateRate={openRateChangeModal}
              onViewStatement={openStatementModal} // NEW
            />
          ) : (
            <ContractEditSection
              editData={editData}
              loading={loading}
              onDataChange={handleEditDataChange}
              onVehicleChange={handleVehicleEditChange}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {contract.interestType === 'variable' && (
        <>
          <RateChangeModal
            contract={contract}
            isOpen={isRateChangeModalOpen}
            onClose={closeRateChangeModal}
            onSuccess={handleRateChangeSuccess}
          />
          <SettlementImpactModal
            contract={contract}
            vehicle={selectedVehicleForSettlement}
            isOpen={isSettlementImpactOpen}
            onClose={closeSettlementImpactModal}
            onConfirm={handleConfirmSettlement}
          />
        </>
      )}

      {/* NEW: Statement of Account Modal */}
      <StatementOfAccountModal
        contract={contract}
        isOpen={isStatementModalOpen}
        onClose={closeStatementModal}
      />
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
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '95%',
    maxWidth: '1400px',
    height: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: 'linear-gradient(135deg, #4B6D8B 0%, #6B8CAE 100%)',
    padding: '28px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0
  },
  headerContent: {
    flex: 1,
    zIndex: 1
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  contractMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  contractNumber: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '6px 14px',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)'
  },
  statusPill: {
    fontSize: '13px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusActive: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#D1FAE5',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  statusSettled: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
    background: '#FAFBFC'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#FEE2E2',
    border: '2px solid #FCA5A5',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  errorIcon: {
    fontSize: '20px'
  },
  errorText: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default ContractDetailModal;