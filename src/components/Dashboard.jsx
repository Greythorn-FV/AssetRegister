import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';
import { getAllContracts, searchByRegistration, searchByContractNumber, deleteAllContracts } from '../services/firestoreService.js';
import { calculateContractMetrics } from '../services/calculationService.js';
import ContractModal from './ContractModal.jsx';
import ContractDetailModal from './ContractDetailModal.jsx';
import Header from './Header.jsx';
import ContractImportModal from './ContractImportModal.jsx';
import BottomNav from './BottomNav.jsx';
import MobileMoreMenu from './MobileMoreMenu.jsx';
import TrashModal from './TrashModal.jsx';


const Dashboard = ({ onViewGantt, onViewReports }) => {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
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

    // Only count contracts that have an instalment due next month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const nextMonthCapitalDue = activeContracts.reduce((sum, contract) => {
      const start = new Date(contract.firstInstalmentDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + contract.totalInstalments);
      // Skip if next month is before contract starts or after it ends
      if (nextMonth < start || nextMonth > end) return sum;
      const metrics = calculateContractMetrics(contract);
      return sum + (metrics.currentMonthlyCapital || 0);
    }, 0);

    const nextMonthInterestDue = activeContracts.reduce((sum, contract) => {
      const start = new Date(contract.firstInstalmentDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + contract.totalInstalments);
      if (nextMonth < start || nextMonth > end) return sum;
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

  const filteredByStatus = statusFilter === 'all'
    ? contracts
    : contracts.filter(c => c.status === statusFilter);

  // Live client-side filter: match partial text against reg, contract number, make, model
  const filteredContracts = searchTerm.trim()
    ? filteredByStatus.filter(c => {
        const term = searchTerm.trim().toUpperCase();
        const contractNum = (c.contractNumber || '').toUpperCase();
        const vehicles = c.vehicles || [];
        const matchesContract = contractNum.includes(term);
        const matchesVehicle = vehicles.some(v =>
          (v.registration || '').toUpperCase().includes(term) ||
          (v.make || '').toUpperCase().includes(term) ||
          (v.model || '').toUpperCase().includes(term) ||
          (v.note || '').toUpperCase().includes(term)
        );
        return matchesContract || matchesVehicle;
      })
    : filteredByStatus;

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
      <Header
        title=""
        mobileActions={
          <MobileMoreMenu
            onImport={() => setIsImportModalOpen(true)}
            onDeleteAll={handleDeleteAllContracts}
            onTrash={() => setIsTrashModalOpen(true)}
            deleteDisabled={isDeleting || contracts.length === 0}
            isDeleting={isDeleting}
          />
        }
      >
        <button onClick={onViewGantt} style={styles.ganttButton}>
          <img src="/timeline.svg" alt="" style={styles.btnIcon} />
          View Timeline
        </button>
        <button onClick={onViewReports} style={styles.reportsButton}>
          <img src="/reports.svg" alt="" style={styles.btnIcon} />
          View Reports
        </button>
        <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>
          <img src="/add.svg" alt="" style={styles.btnIcon} />
          Add New Contract
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          style={{...styles.addButton, background: gradients.success}}
        >
          <img src="/import.svg" alt="" style={styles.btnIcon} />
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
          <img src="/delete.svg" alt="" style={styles.btnIcon} />
          {isDeleting ? 'Deleting...' : 'Delete All'}
        </button>
        <button
          onClick={() => setIsTrashModalOpen(true)}
          style={{...styles.ganttButton}}
        >
          Trash
        </button>
      </Header>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <img src="/capital.svg" alt="" style={styles.kpiSvg} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Capital Outstanding</div>
            <div style={styles.kpiValue}>£{((kpis.totalCapitalOutstanding || 0) / 1000).toFixed(1)}K</div>
            <div style={styles.kpiSubtext}>+£{((kpis.totalInterestOutstanding || 0) / 1000).toFixed(2)}K interest</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <img src="/contracts.svg" alt="" style={styles.kpiSvg} />
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
            <img src="/interest.svg" alt="" style={styles.kpiSvg} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next Month Interest (EST)</div>
            <div style={styles.kpiValue}>£{(kpis.nextMonthInterestDue || 0).toFixed(2)}</div>
            <div style={styles.kpiSubtext}>Interest due</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>
            <img src="/cars.svg" alt="" style={styles.kpiSvg} />
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
          <div style={styles.cardGrid}>
            {filteredContracts.map(contract => {
              const metrics = calculateContractMetrics(contract);

              return (
                <div
                  key={contract.id}
                  onClick={() => handleContractClick(contract)}
                  style={styles.contractCard}
                  onMouseEnter={isMobile ? undefined : (e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = shadows.cardHover;
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={isMobile ? undefined : (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = shadows.sm;
                    e.currentTarget.style.borderColor = colors.border;
                  }}>

                  {/* Card Header: Name + Badges */}
                  <div style={styles.cardHeader}>
                    <div style={styles.contractInfo}>
                      <div style={styles.contractNumber}>{contract.contractNumber}</div>
                      <div style={styles.contractMake}>{contract.vehicles?.[0]?.make || 'N/A'} {contract.vehicles?.length > 1 ? `+${contract.vehicles.length - 1}` : ''}</div>
                    </div>
                    <div style={styles.badgesContainer}>
                      <div style={{
                        ...styles.statusBadge,
                        ...(contract.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeSettled)
                      }}>
                        {contract.status}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={styles.cardDivider} />

                  {/* Metrics Grid */}
                  <div style={styles.cardMetrics}>
                    <div style={styles.contractMetric}>
                      <div style={styles.metricLabel}>VEHICLES</div>
                      <div style={styles.metricValue}>
                        {contract.activeVehiclesCount || 0}
                        <span style={styles.metricTotal}>/{contract.originalVehicleCount || 0}</span>
                      </div>
                    </div>
                    <div style={styles.contractMetric}>
                      <div style={styles.metricLabel}>MONTHLY</div>
                      <div style={styles.metricValueHighlight}>£{(metrics.currentMonthlyCapital || 0).toFixed(2)}</div>
                      <div style={styles.metricSubtext}>+£{(metrics.monthlyInterest || 0).toFixed(2)} int.</div>
                    </div>
                    <div style={styles.contractMetric}>
                      <div style={styles.metricLabel}>OUTSTANDING</div>
                      <div style={styles.metricValueHighlight}>£{((metrics.capitalOutstanding || 0) / 1000).toFixed(1)}K</div>
                      <div style={styles.metricSubtext}>{metrics.monthsRemaining || 0} months</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={styles.cardProgress}>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${metrics.progress || 0}%`
                      }} />
                    </div>
                    <div style={styles.progressText}>{Math.round(metrics.progress || 0)}%</div>
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

      {/* Trash Modal */}
      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        onRestore={loadContracts}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onViewGantt={onViewGantt}
        onViewReports={onViewReports}
        onAddContract={() => setIsModalOpen(true)}
      />
    </div>
  );
};

const getStyles = (m) => {
  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: m ? '6px' : '8px',
    padding: m ? '10px 12px' : '12px 22px',
    borderRadius: radius.md,
    fontSize: m ? fonts.size.sm : fonts.size.base,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    flex: m ? '1 1 auto' : undefined,
    letterSpacing: '0.01em',
  };

  return {
    container: {
      width: '100%',
      maxWidth: '100vw',
      margin: '0',
      padding: m ? '12px 10px 80px 10px' : '32px 48px',
      minHeight: '100vh',
      background: colors.background,
      fontFamily: fonts.family,
      overflowX: 'hidden',
      boxSizing: 'border-box'
    },
    ganttButton: {
      ...btnBase,
      background: colors.surface,
      color: colors.primary,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.sm
    },
    reportsButton: {
      ...btnBase,
      background: gradients.purple,
      color: colors.textOnDark,
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
    },
    deleteAllButton: {
      ...btnBase,
      background: gradients.error,
      color: colors.textOnDark,
      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
    },
    addButton: {
      ...btnBase,
      background: gradients.primary,
      color: colors.textOnDark,
      boxShadow: shadows.md
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: m ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: m ? '6px' : '16px',
      marginBottom: m ? '12px' : '28px'
    },
    kpiCard: {
      display: 'flex',
      flexDirection: m ? 'column' : 'row',
      alignItems: m ? 'center' : undefined,
      textAlign: m ? 'center' : undefined,
      gap: m ? '4px' : '16px',
      padding: m ? '8px 4px' : '20px',
      background: colors.surface,
      borderRadius: radius.lg,
      boxShadow: shadows.card,
      border: `1px solid ${colors.borderLight}`,
      transition: 'all 0.2s'
    },
    kpiIcon: {
      width: m ? '28px' : '48px',
      height: m ? '28px' : '48px',
      background: gradients.primary,
      borderRadius: radius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.accent,
      flexShrink: 0
    },
    kpiContent: {
      flex: 1,
      minWidth: 0
    },
    kpiLabel: {
      fontSize: m ? '8px' : fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: m ? '2px' : '4px'
    },
    kpiValue: {
      fontSize: m ? '14px' : fonts.size['3xl'],
      fontWeight: fonts.weight.extrabold,
      color: colors.primary,
      marginBottom: '2px',
      lineHeight: '1.1'
    },
    kpiSubtext: {
      fontSize: m ? '8px' : fonts.size.sm,
      color: colors.textSecondary,
      fontWeight: fonts.weight.medium
    },
    searchSection: {
      display: 'flex',
      flexDirection: m ? 'column' : 'row',
      gap: m ? '8px' : '12px',
      marginBottom: m ? '16px' : '24px',
      maxWidth: '100%'
    },
    searchInputContainer: {
      flex: 1,
      position: 'relative',
      minWidth: 0
    },
    searchIcon: {
      position: 'absolute',
      left: m ? '12px' : '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.textMuted,
      pointerEvents: 'none'
    },
    searchInput: {
      width: '100%',
      padding: m ? '12px 12px 12px 38px' : '14px 16px 14px 48px',
      fontSize: fonts.size.base,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      outline: 'none',
      transition: 'all 0.2s',
      background: colors.surface,
      fontWeight: fonts.weight.normal,
      color: colors.textPrimary,
      boxSizing: 'border-box',
      fontFamily: fonts.family
    },
    searchButton: {
      padding: m ? '12px 16px' : '14px 28px',
      background: gradients.primary,
      color: colors.textOnDark,
      border: 'none',
      borderRadius: radius.md,
      fontSize: fonts.size.base,
      fontWeight: fonts.weight.semibold,
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: shadows.md,
      width: m ? '100%' : undefined
    },
    searchResultsCard: {
      background: colors.surface,
      padding: m ? '14px' : '24px',
      borderRadius: radius.lg,
      marginBottom: m ? '16px' : '24px',
      boxShadow: shadows.md,
      border: `2px solid ${colors.accent}`
    },
    searchResultsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: m ? '12px' : '16px'
    },
    searchResultsTitle: {
      fontSize: m ? fonts.size.base : fonts.size.xl,
      fontWeight: fonts.weight.bold,
      color: colors.primary
    },
    clearSearchButton: {
      padding: '6px 14px',
      background: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      fontSize: fonts.size.sm,
      fontWeight: fonts.weight.semibold,
      color: colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: m ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: m ? '10px' : '14px'
    },
    resultItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    resultKey: {
      fontSize: fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.medium
    },
    resultValue: {
      fontSize: m ? fonts.size.base : fonts.size.lg,
      color: colors.textPrimary,
      fontWeight: fonts.weight.bold
    },
    resultValueHighlight: {
      fontSize: m ? fonts.size.lg : fonts.size.xl,
      color: colors.accent,
      fontWeight: fonts.weight.bold
    },
    filterTabs: {
      display: 'flex',
      gap: m ? '4px' : '8px',
      marginBottom: m ? '14px' : '20px',
      padding: '4px',
      background: colors.surface,
      borderRadius: radius.lg,
      boxShadow: shadows.sm,
      border: `1px solid ${colors.borderLight}`,
      width: m ? '100%' : 'fit-content',
      overflowX: m ? 'auto' : undefined
    },
    tab: {
      padding: m ? '8px 12px' : '10px 20px',
      background: 'transparent',
      border: 'none',
      borderRadius: radius.md,
      cursor: 'pointer',
      fontSize: m ? fonts.size.sm : fonts.size.base,
      fontWeight: fonts.weight.medium,
      color: colors.textSecondary,
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      flex: m ? '1 1 auto' : undefined,
      textAlign: 'center'
    },
    tabActive: {
      background: gradients.primary,
      color: colors.textOnDark,
      boxShadow: shadows.md,
      fontWeight: fonts.weight.semibold
    },
    contractsContainer: {
      background: colors.surface,
      borderRadius: radius.xl,
      padding: m ? '14px' : '28px',
      boxShadow: shadows.card,
      border: `1px solid ${colors.borderLight}`
    },
    contractsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: m ? '14px' : '24px'
    },
    contractsTitle: {
      fontSize: m ? fonts.size.lg : fonts.size['2xl'],
      fontWeight: fonts.weight.bold,
      color: colors.textPrimary,
      letterSpacing: '-0.02em'
    },
    contractCount: {
      fontSize: m ? fonts.size.xs : fonts.size.sm,
      color: colors.textMuted,
      fontWeight: fonts.weight.medium,
      padding: m ? '4px 10px' : '6px 14px',
      background: colors.background,
      borderRadius: radius.md,
      border: `1px solid ${colors.borderLight}`
    },
    emptyState: {
      textAlign: 'center',
      padding: m ? '40px 16px' : '80px 20px'
    },
    emptyIcon: {
      fontSize: m ? '48px' : '64px',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: m ? fonts.size.xl : fonts.size['2xl'],
      fontWeight: fonts.weight.bold,
      color: colors.textPrimary,
      marginBottom: '8px'
    },
    emptyText: {
      fontSize: fonts.size.base,
      color: colors.textSecondary,
      fontWeight: fonts.weight.normal
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: m ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: m ? '6px' : '10px'
    },
    contractCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: m ? '5px' : '8px',
      padding: m ? '8px' : '12px',
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderTop: `2px solid ${colors.accent}`,
      borderRadius: radius.md,
      cursor: 'pointer',
      transition: 'all 0.2s',
      overflow: 'hidden',
      minWidth: 0,
      boxShadow: shadows.sm
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '4px'
    },
    cardDivider: {
      height: '1px',
      background: colors.borderLight
    },
    cardMetrics: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: m ? '4px' : '6px'
    },
    cardProgress: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    contractInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    contractHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    contractNumber: {
      fontSize: m ? fonts.size.sm : fonts.size.base,
      fontWeight: fonts.weight.semibold,
      color: colors.textSecondary,
      letterSpacing: '-0.01em'
    },
    contractMake: {
      fontSize: m ? '10px' : fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.medium
    },
    contractMetric: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      overflow: 'hidden',
      minWidth: 0
    },
    metricLabel: {
      fontSize: m ? '8px' : '9px',
      color: colors.textMuted,
      fontWeight: fonts.weight.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    metricValue: {
      fontSize: m ? fonts.size.xs : fonts.size.sm,
      fontWeight: fonts.weight.semibold,
      color: colors.textSecondary
    },
    metricTotal: {
      fontSize: m ? '10px' : fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.medium
    },
    metricSubtext: {
      fontSize: m ? '10px' : fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.normal
    },
    metricValueHighlight: {
      fontSize: m ? fonts.size.xs : fonts.size.sm,
      fontWeight: fonts.weight.semibold,
      color: colors.accent
    },
    progressBar: {
      flex: 1,
      height: '6px',
      background: colors.borderLight,
      borderRadius: radius.full,
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: gradients.accent,
      borderRadius: radius.full,
      transition: 'width 0.3s'
    },
    progressText: {
      fontSize: fonts.size.xs,
      color: colors.textMuted,
      fontWeight: fonts.weight.medium,
      textAlign: 'center'
    },
    contractBadges: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    badgesContainer: {
      display: 'flex',
      flexDirection: m ? 'row' : 'column',
      gap: '4px',
      alignItems: m ? 'center' : 'flex-end'
    },
    statusBadge: {
      padding: '2px 7px',
      borderRadius: radius.sm,
      fontSize: '9px',
      fontWeight: fonts.weight.bold,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    statusBadgeActive: {
      background: colors.successLight,
      color: colors.successText,
      border: `1px solid ${colors.successBorder}`
    },
    statusBadgeSettled: {
      background: colors.settledBg,
      color: colors.settled,
      border: `1px solid ${colors.borderDark}`
    },
    variableTypeBadge: {
      padding: '2px 6px',
      background: colors.warningLight,
      borderRadius: radius.sm,
      fontSize: '9px',
      fontWeight: fonts.weight.bold,
      color: colors.warningText,
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      border: `1px solid ${colors.warningBorder}`
    },
    btnIcon: {
      width: m ? '16px' : '18px',
      height: m ? '16px' : '18px',
      flexShrink: 0
    },
    kpiSvg: {
      width: m ? '14px' : '24px',
      height: m ? '14px' : '24px'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: colors.background
    },
    loadingText: {
      fontSize: fonts.size.xl,
      color: colors.textSecondary,
      fontWeight: fonts.weight.medium
    }
  };
};

export default Dashboard;