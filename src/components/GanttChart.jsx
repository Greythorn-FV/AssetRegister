import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAllContracts } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import { formatMonthYear } from '../utils/dateHelpers.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { addMonths, parseISO, format } from 'date-fns';

const GanttChart = ({ onBack }) => {
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
      
      // Sort by start date (earliest first)
      activeContracts.sort((a, b) => 
        new Date(a.firstInstalmentDate) - new Date(b.firstInstalmentDate)
      );
      
      setContracts(activeContracts);
      
      // Generate month columns
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
    // Find earliest start date and latest end date
    let earliestDate = new Date();
    let latestDate = new Date();
    
    contracts.forEach(contract => {
      const startDate = parseISO(contract.firstInstalmentDate);
      const endDate = addMonths(startDate, contract.totalInstalments);
      
      if (startDate < earliestDate) earliestDate = startDate;
      if (endDate > latestDate) latestDate = endDate;
    });
    
    // Generate array of months
    const monthsArray = [];
    let currentDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    
    while (currentDate <= endMonth) {
      monthsArray.push({
        date: new Date(currentDate),
        label: format(currentDate, 'MMM yy')
      });
      currentDate = addMonths(currentDate, 1);
    }
    
    return monthsArray;
  };

  const getCapitalForMonth = (contract, monthDate) => {
    const startDate = parseISO(contract.firstInstalmentDate);
    const endDate = addMonths(startDate, contract.totalInstalments);
    
    // Check if this month is within the contract period
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    if (monthEnd < startDate || monthStart > endDate) {
      return null; // Contract not active this month
    }
    
    // Calculate which month number this is in the contract
    const monthsSinceStart = Math.floor(
      (monthStart - startDate) / (30.44 * 24 * 60 * 60 * 1000)
    );
    
    // Check if any vehicles were settled before/during this month
    let activeVehicles = contract.originalVehicleCount;
    
    contract.vehicles.forEach(vehicle => {
      if (vehicle.status === 'settled' && vehicle.settledAtMonth <= monthsSinceStart) {
        activeVehicles--;
      }
    });
    
    // Calculate capital for this month
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
        <div style={styles.loadingText}>Loading Gantt view...</div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div style={styles.empty}>
          <p>No active contracts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div>
          <h1 style={styles.title}>Gantt Chart View</h1>
          <p style={styles.subtitle}>Contract timeline and monthly capital instalments</p>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.stickyHeader}>Contract</th>
                {months.map((month, index) => (
                  <th key={index} style={styles.monthHeader}>
                    {month.label}
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
                          {contract.activeVehiclesCount}v of {contract.originalVehicleCount}v
                        </div>
                      </div>
                    </td>
                    {months.map((month, index) => {
                      const monthData = getCapitalForMonth(contract, month.date);
                      
                      return (
                        <td key={index} style={styles.cell}>
                          {monthData ? (
                            <div
                              style={{
                                ...styles.cellContent,
                                ...(monthData.isPast ? styles.cellPast : {}),
                                ...(monthData.isCurrent ? styles.cellCurrent : {}),
                                ...(!monthData.isPast && !monthData.isCurrent ? styles.cellFuture : {})
                              }}
                              title={`${contract.contractNumber}: ${formatCurrency(monthData.capital)} (${monthData.activeVehicles} vehicles)`}
                            >
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
              
              {/* TOTAL ROW */}
              <tr style={styles.totalRow}>
                <td style={styles.stickyCellTotal}>
                  <div style={styles.totalLabel}>TOTAL CAPITAL</div>
                </td>
                {months.map((month, index) => {
                  const total = calculateMonthTotal(month.date);
                  
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

      {/* Legend */}
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
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '32px',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '32px'
  },
  backButton: {
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
    marginBottom: '16px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096'
  },
  tableWrapper: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tableContainer: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '70vh'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 30,
    background: '#2D3748',
    color: 'white',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    borderRight: '2px solid #1A202C',
    minWidth: '150px',
    maxWidth: '150px'
  },
  monthHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: '#2D3748',
    color: 'white',
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
    borderRight: '1px solid #4A5568',
    minWidth: '100px'
  },
  row: {
    borderBottom: '1px solid #E2E8F0'
  },
  stickyCell: {
    position: 'sticky',
    left: 0,
    zIndex: 10,
    background: 'white',
    padding: '12px 16px',
    borderRight: '2px solid #E2E8F0',
    minWidth: '150px',
    maxWidth: '150px'
  },
  contractInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  contractNumber: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1A202C'
  },
  vehicleInfo: {
    fontSize: '11px',
    color: '#718096'
  },
  cell: {
    padding: '4px',
    textAlign: 'center',
    borderRight: '1px solid #E2E8F0',
    minWidth: '100px'
  },
  cellContent: {
    padding: '8px 4px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },
  cellPast: {
    background: '#C6F6D5',
    color: '#22543D'
  },
  cellCurrent: {
    background: '#FED7AA',
    color: '#7C2D12',
    border: '2px solid #F97316'
  },
  cellFuture: {
    background: '#DBEAFE',
    color: '#1E3A8A'
  },
  cellEmpty: {
    padding: '8px 4px',
    color: '#E2E8F0'
  },
  totalRow: {
    position: 'sticky',
    bottom: 0,
    zIndex: 15,
    background: '#F7FAFC',
    borderTop: '3px solid #2D3748'
  },
  stickyCellTotal: {
    position: 'sticky',
    left: 0,
    zIndex: 20,
    background: '#2D3748',
    padding: '12px 16px',
    borderRight: '2px solid #1A202C'
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: '12px',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  cellTotal: {
    padding: '4px',
    textAlign: 'center',
    borderRight: '1px solid #E2E8F0'
  },
  totalValue: {
    padding: '8px 4px',
    fontWeight: '700',
    fontSize: '13px',
    color: '#1A202C',
    background: '#EDF2F7',
    borderRadius: '4px'
  },
  legend: {
    marginTop: '24px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  legendTitle: {
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '12px',
    color: '#1A202C'
  },
  legendItems: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#4A5568'
  },
  legendBox: {
    width: '24px',
    height: '24px',
    borderRadius: '4px'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },
  loadingText: {
    fontSize: '18px',
    color: '#718096'
  },
  empty: {
    background: 'white',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: '14px'
  }
};

export default GanttChart;