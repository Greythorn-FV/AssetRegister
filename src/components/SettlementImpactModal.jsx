// File: src/components/SettlementImpactModal.jsx
// Shows EXACT impact of settling a vehicle on any day of the month

import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { getMonthsRemaining } from '../utils/dateHelpers.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

// Helper function to get days in month (since date-fns might not be available)
const getDaysInMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

// Helper function to parse ISO date
const parseISO = (dateString) => {
  return new Date(dateString);
};

// Helper function to add months
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const SettlementImpactModal = ({ contract, vehicle, isOpen, onClose, onConfirm }) => {
  const isMobile = useIsMobile();
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const styles = getStyles(isMobile);

  // Calculate impact - MUST be before the early return to follow React Hooks rules
  const impact = useMemo(() => {
    if (!contract || !vehicle) return null;
    const settleDate = new Date(settlementDate);
    const settlementDay = settleDate.getDate();
    const monthDate = new Date(settleDate.getFullYear(), settleDate.getMonth(), 1);
    const daysInMonth = getDaysInMonth(settleDate);
    
    const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
    const dailyRate = (annualRate / 100) / 365;
    
    // Calculate current balance
    const startDate = parseISO(contract.firstInstalmentDate);
    const monthsElapsed = Math.floor(
      (settleDate - startDate) / (30.44 * 24 * 60 * 60 * 1000)
    );
    const monthlyCapitalTotal = contract.totalCapital / contract.totalInstalments;
    const capitalPaid = monthlyCapitalTotal * monthsElapsed;
    const currentBalance = contract.totalCapital - capitalPaid;
    
    // Months remaining from settlement date
    const monthsRem = getMonthsRemaining(contract.totalInstalments, contract.firstInstalmentDate);
    
    // Vehicle's remaining capital
    const vehicleCapitalRemaining = contract.perVehicleCapitalRate * monthsRem;
    
    // Interest calculation for THIS month
    const daysBefore = settlementDay - 1;
    const daysAfter = daysInMonth - settlementDay + 1;
    
    const interestBefore = currentBalance * dailyRate * daysBefore;
    const interestAfter = (currentBalance - vehicleCapitalRemaining) * dailyRate * daysAfter;
    const totalMonthInterest = interestBefore + interestAfter;
    
    // If settled at end of month
    const fullMonthInterest = currentBalance * dailyRate * daysInMonth;
    const interestSaved = fullMonthInterest - totalMonthInterest;
    
    // Monthly payment reduction
    const oldMonthlyCapital = contract.currentMonthlyCapital;
    const newMonthlyCapital = contract.perVehicleCapitalRate * (contract.activeVehiclesCount - 1);
    const monthlyReduction = oldMonthlyCapital - newMonthlyCapital;
    
    // Future interest savings (approximate)
    let futureInterestSavings = 0;
    let balance = currentBalance - vehicleCapitalRemaining;
    const newMonthlyCapitalTotal = newMonthlyCapital;
    
    for (let i = 0; i < monthsRem; i++) {
      const futureMonthDate = addMonths(monthDate, i + 1);
      const futureDays = getDaysInMonth(futureMonthDate);
      futureInterestSavings += (vehicleCapitalRemaining / monthsRem) * dailyRate * futureDays;
      balance -= newMonthlyCapitalTotal;
      if (balance < 0) balance = 0;
    }
    
    return {
      settlementDay,
      daysInMonth,
      daysBefore,
      daysAfter,
      currentBalance,
      vehicleCapitalRemaining,
      interestBefore,
      interestAfter,
      totalMonthInterest,
      fullMonthInterest,
      interestSavedThisMonth: interestSaved,
      monthlyReduction,
      futureInterestSavings,
      totalSavings: interestSaved + futureInterestSavings,
      monthsRemaining: monthsRem,
      // NEW: Settlement figure components
      settlementCapital: vehicleCapitalRemaining,
      settlementInterest: interestBefore,
      settlementFigure: vehicleCapitalRemaining + interestBefore
    };
  }, [contract, vehicle, settlementDate]);
  
  // Early return AFTER all hooks
  if (!isOpen || !contract || !vehicle || !impact) return null;
  
  const handleConfirm = () => {
    onConfirm(vehicle.registration, new Date(settlementDate));
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settlement Impact Analysis</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleReg}>{vehicle.registration}</div>
            <div style={styles.vehicleMake}>{vehicle.make} {vehicle.model}</div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Calendar size={16} />
              Settlement Date
            </label>
            <input
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div style={styles.impactSection}>
            <h3 style={styles.sectionTitle}>💰 HSBC Settlement Quote</h3>
            
            <div style={styles.settlementQuoteBox}>
              <div style={styles.quoteHeader}>
                <div style={styles.quoteTitle}>Settlement Quotation</div>
                <div style={styles.quoteDate}>Valid: {new Date(settlementDate).toLocaleDateString('en-GB')}</div>
              </div>
              
              <div style={styles.quoteBreakdown}>
                <div style={styles.quoteRow}>
                  <span>Outstanding Capital (This Vehicle):</span>
                  <span>{formatCurrency(impact.settlementCapital)}</span>
                </div>
                <div style={styles.quoteRow}>
                  <span>Interest Accrued (Day 1 - {impact.daysBefore}):</span>
                  <span>{formatCurrency(impact.settlementInterest)}</span>
                </div>
                <div style={styles.quoteDivider}></div>
                <div style={styles.quoteTotal}>
                  <span>TOTAL SETTLEMENT FIGURE:</span>
                  <span style={styles.quoteTotalAmount}>{formatCurrency(impact.settlementFigure)}</span>
                </div>
              </div>
              
              <div style={styles.quoteNote}>
                ℹ️ Pay this exact amount by {new Date(settlementDate).toLocaleDateString('en-GB')}
              </div>
              <div style={styles.quoteNote}>
                ⚠️ Quote expires in 7 days (interest accrues daily)
              </div>
            </div>
          </div>
          
          <div style={styles.impactSection}>
            <h3 style={styles.sectionTitle}>📊 Day-by-Day Impact</h3>
            
            <div style={styles.timelineBox}>
              <div style={styles.timelineHeader}>
                This Month ({impact.daysInMonth} days total)
              </div>
              
              <div style={styles.timelinePeriod}>
                <div style={styles.periodLabel}>
                  Days 1-{impact.daysBefore} (Before Settlement)
                </div>
                <div style={styles.periodDetail}>
                  Balance: {formatCurrency(impact.currentBalance)}
                  <br />
                  Interest: {formatCurrency(impact.interestBefore)}
                </div>
              </div>
              
              <div style={styles.settlementMarker}>
                ⬇️ Settlement on Day {impact.settlementDay}
                <div style={styles.settlementAmount}>
                  Pay off: {formatCurrency(impact.vehicleCapitalRemaining)}
                </div>
              </div>
              
              <div style={styles.timelinePeriod}>
                <div style={styles.periodLabel}>
                  Days {impact.settlementDay + 1}-{impact.daysInMonth} (After Settlement)
                </div>
                <div style={styles.periodDetail}>
                  New Balance: {formatCurrency(impact.currentBalance - impact.vehicleCapitalRemaining)}
                  <br />
                  Interest: {formatCurrency(impact.interestAfter)}
                </div>
              </div>
            </div>
            
            <div style={styles.savingsBox}>
              <div style={styles.savingsRow}>
                <span>Full month interest (if not settled):</span>
                <span>{formatCurrency(impact.fullMonthInterest)}</span>
              </div>
              <div style={styles.savingsRow}>
                <span>Actual interest (with settlement):</span>
                <span>{formatCurrency(impact.totalMonthInterest)}</span>
              </div>
              <div style={styles.savingsDivider}></div>
              <div style={styles.savingsHighlight}>
                <TrendingDown size={18} color="#059669" />
                <span>Interest saved THIS month:</span>
                <span style={styles.savingsValue}>
                  {formatCurrency(impact.interestSavedThisMonth)}
                </span>
              </div>
            </div>
          </div>
          
          <div style={styles.impactSection}>
            <h3 style={styles.sectionTitle}>💰 Ongoing Savings</h3>
            
            <div style={styles.savingsGrid}>
              <div style={styles.savingCard}>
                <div style={styles.cardLabel}>Monthly Payment Reduction</div>
                <div style={styles.cardValue}>
                  {formatCurrency(impact.monthlyReduction)}
                </div>
                <div style={styles.cardNote}>
                  {impact.monthsRemaining} months remaining
                </div>
              </div>
              
              <div style={styles.savingCard}>
                <div style={styles.cardLabel}>Future Interest Savings</div>
                <div style={styles.cardValue}>
                  {formatCurrency(impact.futureInterestSavings)}
                </div>
                <div style={styles.cardNote}>
                  From lower future balances
                </div>
              </div>
            </div>
            
            <div style={styles.totalSavingsBox}>
              <DollarSign size={24} color="#059669" />
              <div>
                <div style={styles.totalLabel}>TOTAL INTEREST SAVINGS</div>
                <div style={styles.totalValue}>
                  {formatCurrency(impact.totalSavings)}
                </div>
                <div style={styles.totalNote}>
                  From settling on {new Date(settlementDate).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.footer}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleConfirm} style={styles.confirmButton}>
              Confirm Settlement
            </button>
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
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: m ? 'stretch' : 'center',
    justifyContent: 'center',
    zIndex: 1200
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.lg,
    width: m ? '100%' : '90%',
    maxWidth: m ? 'none' : '700px',
    maxHeight: m ? '100vh' : '90vh',
    height: m ? '100vh' : undefined,
    overflow: 'auto',
    boxShadow: m ? 'none' : shadows.xl
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: m ? '16px' : '24px',
    borderBottom: `1px solid ${colors.border}`
  },
  title: {
    fontSize: m ? fonts.size['2xl'] : fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: colors.textMuted
  },
  content: {
    padding: m ? '16px' : '24px'
  },
  vehicleInfo: {
    padding: '16px',
    background: colors.background,
    borderRadius: radius.md,
    marginBottom: '24px',
    textAlign: 'center'
  },
  vehicleReg: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: '4px'
  },
  vehicleMake: {
    fontSize: fonts.size.base,
    color: colors.textSecondary
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textSecondary
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.base,
    outline: 'none'
  },
  impactSection: {
    marginBottom: '24px',
    padding: '20px',
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: '16px'
  },
  timelineBox: {
    background: colors.surface,
    padding: '16px',
    borderRadius: radius.md,
    border: `2px solid ${colors.infoBorder}`,
    marginBottom: '16px'
  },
  timelineHeader: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.info,
    marginBottom: '16px',
    textAlign: 'center'
  },
  timelinePeriod: {
    padding: '12px',
    background: colors.infoLight,
    borderRadius: radius.sm,
    marginBottom: '12px'
  },
  periodLabel: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.info,
    marginBottom: '6px'
  },
  periodDetail: {
    fontSize: fonts.size.xs,
    color: colors.info,
    lineHeight: '1.6'
  },
  settlementMarker: {
    padding: '12px',
    background: colors.warningLight,
    border: `2px dashed ${colors.warning}`,
    borderRadius: radius.sm,
    textAlign: 'center',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.warningText,
    marginBottom: '12px'
  },
  settlementAmount: {
    fontSize: fonts.size.sm,
    marginTop: '4px',
    color: colors.warningText
  },
  savingsBox: {
    background: colors.surface,
    padding: '16px',
    borderRadius: radius.md,
    border: `1px solid ${colors.successBorder}`
  },
  savingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: fonts.size.sm,
    color: colors.textSecondary
  },
  savingsDivider: {
    height: '1px',
    background: colors.border,
    margin: '12px 0'
  },
  savingsHighlight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: colors.successLight,
    borderRadius: radius.sm,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.successText
  },
  savingsValue: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.success
  },
  savingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },
  savingCard: {
    background: colors.surface,
    padding: '16px',
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    textAlign: 'center'
  },
  cardLabel: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: fonts.weight.semibold
  },
  cardValue: {
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    color: colors.success,
    marginBottom: '4px'
  },
  cardNote: {
    fontSize: fonts.size.xs,
    color: colors.textMuted
  },
  totalSavingsBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: `linear-gradient(135deg, ${colors.successLight} 0%, ${colors.successBorder} 100%)`,
    borderRadius: radius.md,
    border: `2px solid ${colors.success}`
  },
  totalLabel: {
    fontSize: fonts.size.xs,
    color: colors.successText,
    fontWeight: fonts.weight.bold,
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  totalValue: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.success,
    marginBottom: '4px'
  },
  totalNote: {
    fontSize: fonts.size.sm,
    color: colors.successText
  },
  settlementQuoteBox: {
    background: colors.infoLight,
    padding: '20px',
    borderRadius: radius.md,
    border: `2px solid ${colors.info}`,
    marginBottom: '24px'
  },
  quoteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `2px solid ${colors.infoBorder}`
  },
  quoteTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.info
  },
  quoteDate: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.info
  },
  quoteBreakdown: {
    background: colors.surface,
    padding: '16px',
    borderRadius: radius.sm,
    marginBottom: '12px'
  },
  quoteRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    fontSize: fonts.size.base,
    color: colors.info,
    borderBottom: `1px solid ${colors.infoLight}`
  },
  quoteDivider: {
    height: '2px',
    background: colors.info,
    margin: '12px 0'
  },
  quoteTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.info
  },
  quoteTotalAmount: {
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.bold,
    color: colors.info
  },
  quoteNote: {
    fontSize: fonts.size.sm,
    color: colors.info,
    padding: '6px 12px',
    background: colors.infoLight,
    borderRadius: '4px',
    marginTop: '8px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: `1px solid ${colors.border}`
  },
  cancelButton: {
    padding: '10px 20px',
    background: colors.background,
    border: 'none',
    borderRadius: radius.sm,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    color: colors.textSecondary
  },
  confirmButton: {
    padding: '10px 20px',
    background: gradients.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.sm,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  }
});

export default SettlementImpactModal;