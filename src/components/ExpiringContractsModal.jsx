// File: src/components/ExpiringContractsModal.jsx
// Modal popup showing contracts expiring soon - appears once daily until acknowledged

import React from 'react';
import { AlertTriangle, X, Calendar, ChevronRight } from 'lucide-react';

const ExpiringContractsModal = ({ 
  isOpen, 
  onClose, 
  expiringContracts,
  onContractClick 
}) => {
  if (!isOpen || !expiringContracts || expiringContracts.length === 0) return null;

  // Group contracts by urgency
  const critical = expiringContracts.filter(c => c.daysRemaining <= 30);
  const warning = expiringContracts.filter(c => c.daysRemaining > 30 && c.daysRemaining <= 60);
  const upcoming = expiringContracts.filter(c => c.daysRemaining > 60);

  const handleAcknowledge = () => {
    // Save today's date to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('expiringContractsAcknowledged', today);
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (value) => {
    return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={styles.overlay} onClick={handleAcknowledge}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <AlertTriangle size={28} color="#DC2626" />
          </div>
          <div style={styles.headerText}>
            <h2 style={styles.title}>Contracts Expiring Soon</h2>
            <p style={styles.subtitle}>
              {expiringContracts.length} contract{expiringContracts.length !== 1 ? 's' : ''} ending in the next 90 days
            </p>
          </div>
          <button onClick={handleAcknowledge} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Critical - within 30 days */}
          {critical.length > 0 && (
            <div style={styles.section}>
              <div style={{...styles.sectionHeader, ...styles.sectionCritical}}>
                <span style={styles.sectionBadge}>⚠️ CRITICAL</span>
                <span style={styles.sectionLabel}>Within 30 days ({critical.length})</span>
              </div>
              <div style={styles.contractList}>
                {critical.map((contract, idx) => (
                  <div 
                    key={idx} 
                    style={{...styles.contractItem, ...styles.contractCritical}}
                    onClick={() => {
                      handleAcknowledge();
                      onContractClick(contract);
                    }}
                  >
                    <div style={styles.contractMain}>
                      <div style={styles.contractNumber}>{contract.contractNumber}</div>
                      <div style={styles.contractVehicle}>
                        {contract.vehicles?.[0]?.make} {contract.vehicles?.[0]?.model}
                        {contract.vehicles?.length > 1 && ` +${contract.vehicles.length - 1}`}
                      </div>
                    </div>
                    <div style={styles.contractDetails}>
                      <div style={styles.contractCapital}>
                        {formatCurrency(contract.capitalOutstanding)} outstanding
                      </div>
                      <div style={{...styles.contractDays, ...styles.daysCritical}}>
                        {contract.daysRemaining} days left
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning - 31-60 days */}
          {warning.length > 0 && (
            <div style={styles.section}>
              <div style={{...styles.sectionHeader, ...styles.sectionWarning}}>
                <span style={styles.sectionBadge}>🔔 WARNING</span>
                <span style={styles.sectionLabel}>31-60 days ({warning.length})</span>
              </div>
              <div style={styles.contractList}>
                {warning.map((contract, idx) => (
                  <div 
                    key={idx} 
                    style={{...styles.contractItem, ...styles.contractWarning}}
                    onClick={() => {
                      handleAcknowledge();
                      onContractClick(contract);
                    }}
                  >
                    <div style={styles.contractMain}>
                      <div style={styles.contractNumber}>{contract.contractNumber}</div>
                      <div style={styles.contractVehicle}>
                        {contract.vehicles?.[0]?.make} {contract.vehicles?.[0]?.model}
                        {contract.vehicles?.length > 1 && ` +${contract.vehicles.length - 1}`}
                      </div>
                    </div>
                    <div style={styles.contractDetails}>
                      <div style={styles.contractCapital}>
                        {formatCurrency(contract.capitalOutstanding)} outstanding
                      </div>
                      <div style={{...styles.contractDays, ...styles.daysWarning}}>
                        {contract.daysRemaining} days left
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming - 61-90 days */}
          {upcoming.length > 0 && (
            <div style={styles.section}>
              <div style={{...styles.sectionHeader, ...styles.sectionUpcoming}}>
                <span style={styles.sectionBadge}>📅 UPCOMING</span>
                <span style={styles.sectionLabel}>61-90 days ({upcoming.length})</span>
              </div>
              <div style={styles.contractList}>
                {upcoming.map((contract, idx) => (
                  <div 
                    key={idx} 
                    style={{...styles.contractItem, ...styles.contractUpcoming}}
                    onClick={() => {
                      handleAcknowledge();
                      onContractClick(contract);
                    }}
                  >
                    <div style={styles.contractMain}>
                      <div style={styles.contractNumber}>{contract.contractNumber}</div>
                      <div style={styles.contractVehicle}>
                        {contract.vehicles?.[0]?.make} {contract.vehicles?.[0]?.model}
                        {contract.vehicles?.length > 1 && ` +${contract.vehicles.length - 1}`}
                      </div>
                    </div>
                    <div style={styles.contractDetails}>
                      <div style={styles.contractCapital}>
                        {formatCurrency(contract.capitalOutstanding)} outstanding
                      </div>
                      <div style={{...styles.contractDays, ...styles.daysUpcoming}}>
                        {contract.daysRemaining} days left
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            This alert will appear once daily. Click a contract to view details.
          </p>
          <button onClick={handleAcknowledge} style={styles.acknowledgeButton}>
            <Calendar size={16} />
            I'm Aware - Dismiss for Today
          </button>
        </div>
      </div>
    </div>
  );
};

const fontFamily = "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderBottom: '1px solid #E2E8F0',
    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)'
  },
  headerText: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: fontFamily,
    color: '#0F172A'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    fontFamily: fontFamily,
    color: '#64748B'
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B',
    transition: 'all 0.2s'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px'
  },
  section: {
    marginBottom: '20px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  sectionCritical: {
    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
  },
  sectionWarning: {
    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
  },
  sectionUpcoming: {
    background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
  },
  sectionBadge: {
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: fontFamily,
    letterSpacing: '0.5px'
  },
  sectionLabel: {
    fontSize: '12px',
    fontFamily: fontFamily,
    color: '#64748B'
  },
  contractList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contractItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  contractCritical: {
    borderLeft: '4px solid #DC2626',
    background: '#FFFBFB'
  },
  contractWarning: {
    borderLeft: '4px solid #F59E0B',
    background: '#FFFDF7'
  },
  contractUpcoming: {
    borderLeft: '4px solid #3B82F6',
    background: '#F8FAFF'
  },
  contractMain: {
    flex: 1
  },
  contractNumber: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: fontFamily,
    color: '#0F172A'
  },
  contractVehicle: {
    fontSize: '12px',
    fontFamily: fontFamily,
    color: '#64748B',
    marginTop: '2px'
  },
  contractDetails: {
    textAlign: 'right'
  },
  contractCapital: {
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: fontFamily,
    color: '#4B6D8B'
  },
  contractDays: {
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: fontFamily,
    marginTop: '2px',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  daysCritical: {
    background: '#FEE2E2',
    color: '#DC2626'
  },
  daysWarning: {
    background: '#FEF3C7',
    color: '#D97706'
  },
  daysUpcoming: {
    background: '#DBEAFE',
    color: '#2563EB'
  },
  footer: {
    padding: '20px 24px',
    borderTop: '1px solid #E2E8F0',
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    fontFamily: fontFamily,
    color: '#94A3B8',
    textAlign: 'center'
  },
  acknowledgeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #4B6D8B 0%, #6B8CAE 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: fontFamily,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(75, 109, 139, 0.3)'
  }
};

export default ExpiringContractsModal;