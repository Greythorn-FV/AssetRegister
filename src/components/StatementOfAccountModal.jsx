// File: src/components/StatementOfAccountModal.jsx
// Statement of Account Modal - Accounting Ledger View

import React, { useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { useStatementOfAccount } from '../hooks/useStatementOfAccount.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const StatementOfAccountModal = ({ contract, isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const { transactions, summary, exportToCSV } = useStatementOfAccount(contract);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const styles = getStyles(isMobile);

  if (!isOpen || !contract) return null;
  
  const getTypeColor = (type) => {
    switch(type) {
      case 'OPENING': return '#6366F1';
      case 'CAPITAL_PAYMENT': return '#10B981';
      case 'INTEREST_CHARGE': return '#F59E0B';
      case 'SETTLEMENT': return '#8B5CF6';
      default: return '#64748B';
    }
  };
  
  const getTypeBadge = (type) => {
    const labels = {
      'OPENING': 'Opening',
      'CAPITAL_PAYMENT': 'Capital',
      'INTEREST_CHARGE': 'Interest',
      'SETTLEMENT': 'Settlement'
    };
    return labels[type] || type;
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <FileText size={28} color="white" />
              <div>
                <h2 style={styles.title}>Statement of Account</h2>
                <p style={styles.subtitle}>{contract.contractNumber}</p>
              </div>
            </div>
            <button onClick={exportToCSV} style={styles.exportButton}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        {/* Summary Cards */}
        {summary && (
          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Capital Paid</div>
              <div style={styles.summaryValue}>{formatCurrency(summary.totalCapitalPaid)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Interest Paid</div>
              <div style={styles.summaryValue}>{formatCurrency(summary.totalInterestPaid)}</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Transactions</div>
              <div style={styles.summaryValue}>{summary.transactionCount}</div>
            </div>
          </div>
        )}
        
        {/* Transaction Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Type</th>
                <th style={{...styles.th, textAlign: 'left'}}>Description</th>
                <th style={{...styles.th, textAlign: 'right'}}>Debit</th>
                <th style={{...styles.th, textAlign: 'right'}}>Credit</th>
                <th style={{...styles.th, textAlign: 'right'}}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr 
                  key={txn.id}
                  style={{
                    ...styles.tr,
                    background: index % 2 === 0 ? '#F8FAFC' : 'white'
                  }}
                >
                  <td style={styles.td}>
                    {format(txn.date, 'dd/MM/yyyy')}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.typeBadge,
                      background: `${getTypeColor(txn.type)}15`,
                      color: getTypeColor(txn.type)
                    }}>
                      {getTypeBadge(txn.type)}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'left'}}>
                    {txn.description}
                  </td>
                  <td style={{...styles.td, textAlign: 'right', color: '#DC2626', fontWeight: '600'}}>
                    {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                  </td>
                  <td style={{...styles.td, textAlign: 'right', color: '#059669', fontWeight: '600'}}>
                    {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                  </td>
                  <td style={{...styles.td, textAlign: 'right', fontWeight: '700', color: '#1E293B'}}>
                    {formatCurrency(txn.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Info */}
        <div style={styles.footer}>
          <div style={styles.footerNote}>
            <strong>Note:</strong> Interest charges represent the cost of finance and do not reduce the capital balance. 
            Capital payments and settlements reduce the outstanding balance.
          </div>
        </div>
      </div>
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
    zIndex: 1100,
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.xl,
    width: m ? '100%' : '95%',
    maxWidth: m ? 'none' : '1400px',
    maxHeight: m ? '100vh' : undefined,
    height: m ? '100vh' : '90vh',
    overflow: 'hidden',
    boxShadow: m ? 'none' : shadows.xl,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: gradients.primary,
    padding: m ? '16px' : '28px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flex: 1
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: m ? fonts.size['2xl'] : fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textOnDark,
    margin: 0
  },
  subtitle: {
    fontSize: fonts.size.md,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '4px 0 0 0',
    fontWeight: fonts.weight.semibold
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: radius.lg,
    color: colors.textOnDark,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)'
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
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    padding: '24px 32px',
    background: `linear-gradient(to bottom, ${colors.background}, ${colors.surface})`,
    borderBottom: `2px solid ${colors.border}`,
    flexShrink: 0
  },
  summaryCard: {
    background: colors.surface,
    padding: '20px',
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm
  },
  summaryLabel: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  summaryValue: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 24px 32px'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  thead: {
    position: 'sticky',
    top: 0,
    background: colors.borderLight,
    zIndex: 10
  },
  th: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${colors.borderDark}`
  },
  tr: {
    transition: 'background 0.15s'
  },
  td: {
    padding: '14px 16px',
    fontSize: fonts.size.base,
    color: colors.textPrimary,
    borderBottom: `1px solid ${colors.border}`,
    textAlign: 'center'
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: radius.md,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  footer: {
    padding: '20px 32px',
    background: colors.background,
    borderTop: `2px solid ${colors.border}`,
    flexShrink: 0
  },
  footerNote: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    lineHeight: '1.6'
  }
});

export default StatementOfAccountModal;