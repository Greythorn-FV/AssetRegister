// File: src/components/GanttChart.jsx
// COMPLETE VERSION - Timeline + Payment Calendar

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import BottomNav from './BottomNav.jsx';
import { getAllContracts } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import { formatMonthYear } from '../utils/dateHelpers.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { addMonths, parseISO, format } from 'date-fns';
import Header from './Header.jsx';
import PaymentCalendar from './PaymentCalendar.jsx';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const GanttChart = ({ onBack, onViewReports }) => {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);
  const [contracts, setContracts] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      const activeContracts = data.filter(c => c.status === 'active');
      
      activeContracts.sort((a, b) => 
        new Date(a.firstInstalmentDate) - new Date(b.firstInstalmentDate)
      );
      
      setContracts(activeContracts);
      
      if (activeContracts.length > 0) {
        const monthsArray = generateMonthColumns(activeContracts);
        setMonths(monthsArray);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      alert('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthColumns = (contracts) => {
    let earliestDate = new Date();
    let latestDate = new Date();
    
    contracts.forEach(contract => {
      const start = parseISO(contract.firstInstalmentDate);
      const end = addMonths(start, contract.totalInstalments - 1);
      
      if (start < earliestDate) earliestDate = start;
      if (end > latestDate) latestDate = end;
    });
    
    const monthsArray = [];
    let currentMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    
    while (currentMonth <= endMonth) {
      monthsArray.push(new Date(currentMonth));
      currentMonth = addMonths(currentMonth, 1);
    }
    
    return monthsArray;
  };

  const getCapitalForMonth = (contract, monthDate) => {
    const contractStart = parseISO(contract.firstInstalmentDate);
    const contractEnd = addMonths(contractStart, contract.totalInstalments - 1);
    
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    if (monthEnd < contractStart || monthStart > contractEnd) {
      return null;
    }
    
    const monthsSinceStart = Math.floor(
      (monthDate.getTime() - contractStart.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
    );
    
    let activeVehicles = contract.originalVehicleCount;
    
    contract.vehicles.forEach(vehicle => {
      if (vehicle.status === 'settled' && vehicle.settledAtMonth <= monthsSinceStart) {
        activeVehicles--;
      }
    });
    
    const capital = contract.perVehicleCapitalRate * activeVehicles;
    
    return {
      capital,
      activeVehicles,
      isPast: monthEnd < new Date(),
      isCurrent: monthStart <= new Date() && monthEnd >= new Date()
    };
  };

  const calculateMonthTotal = (monthDate) => {
    let total = 0;
    contracts.forEach(contract => {
      const monthData = getCapitalForMonth(contract, monthDate);
      if (monthData) {
        total += monthData.capital;
      }
    });
    return total;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading timeline...</div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div style={styles.container}>
        <Header title="">
          <button onClick={onBack} style={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </Header>
        <div style={styles.empty}>
          <p>No active contracts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header title="" onBack={onBack}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </Header>

      {/* GANTT TIMELINE TABLE */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.stickyHeader}>Contract</th>
                {months.map((month, index) => (
                  <th key={index} style={styles.monthHeader}>
                    {format(month, 'MMM yy')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => {
                const metrics = calculateContractMetrics(contract);
                
                return (
                  <tr key={contract.id} style={styles.row}>
                    <td style={styles.stickyCell}>
                      <div style={styles.contractInfo}>
                        <div style={styles.contractNumber}>{contract.contractNumber}</div>
                        <div style={styles.vehicleInfo}>
                          {contract.vehicles?.[0]?.make} {contract.vehicles?.length > 1 ? `+${contract.vehicles.length - 1}` : ''}
                        </div>
                      </div>
                    </td>
                    {months.map((month, index) => {
                      const monthData = getCapitalForMonth(contract, month);
                      
                      return (
                        <td key={index} style={styles.cell}>
                          {monthData ? (
                            <div style={{
                              ...styles.cellContent,
                              ...(monthData.isPast ? styles.cellPast : 
                                  monthData.isCurrent ? styles.cellCurrent : 
                                  styles.cellFuture)
                            }}>
                              {formatCurrency(monthData.capital, false)}
                            </div>
                          ) : (
                            <div style={styles.cellEmpty}></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr style={styles.totalRow}>
                <td style={styles.stickyCellTotal}>
                  <div style={styles.totalLabel}>Monthly Total</div>
                </td>
                {months.map((month, index) => {
                  const total = calculateMonthTotal(month);
                  
                  return (
                    <td key={index} style={styles.cellTotal}>
                      {total > 0 ? (
                        <div style={styles.totalValue}>
                          {formatCurrency(total, false)}
                        </div>
                      ) : (
                        <div style={styles.cellEmpty}></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendTitle}>Legend:</div>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, ...styles.cellPast}}></div>
            <span>Past Payments</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, ...styles.cellCurrent}}></div>
            <span>Current Month</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, ...styles.cellFuture}}></div>
            <span>Future Payments</span>
          </div>
        </div>
      </div>

      {/* PAYMENT CALENDAR - NEW SECTION */}
      <PaymentCalendar contracts={contracts} />

      <BottomNav
        onViewGantt={null}
        onViewReports={onViewReports}
        onAddContract={onBack}
      />
    </div>
  );
};

const getStyles = (m) => ({
  container: {
    width: '100%',
    maxWidth: '100vw',
    margin: '0',
    padding: m ? '12px 8px 80px 8px' : '40px 60px',
    minHeight: '100vh',
    background: gradients.surface,
    overflowX: 'hidden',
    boxSizing: 'border-box'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: m ? '10px 16px' : '16px 28px',
    background: colors.surface,
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: m ? fonts.size.sm : fonts.size.md,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: shadows.sm
  },
  tableWrapper: {
    background: colors.surface,
    borderRadius: m ? radius.lg : radius.xl,
    padding: '0',
    boxShadow: shadows.md,
    overflow: 'hidden'
  },
  tableContainer: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: m ? '60vh' : '70vh',
    WebkitOverflowScrolling: 'touch'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: m ? '11px' : '13px'
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 30,
    background: colors.primary,
    color: colors.textOnDark,
    padding: m ? '8px 10px' : '12px 16px',
    textAlign: 'left',
    fontWeight: fonts.weight.bold,
    fontSize: m ? '10px' : fonts.size.sm,
    textTransform: 'uppercase',
    borderRight: `2px solid ${colors.primaryMed}`,
    minWidth: m ? '100px' : '150px',
    maxWidth: m ? '100px' : '150px'
  },
  monthHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: colors.primary,
    color: colors.textOnDark,
    padding: m ? '8px 4px' : '12px 8px',
    textAlign: 'center',
    fontWeight: fonts.weight.bold,
    fontSize: m ? '9px' : fonts.size.xs,
    textTransform: 'uppercase',
    borderRight: `1px solid ${colors.primaryMed}`,
    minWidth: m ? '65px' : '100px'
  },
  row: {
    borderBottom: `1px solid ${colors.border}`
  },
  stickyCell: {
    position: 'sticky',
    left: 0,
    zIndex: 10,
    background: colors.surface,
    padding: m ? '8px 10px' : '12px 16px',
    borderRight: `2px solid ${colors.border}`,
    minWidth: m ? '100px' : '150px',
    maxWidth: m ? '100px' : '150px'
  },
  contractInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  contractNumber: {
    fontWeight: fonts.weight.semibold,
    fontSize: m ? fonts.size.xs : fonts.size.base,
    color: colors.textPrimary
  },
  vehicleInfo: {
    fontSize: m ? '10px' : fonts.size.xs,
    color: colors.textSecondary
  },
  cell: {
    padding: m ? '2px' : '4px',
    textAlign: 'center',
    borderRight: `1px solid ${colors.border}`,
    minWidth: m ? '65px' : '100px'
  },
  cellContent: {
    padding: m ? '4px 2px' : '8px 4px',
    borderRadius: radius.sm,
    fontWeight: fonts.weight.semibold,
    fontSize: m ? '10px' : fonts.size.sm,
    cursor: 'pointer'
  },
  cellPast: {
    background: colors.successLight,
    color: colors.successText
  },
  cellCurrent: {
    background: colors.warningLight,
    color: colors.warningText,
    border: `2px solid ${colors.warning}`
  },
  cellFuture: {
    background: colors.infoLight,
    color: colors.info
  },
  cellEmpty: {
    padding: m ? '4px 2px' : '8px 4px',
    color: colors.border
  },
  totalRow: {
    position: 'sticky',
    bottom: 0,
    zIndex: 15,
    background: colors.background,
    borderTop: `3px solid ${colors.primary}`
  },
  stickyCellTotal: {
    position: 'sticky',
    left: 0,
    zIndex: 20,
    background: colors.primary,
    padding: m ? '8px 10px' : '12px 16px',
    borderRight: `2px solid ${colors.primaryMed}`
  },
  totalLabel: {
    fontWeight: fonts.weight.bold,
    fontSize: m ? '10px' : fonts.size.sm,
    color: colors.textOnDark,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  cellTotal: {
    padding: m ? '2px' : '4px',
    textAlign: 'center',
    borderRight: `1px solid ${colors.border}`
  },
  totalValue: {
    padding: m ? '4px 2px' : '8px 4px',
    fontWeight: fonts.weight.bold,
    fontSize: m ? '10px' : '13px',
    color: colors.textPrimary,
    background: colors.borderLight,
    borderRadius: radius.sm
  },
  legend: {
    marginTop: m ? '12px' : '24px',
    padding: m ? '12px' : '20px',
    background: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.sm
  },
  legendTitle: {
    fontWeight: fonts.weight.bold,
    fontSize: m ? fonts.size.sm : fonts.size.base,
    marginBottom: '8px',
    color: colors.textPrimary
  },
  legendItems: {
    display: 'flex',
    gap: m ? '12px' : '24px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: m ? fonts.size.xs : '13px',
    color: colors.textSecondary
  },
  legendBox: {
    width: m ? '16px' : '24px',
    height: m ? '16px' : '24px',
    borderRadius: radius.sm
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: gradients.surface
  },
  loadingText: {
    fontSize: fonts.size.xl,
    color: colors.textSecondary,
    fontWeight: fonts.weight.medium
  },
  empty: {
    background: colors.surface,
    borderRadius: radius.xl,
    padding: m ? '40px 16px' : '60px',
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.medium
  }
});

export default GanttChart;