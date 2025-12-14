import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAllContracts } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import { formatMonthYear } from '../utils/dateHelpers.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { addMonths, parseISO, format } from 'date-fns';
import Header from './Header.jsx';

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
        <div style={styles.loadingText}>Loading Gantt view...</div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div style={styles.container}>
        <Header title="Timeline View">
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
      <Header title="Timeline View">
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </Header>

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
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    margin: '0',
    padding: '40px 60px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: 'white',
    color: '#4B6D8B',
    border: '2px solid #E2E8F0',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
  },
  tableWrapper: {
    background: 'white',
    borderRadius: '20px',
    padding: '0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
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
    background: '#4B6D8B',
    color: 'white',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    borderRight: '2px solid #3A5A73',
    minWidth: '150px',
    maxWidth: '150px'
  },
  monthHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: '#4B6D8B',
    color: 'white',
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
    borderRight: '1px solid #5A7C95',
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
    borderTop: '3px solid #4B6D8B'
  },
  stickyCellTotal: {
    position: 'sticky',
    left: 0,
    zIndex: 20,
    background: '#4B6D8B',
    padding: '12px 16px',
    borderRight: '2px solid #3A5A73'
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
    padding: '20px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  legendTitle: {
    fontWeight: '700',
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
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)'
  },
  loadingText: {
    fontSize: '18px',
    color: '#64748B',
    fontWeight: '600'
  },
  empty: {
    background: 'white',
    borderRadius: '20px',
    padding: '60px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '16px',
    fontWeight: '500'
  }
};

export default GanttChart;