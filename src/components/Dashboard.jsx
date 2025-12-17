import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Calendar, Users, Search, Plus, Zap, Upload, BarChart3, Trash2 } from 'lucide-react';
import { getAllContracts, searchByRegistration, searchByContractNumber, deleteAllContracts } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import ContractModal from './ContractModal.jsx';
import ContractDetailModal from './ContractDetailModal.jsx';
import Header from './Header.jsx';
import ContractImportModal from './ContractImportModal.jsx';


const Dashboard = ({ onViewGantt, onViewReports }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete all contracts
  const handleDeleteAllContracts = async () => {
    if (contracts.length === 0) {
      alert('No contracts to delete.');
      return;
    }

    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: You are about to delete ALL ${contracts.length} contracts!\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`
    );

    if (!firstConfirm) return;

    // Second confirmation - type to confirm
    const typeConfirm = window.prompt(
      `To confirm deletion of all ${contracts.length} contracts, type "DELETE ALL" below:`
    );

    if (typeConfirm !== 'DELETE ALL') {
      alert('Deletion cancelled. You must type "DELETE ALL" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      const deletedCount = await deleteAllContracts();
      alert(`✅ Successfully deleted ${deletedCount} contracts.`);
      loadContracts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting contracts:', error);
      alert('❌ Failed to delete contracts: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await getAllContracts();
      setContracts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setLoading(false);
    }
  };

  const calculateDashboardKPIs = () => {
    const activeContracts = contracts.filter(c => c.status === 'active');
    
    const totalCapitalOutstanding = activeContracts.reduce((sum, contract) => {
      const metrics = calculateContractMetrics(contract);
      return sum + (metrics.capitalOutstanding || 0);
    }, 0);

    const totalInterestOutstanding = activeContracts.reduce((sum, contract) => {
      const metrics = calculateContractMetrics(contract);
      return sum + (metrics.interestOutstanding || 0);
    }, 0);

    const nextMonthCapitalDue = activeContracts.reduce((sum, contract) => {
      const metrics = calculateContractMetrics(contract);
      return sum + (metrics.currentMonthlyCapital || 0);
    }, 0);

    const nextMonthInterestDue = activeContracts.reduce((sum, contract) => {
      const metrics = calculateContractMetrics(contract);
      return sum + (metrics.monthlyInterest || 0);
    }, 0);

    const totalActiveVehicles = activeContracts.reduce((sum, contract) => {
      return sum + (contract.activeVehiclesCount || 0);
    }, 0);

    const totalSettledVehicles = contracts.reduce((sum, contract) => {
      return sum + (contract.originalVehicleCount || 0) - (contract.activeVehiclesCount || 0);
    }, 0);

    return {
      totalCapitalOutstanding,
      totalInterestOutstanding,
      nextMonthCapitalDue,
      nextMonthInterestDue,
      activeContracts: activeContracts.length,
      settledContracts: contracts.length - activeContracts.length,
      totalActiveVehicles,
      totalSettledVehicles
    };
  };

  const kpis = contracts.length > 0 ? calculateDashboardKPIs() : {
    totalCapitalOutstanding: 0,
    totalInterestOutstanding: 0,
    nextMonthCapitalDue: 0,
    nextMonthInterestDue: 0,
    activeContracts: 0,
    settledContracts: 0,
    totalActiveVehicles: 0,
    totalSettledVehicles: 0
  };

  const filteredContracts = statusFilter === 'all' 
    ? contracts 
    : contracts.filter(c => c.status === statusFilter);

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

  const formatInterestRate = (contract) => {
    if (contract.interestType === 'variable') {
      const rate = (contract.baseRate || 0) + (contract.margin || 0);
      return `${rate.toFixed(2)}% Variable`;
    }
    return 'Fixed';
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value || value === 0) return '—';
    return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      {/* Header with Logo */}
      <Header title="Asset Finance Register">
  <button onClick={onViewGantt} style={styles.ganttButton}>
    <Calendar size={18} />
    View Timeline
  </button>
  <button onClick={onViewReports} style={styles.reportsButton}>
    <BarChart3 size={18} />
    View Reports
  </button>
  <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>
    <Plus size={18} />
    Add New Contract
  </button>
  <button 
    onClick={() => setIsImportModalOpen(true)} 
    style={{...styles.addButton, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'}}
  >
    <Upload size={20} />
    Import Contracts
  </button>
  <button 
    onClick={handleDeleteAllContracts} 
    disabled={isDeleting || contracts.length === 0}
    style={{
      ...styles.deleteAllButton,
      opacity: (isDeleting || contracts.length === 0) ? 0.5 : 1,
      cursor: (isDeleting || contracts.length === 0) ? 'not-allowed' : 'pointer'
    }}
  >
    <Trash2 size={18} />
    {isDeleting ? 'Deleting...' : 'Delete All'}
  </button>
</Header>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <TrendingUp size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Capital Outstanding</div>
            <div style={styles.kpiValue}>£{((kpis.totalCapitalOutstanding || 0) / 1000).toFixed(1)}K</div>
            <div style={styles.kpiSubtext}>+£{((kpis.totalInterestOutstanding || 0) / 1000).toFixed(2)}K interest</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <FileText size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Active Contracts</div>
            <div style={styles.kpiValue}>{kpis.activeContracts || 0}</div>
            <div style={styles.kpiSubtext}>{kpis.settledContracts || 0} settled</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <Calendar size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next Month Capital</div>
            <div style={styles.kpiValue}>£{(kpis.nextMonthCapitalDue || 0).toFixed(2)}</div>
            <div style={styles.kpiSubtext}>Capital instalments</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <Zap size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next Month Interest (EST)</div>
            <div style={styles.kpiValue}>£{(kpis.nextMonthInterestDue || 0).toFixed(2)}</div>
            <div style={styles.kpiSubtext}>Interest due</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <Users size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Active Vehicles</div>
            <div style={styles.kpiValue}>{kpis.totalActiveVehicles || 0}</div>
            <div style={styles.kpiSubtext}>{kpis.totalSettledVehicles || 0} settled</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchSection}>
        <div style={styles.searchInputContainer}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by registration or contract number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchTerm);
              }
            }}
            style={styles.searchInput}
          />
        </div>
        <button 
          onClick={() => handleSearch(searchTerm)}
          style={styles.searchButton}
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div style={styles.searchResultsCard}>
          <div style={styles.searchResultsHeader}>
            <span style={styles.searchResultsTitle}>
              Search Results - {searchResults.type === 'vehicle' ? 'Vehicle' : 'Contract'} Found
            </span>
            <button 
              onClick={() => setSearchResults(null)}
              style={styles.clearSearchButton}
            >
              Clear
            </button>
          </div>
          
          {searchResults.type === 'vehicle' ? (
            <div style={styles.resultGrid}>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Registration</div>
                <div style={styles.resultValueHighlight}>{searchResults.data.vehicle.registration}</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Make/Model</div>
                <div style={styles.resultValue}>
                  {searchResults.data.vehicle.make} {searchResults.data.vehicle.model}
                </div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Contract</div>
                <div style={styles.resultValue}>{searchResults.data.contract.contractNumber}</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Status</div>
                <div style={styles.resultValue}>
                  {searchResults.data.vehicle.status === 'settled' ? 'Settled' : 'Active'}
                </div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Net Price</div>
                <div style={styles.resultValue}>
                  {formatCurrency(searchResults.data.vehicle.netPrice)}
                </div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Gross Price</div>
                <div style={styles.resultValue}>
                  {formatCurrency(searchResults.data.vehicle.grossPrice)}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.resultGrid}>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Contract Number</div>
                <div style={styles.resultValueHighlight}>{searchResults.data.contractNumber}</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Vehicles</div>
                <div style={styles.resultValue}>{searchResults.data.vehicles?.length || 0}</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultKey}>Status</div>
                <div style={styles.resultValue}>{searchResults.data.status}</div>
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

      {/* Contracts List */}
      <div style={styles.contractsContainer}>
        <div style={styles.contractsHeader}>
          <h2 style={styles.contractsTitle}>
            {statusFilter === 'all' ? 'All Contracts' : statusFilter === 'active' ? 'Active Contracts' : 'Settled Contracts'}
          </h2>
          <div style={styles.contractCount}>
            {filteredContracts.length} {filteredContracts.length === 1 ? 'contract' : 'contracts'}
          </div>
        </div>

        {filteredContracts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <div style={styles.emptyTitle}>No contracts found</div>
            <div style={styles.emptyText}>
              {statusFilter !== 'all' ? `No ${statusFilter} contracts` : 'Start by adding a new contract'}
            </div>
          </div>
        ) : (
          <div>
            {filteredContracts.map(contract => {
              const metrics = calculateContractMetrics(contract);
              
              return (
                <div 
                  key={contract.id}
                  onClick={() => handleContractClick(contract)}
                  style={styles.contractRow}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(75, 109, 139, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#4B6D8B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}>
                  
                  {/* Accent line */}
                  <div style={{
                    ...styles.accentLine,
                    background: contract.status === 'active' 
                      ? 'linear-gradient(180deg, #4B6D8B, #6B8CAE)' 
                      : 'linear-gradient(180deg, #9CA3AF, #D1D5DB)'
                  }} />

                  {/* Contract Info */}
                  <div style={styles.contractInfo}>
                    <div style={styles.contractHeader}>
                      <div>
                        <div style={styles.contractNumber}>{contract.contractNumber}</div>
                        <div style={styles.contractMake}>{contract.vehicles?.[0]?.make || 'N/A'} {contract.vehicles?.length > 1 ? `+${contract.vehicles.length - 1}` : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicles Count */}
                  <div style={styles.contractMetric}>
                    <div style={styles.metricLabel}>VEHICLES</div>
                    <div style={styles.metricValue}>
                      {contract.activeVehiclesCount || 0}
                      <span style={styles.metricTotal}>/{contract.originalVehicleCount || 0}</span>
                    </div>
                  </div>

                  {/* Monthly Capital */}
                  <div style={styles.contractMetric}>
                    <div style={styles.metricLabel}>MONTHLY CAPITAL</div>
                    <div style={styles.metricValueHighlight}>£{(metrics.currentMonthlyCapital || 0).toFixed(2)}</div>
                    <div style={styles.metricSubtext}>+£{(metrics.monthlyInterest || 0).toFixed(2)} int.</div>
                  </div>

                  {/* Outstanding */}
                  <div style={styles.contractMetric}>
                    <div style={styles.metricLabel}>OUTSTANDING</div>
                    <div style={styles.metricValueHighlight}>£{((metrics.capitalOutstanding || 0) / 1000).toFixed(1)}K</div>
                    <div style={styles.metricSubtext}>{metrics.monthsRemaining || 0} months</div>
                  </div>

                  {/* Progress Bar */}
                  <div style={styles.contractProgress}>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${metrics.progress || 0}%`
                      }} />
                    </div>
                    <div style={styles.progressText}>{Math.round(metrics.progress || 0)}%</div>
                  </div>

                  {/* Status Badges */}
                  <div style={styles.contractBadges}>
                    <div style={styles.badgesContainer}>
                      <div style={{
                        ...styles.statusBadge,
                        ...(contract.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeSettled)
                      }}>
                        {contract.status}
                      </div>
                      {contract.interestType === 'variable' && (
                        <div style={styles.variableTypeBadge}>
                          <Zap size={10} />
                          VAR
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleContractAdded}
      />

      {/* Contract Detail Modal */}
      {isDetailModalOpen && selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          onUpdate={handleDetailModalUpdate}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ContractImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => {
            setIsImportModalOpen(false);
            loadContracts();
          }}
        />
      )}
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
  ganttButton: {
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
  reportsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  },
  deleteAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(75, 109, 139, 0.3)'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  kpiCard: {
    display: 'flex',
    gap: '20px',
    padding: '28px',
    background: 'white',
    borderRadius: '18px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.02)',
    transition: 'all 0.3s'
  },
  kpiIcon: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0
  },
  kpiContent: {
    flex: 1
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px'
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
    lineHeight: '1'
  },
  kpiSubtext: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600'
  },
  searchSection: {
    display: 'flex',
    gap: '14px',
    marginBottom: '32px'
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '18px 20px 18px 52px',
    fontSize: '15px',
    border: '2px solid #E2E8F0',
    borderRadius: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    background: 'white',
    fontWeight: '500',
    color: '#0F172A'
  },
  searchButton: {
    padding: '18px 36px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(75, 109, 139, 0.3)'
  },
  searchResultsCard: {
    background: 'white',
    padding: '28px',
    borderRadius: '18px',
    marginBottom: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '2px solid #4B6D8B'
  },
  searchResultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  searchResultsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#4B6D8B'
  },
  clearSearchButton: {
    padding: '8px 18px',
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    fontWeight: '600'
  },
  resultValue: {
    fontSize: '16px',
    color: '#0F172A',
    fontWeight: '700'
  },
  resultValueHighlight: {
    fontSize: '20px',
    color: '#4B6D8B',
    fontWeight: '700'
  },
  filterTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    padding: '6px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    width: 'fit-content'
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748B',
    transition: 'all 0.2s',
    textTransform: 'capitalize'
  },
  tabActive: {
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(75, 109, 139, 0.3)'
  },
  contractsContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.02)'
  },
  contractsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  contractsTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: '-0.5px'
  },
  contractCount: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '600',
    padding: '8px 18px',
    background: '#F1F5F9',
    borderRadius: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '15px',
    color: '#64748B',
    fontWeight: '500'
  },
  contractRow: {
    display: 'grid',
    gridTemplateColumns: '4px 2fr 1fr 1.5fr 1.5fr 1.5fr 1fr',
    alignItems: 'center',
    gap: '24px',
    padding: '24px',
    marginBottom: '16px',
    background: 'white',
    border: '2px solid #E2E8F0',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
  },
  accentLine: {
    width: '4px',
    height: '60px',
    borderRadius: '999px'
  },
  contractInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  contractHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  contractNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '4px'
  },
  contractMake: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '600'
  },
  contractMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: '10px',
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricValue: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '2px'
  },
  metricTotal: {
    fontSize: '13px',
    color: '#94A3B8',
    fontWeight: '600'
  },
  metricSubtext: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '500'
  },
  metricValueHighlight: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#4B6D8B',
    marginBottom: '2px'
  },
  contractProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#E2E8F0',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '6px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4B6D8B, #6B8CAE)',
    borderRadius: '999px',
    transition: 'width 0.3s'
  },
  progressText: {
    fontSize: '11px',
    color: '#4B6D8B',
    fontWeight: '700',
    textAlign: 'center'
  },
  contractBadges: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  badgesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusBadgeActive: {
    background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
    color: '#166534',
    border: '1px solid #86EFAC'
  },
  statusBadgeSettled: {
    background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
    color: '#475569',
    border: '1px solid #CBD5E1'
  },
  variableTypeBadge: {
    padding: '4px 10px',
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#92400E',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    border: '1px solid #FCD34D'
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
  }
};

export default Dashboard;