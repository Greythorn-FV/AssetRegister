import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, FileText, Calendar, Users, Zap } from 'lucide-react';
import KPICard from './KPICard.jsx';
import ContractModal from './ContractModal.jsx';
import ContractDetailModal from './ContractDetailModal.jsx';
import SearchBar from './SearchBar.jsx';
import ContractTable from './ContractTable.jsx';
import { getAllContracts, searchByRegistration, searchByContractNumber } from '../services/firestoreService.js';
import { calculatePortfolioStats } from '../services/calculationService.js';
import { formatCurrency, formatCompactCurrency } from '../utils/currencyHelpers.js';

const Dashboard = ({ onViewGantt }) => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  useEffect(() => {
    loadContracts();
  }, []);
  
  useEffect(() => {
    if (contracts.length > 0) {
      const portfolioStats = calculatePortfolioStats(contracts);
      setStats(portfolioStats);
    }
  }, [contracts]);
  
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredContracts(contracts);
    } else {
      setFilteredContracts(contracts.filter(c => c.status === statusFilter));
    }
  }, [statusFilter, contracts]);
  
  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      setContracts(data);
      setFilteredContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      alert('Failed to load contracts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }
    
    try {
      const vehicleResult = await searchByRegistration(searchTerm);
      
      if (vehicleResult) {
        setSearchResults({
          type: 'vehicle',
          data: vehicleResult
        });
        return;
      }
      
      const contractResult = await searchByContractNumber(searchTerm);
      
      if (contractResult) {
        setSearchResults({
          type: 'contract',
          data: contractResult
        });
        return;
      }
      
      alert('No results found for: ' + searchTerm);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    }
  };
  
  const handleContractAdded = () => {
    loadContracts();
  };
  
  const handleContractClick = (contract) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  const handleDetailModalUpdate = () => {
    loadContracts();
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  // Format interest rate display
  const formatInterestRate = (contract) => {
    if (contract.interestType === 'variable') {
      const rate = (contract.baseRate || 0) + (contract.margin || 0);
      return `${rate.toFixed(2)}% Variable`;
    }
    return 'Fixed';
  };
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading contracts...</div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Asset Finance Register</h1>
          <p style={styles.subtitle}>Vehicle finance contract management</p>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={onViewGantt} style={styles.ganttButton}>
            <Calendar size={20} />
            View Gantt Chart
          </button>
          <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>
            <Plus size={20} />
            Add Contract
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      {stats && (
        <div style={styles.kpiGrid}>
          <KPICard
            title="Total Capital Outstanding"
            value={formatCompactCurrency(stats.totalCapitalOutstanding)}
            subtitle={`+ ${formatCurrency(stats.totalInterestOutstanding)} interest (est.)`}
            icon={TrendingUp}
          />
          <KPICard
            title="Active Contracts"
            value={stats.totalActiveContracts.toString()}
            subtitle={`${stats.totalSettledContracts} settled`}
            icon={FileText}
          />
          <KPICard
            title="Next Month Capital Due"
            value={formatCurrency(stats.nextMonthCapitalDue)}
            subtitle="Capital instalments only"
            icon={Calendar}
          />
          <KPICard
            title="Active Vehicles"
            value={stats.totalActiveVehicles.toString()}
            subtitle={`${stats.totalSettledVehicles} settled`}
            icon={Users}
          />
        </div>
      )}
      
      {/* Search Bar */}
      <div style={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Search Results */}
      {searchResults && (
        <div style={styles.searchResults}>
          <div style={styles.resultsHeader}>
            <h3 style={styles.resultsTitle}>Search Results</h3>
            <button onClick={() => setSearchResults(null)} style={styles.closeResults}>
              Close
            </button>
          </div>
          
          {searchResults.type === 'vehicle' && (
            <div style={styles.vehicleResult}>
              <h4 style={styles.resultLabel}>
                Vehicle: {searchResults.data.vehicle.registration}
                {searchResults.data.vehicle.make && ` - ${searchResults.data.vehicle.make} ${searchResults.data.vehicle.model}`}
              </h4>
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Status:</span>
                  <span style={styles.resultValue}>{searchResults.data.vehicle.status}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Contract:</span>
                  <span style={styles.resultValue}>{searchResults.data.contract.contractNumber}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Interest Type:</span>
                  <span style={styles.resultValue}>
                    {formatInterestRate(searchResults.data.contract)}
                    {searchResults.data.contract.interestType === 'variable' && (
                      <Zap size={14} color="#F59E0B" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                    )}
                  </span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Monthly Capital (this vehicle):</span>
                  <span style={styles.resultValue}>
                    {formatCurrency(searchResults.data.metrics.vehicleMonthlyCapital)}
                  </span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Months Remaining:</span>
                  <span style={styles.resultValue}>{searchResults.data.metrics.monthsRemaining}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Capital Outstanding:</span>
                  <span style={styles.resultValueHighlight}>
                    {formatCurrency(searchResults.data.metrics.vehicleCapitalOutstanding)}
                  </span>
                </div>
                {searchResults.data.contract.interestType === 'variable' && (
                  <div style={styles.resultItem}>
                    <span style={styles.resultKey}>Effective Rate:</span>
                    <span style={styles.resultValue}>
                      {((searchResults.data.contract.baseRate || 0) + (searchResults.data.contract.margin || 0)).toFixed(2)}%
                      <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                        Base: {(searchResults.data.contract.baseRate || 0).toFixed(2)}% + Margin: {(searchResults.data.contract.margin || 0).toFixed(2)}%
                      </div>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {searchResults.type === 'contract' && (
            <div style={styles.contractResult}>
              <h4 style={styles.resultLabel}>
                Contract: {searchResults.data.contractNumber}
                {searchResults.data.interestType === 'variable' && (
                  <span style={styles.variableBadge}>
                    <Zap size={14} />
                    Variable Interest
                  </span>
                )}
              </h4>
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Status:</span>
                  <span style={styles.resultValue}>{searchResults.data.status}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Active Vehicles:</span>
                  <span style={styles.resultValue}>
                    {searchResults.data.activeVehiclesCount} of {searchResults.data.originalVehicleCount}
                  </span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultKey}>Monthly Capital Instalment:</span>
                  <span style={styles.resultValue}>
                    {formatCurrency(searchResults.data.currentMonthlyCapital)}
                  </span>
                </div>
                {searchResults.data.interestType === 'variable' && (
                  <>
                    <div style={styles.resultItem}>
                      <span style={styles.resultKey}>Interest Type:</span>
                      <span style={styles.resultValue}>
                        Variable Rate
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultKey}>Effective Rate:</span>
                      <span style={styles.resultValue}>
                        {((searchResults.data.baseRate || 0) + (searchResults.data.margin || 0)).toFixed(2)}%
                        <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                          {(searchResults.data.baseRate || 0).toFixed(2)}% + {(searchResults.data.margin || 0).toFixed(2)}%
                        </div>
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultKey}>Interest Calculation:</span>
                      <span style={styles.resultValueNote}>
                        Calculated daily on outstanding balance
                      </span>
                    </div>
                  </>
                )}
                {searchResults.data.interestType === 'fixed' && (
                  <div style={styles.resultItem}>
                    <span style={styles.resultKey}>Interest Type:</span>
                    <span style={styles.resultValue}>Fixed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          onClick={() => setStatusFilter('all')}
          style={{
            ...styles.tab,
            ...(statusFilter === 'all' ? styles.tabActive : {})
          }}
        >
          All Contracts ({contracts.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          style={{
            ...styles.tab,
            ...(statusFilter === 'active' ? styles.tabActive : {})
          }}
        >
          Active ({contracts.filter(c => c.status === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('settled')}
          style={{
            ...styles.tab,
            ...(statusFilter === 'settled' ? styles.tabActive : {})
          }}
        >
          Settled ({contracts.filter(c => c.status === 'settled').length})
        </button>
      </div>
      
      {/* Contracts Table */}
      <ContractTable contracts={filteredContracts} onContractClick={handleContractClick} />
      
      {/* Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleContractAdded}
      />

      {/* Contract Detail Modal */}
      <ContractDetailModal
        contract={selectedContract}
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        onUpdate={handleDetailModalUpdate}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
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
  headerButtons: {
    display: 'flex',
    gap: '12px'
  },
  ganttButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  searchSection: {
    marginBottom: '24px'
  },
  searchResults: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #3182CE'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C'
  },
  closeResults: {
    padding: '8px 16px',
    background: '#EDF2F7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568'
  },
  vehicleResult: {
    padding: '16px',
    background: '#F7FAFC',
    borderRadius: '6px'
  },
  contractResult: {
    padding: '16px',
    background: '#F7FAFC',
    borderRadius: '6px'
  },
  resultLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  variableBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#FEF3C7',
    color: '#92400E',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '8px'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultKey: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500'
  },
  resultValue: {
    fontSize: '16px',
    color: '#1A202C',
    fontWeight: '600'
  },
  resultValueHighlight: {
    fontSize: '20px',
    color: '#3182CE',
    fontWeight: '700'
  },
  resultValueNote: {
    fontSize: '13px',
    color: '#4A5568',
    fontWeight: '500',
    fontStyle: 'italic'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  tab: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: '#3182CE',
    color: 'white',
    borderColor: '#3182CE'
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
  }
};

export default Dashboard;