// File: src/components/ReportsPage.jsx
// Main Reports Page - Clean architecture with separated concerns

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { getAllContracts } from '../services/firestoreService.js';
import { useMaturityReports } from '../hooks/useMaturityReports.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import MaturitySection from './Reports/MaturitySection.jsx';
import Header from './Header.jsx';

const ReportsPage = ({ onBack }) => {
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
      <Header title="Maturity Reports">
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
          <div style={{...styles.kpiIcon, background: 'linear-gradient(135deg, #DC2626, #EF4444)'}}>
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
          <div style={{...styles.kpiIcon, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)'}}>
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
          <div style={{...styles.kpiIcon, background: 'linear-gradient(135deg, #3B82F6, #60A5FA)'}}>
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
          <div style={{...styles.kpiIcon, background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)'}}>
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
          iconColor="linear-gradient(135deg, #DC2626, #EF4444)"
          bgGradient="linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />

        <MaturitySection
          title="Maturing in Next 60 Days"
          contracts={maturityReports.next60Days}
          icon={<FileText size={20} />}
          iconColor="linear-gradient(135deg, #F59E0B, #FBBF24)"
          bgGradient="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />

        <MaturitySection
          title="Maturing in Next 90 Days"
          contracts={maturityReports.next90Days}
          icon={<TrendingUp size={20} />}
          iconColor="linear-gradient(135deg, #3B82F6, #60A5FA)"
          bgGradient="linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)"
          getTotalCapital={getTotalCapital}
          getTotalVehicles={getTotalVehicles}
        />
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
  pageHeader: {
    marginBottom: '32px'
  },
  pageTitle: {
    margin: '0 0 8px 0',
    fontSize: '36px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#64748B',
    fontWeight: '600'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
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
    color: '#0F172A',
    marginBottom: '4px',
    lineHeight: '1'
  },
  kpiSubtext: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600'
  },
  reportsContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.02)'
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

export default ReportsPage;