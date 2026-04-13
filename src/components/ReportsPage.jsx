// File: src/components/ReportsPage.jsx
// Main Reports Page - Clean architecture with separated concerns

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { getAllContracts } from '../services/firestoreService.js';
import { useMaturityReports } from '../hooks/useMaturityReports.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import MaturitySection from './Reports/MaturitySection.jsx';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const ReportsPage = ({ onBack, onViewGantt }) => {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    maturityReports,
    loading: reportsLoading,
    getTotalCapital,
    getTotalVehicles,
    getTotalContracts,
    getTotalCapitalAllPeriods
  } = useMaturityReports(contracts);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await getAllContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      alert('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  if (loading || reportsLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <Header title="" onBack={onBack}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </Header>

      {/* Page Title */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Contract Maturity Analysis</h1>
        <p style={styles.pageSubtitle}>Track contracts and vehicles approaching conclusion</p>
      </div>

      {/* Summary KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, background: gradients.error}}>
            <Calendar size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next 30 Days</div>
            <div style={styles.kpiValue}>{maturityReports.next30Days.length}</div>
            <div style={styles.kpiSubtext}>
              {formatCurrency(getTotalCapital(maturityReports.next30Days))}
            </div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, background: `linear-gradient(135deg, ${colors.warning}, #FCD34D)`}}>
            <FileText size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next 60 Days</div>
            <div style={styles.kpiValue}>{maturityReports.next60Days.length}</div>
            <div style={styles.kpiSubtext}>
              {formatCurrency(getTotalCapital(maturityReports.next60Days))}
            </div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, background: `linear-gradient(135deg, ${colors.info}, #93C5FD)`}}>
            <TrendingUp size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Next 90 Days</div>
            <div style={styles.kpiValue}>{maturityReports.next90Days.length}</div>
            <div style={styles.kpiSubtext}>
              {formatCurrency(getTotalCapital(maturityReports.next90Days))}
            </div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, background: gradients.purple}}>
            <AlertCircle size={24} />
          </div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Total Maturing</div>
            <div style={styles.kpiValue}>{getTotalContracts()}</div>
            <div style={styles.kpiSubtext}>
              {formatCurrency(getTotalCapitalAllPeriods())}
            </div>
          </div>
        </div>
      </div>

      {/* Maturity Sections */}
      <div style={styles.reportsContainer}>
        <MaturitySection
          title="Maturing in Next 30 Days"
          contracts={maturityReports.next30Days}
          icon={<Calendar size={20} />}
          iconColor={gradients.error}
          bgGradient={`linear-gradient(135deg, ${colors.errorLight} 0%, ${colors.errorBorder} 100%)`}
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />

        <MaturitySection
          title="Maturing in Next 60 Days"
          contracts={maturityReports.next60Days}
          icon={<FileText size={20} />}
          iconColor={`linear-gradient(135deg, ${colors.warning}, #FCD34D)`}
          bgGradient={`linear-gradient(135deg, ${colors.warningLight} 0%, #FDE68A 100%)`}
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />

        <MaturitySection
          title="Maturing in Next 90 Days"
          contracts={maturityReports.next90Days}
          icon={<TrendingUp size={20} />}
          iconColor={`linear-gradient(135deg, ${colors.info}, #93C5FD)`}
          bgGradient={`linear-gradient(135deg, ${colors.infoLight} 0%, ${colors.infoBorder} 100%)`}
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />
      </div>

      <BottomNav
        onViewGantt={onViewGantt}
        onViewReports={null}
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
    padding: m ? '12px 10px 80px 10px' : '40px 60px',
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
  pageHeader: {
    marginBottom: m ? '16px' : '32px'
  },
  pageTitle: {
    margin: '0 0 4px 0',
    fontSize: m ? fonts.size['2xl'] : fonts.size['4xl'],
    fontWeight: fonts.weight.extrabold,
    background: gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  pageSubtitle: {
    margin: 0,
    fontSize: m ? fonts.size.sm : fonts.size.lg,
    color: colors.textSecondary,
    fontWeight: fonts.weight.medium
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: m ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: m ? '8px' : '16px',
    marginBottom: m ? '16px' : '40px'
  },
  kpiCard: {
    display: 'flex',
    gap: m ? '10px' : '20px',
    padding: m ? '12px' : '24px',
    background: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.card,
    border: `1px solid ${colors.borderLight}`,
    transition: 'all 0.3s'
  },
  kpiIcon: {
    width: m ? '36px' : '48px',
    height: m ? '36px' : '48px',
    borderRadius: radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textOnDark,
    flexShrink: 0
  },
  kpiContent: {
    flex: 1,
    minWidth: 0
  },
  kpiLabel: {
    fontSize: m ? '9px' : fonts.size.xs,
    color: colors.textMuted,
    fontWeight: fonts.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '4px'
  },
  kpiValue: {
    fontSize: m ? fonts.size.xl : '32px',
    fontWeight: fonts.weight.extrabold,
    color: colors.textPrimary,
    marginBottom: '2px',
    lineHeight: '1'
  },
  kpiSubtext: {
    fontSize: m ? fonts.size.xs : fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.medium
  },
  reportsContainer: {
    background: colors.surface,
    borderRadius: m ? radius.lg : radius.xl,
    padding: m ? '12px' : '32px',
    boxShadow: shadows.card,
    border: `1px solid ${colors.borderLight}`
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
  }
});

export default ReportsPage;