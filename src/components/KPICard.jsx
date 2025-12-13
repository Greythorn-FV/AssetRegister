import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          {Icon && <Icon size={24} color="#4A5568" />}
        </div>
        <div style={styles.content}>
          <div style={styles.title}>{title}</div>
          <div style={styles.value}>{value}</div>
          {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
          {trend && <div style={styles.trend}>{trend}</div>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E2E8F0'
  },
  header: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  iconWrapper: {
    padding: '10px',
    background: '#F7FAFC',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '8px',
    fontWeight: '500'
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#A0AEC0',
    marginTop: '4px'
  },
  trend: {
    fontSize: '12px',
    color: '#48BB78',
    marginTop: '8px',
    fontWeight: '500'
  }
};

export default KPICard;