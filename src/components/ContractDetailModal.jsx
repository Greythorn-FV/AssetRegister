// File: src/components/ContractDetailModal.jsx
// Updated with Statement of Account Modal integration

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import RateChangeModal from './RateChangeModal.jsx';
import SettlementImpactModal from './SettlementImpactModal.jsx';
import StatementOfAccountModal from './StatementOfAccountModal.jsx'; // NEW
import ContractViewSection from './ContractDetail/ContractViewSection.jsx';
import ContractEditSection from './ContractDetail/ContractEditSection.jsx';
import { useContractDetail } from '../hooks/useContractDetail.js';

const ContractDetailModal = ({ contract, isOpen, onClose, onUpdate }) => {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

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
    handleUnsettleVehicle,
    handleUpdateVehicleNote,
    handleSoldVehicle,
    handleUndoSoldVehicle,
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
        {/* Header with premium theme gradient */}
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
              onUnsettleVehicle={handleUnsettleVehicle}
              onUpdateVehicleNote={handleUpdateVehicleNote}
              onSettleVehicleWithImpact={handleSettleVehicleClick}
              onSoldVehicle={handleSoldVehicle}
              onUndoSoldVehicle={handleUndoSoldVehicle}
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

const getStyles = (m) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: m ? 'stretch' : 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.xl,
    width: m ? '100%' : '95%',
    maxWidth: m ? 'none' : '1400px',
    height: m ? '100vh' : '90vh',
    overflow: 'hidden',
    boxShadow: m ? 'none' : shadows.xl,
    animation: 'slideUp 0.3s ease-out',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: gradients.primary,
    padding: m ? '16px' : '28px 32px',
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
    fontSize: m ? fonts.size['2xl'] : fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textOnDark,
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
    fontSize: fonts.size.md,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: fonts.weight.semibold,
    background: 'rgba(255, 255, 255, 0.12)',
    padding: '6px 14px',
    borderRadius: radius.md,
    backdropFilter: 'blur(10px)'
  },
  statusPill: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    padding: '6px 14px',
    borderRadius: radius.md,
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
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'none',
    borderRadius: radius.lg,
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.textOnDark,
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: m ? '16px' : '32px',
    background: colors.surfaceHover
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: colors.errorLight,
    border: `2px solid ${colors.errorBorder}`,
    borderRadius: radius.lg,
    marginBottom: '24px'
  },
  errorIcon: {
    fontSize: '20px'
  },
  errorText: {
    color: colors.errorText,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.base
  }
});

export default ContractDetailModal;