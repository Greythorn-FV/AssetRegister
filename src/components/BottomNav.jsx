import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const BottomNav = ({ onViewGantt, onViewReports, onAddContract }) => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.bar}>
        <button onClick={onViewGantt} style={styles.navItem}>
          <img src="/timeline.svg" alt="" style={styles.navIcon} />
          <span style={styles.navLabel}>Timeline</span>
        </button>

        <button onClick={onAddContract} style={styles.addButton}>
          <img src="/add.svg" alt="" style={styles.addIcon} />
        </button>

        <button onClick={onViewReports} style={styles.navItem}>
          <img src="/reports.svg" alt="" style={styles.navIcon} />
          <span style={styles.navLabel}>Reports</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 900,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    boxShadow: '0 -2px 12px rgba(15, 27, 45, 0.08)'
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '56px',
    padding: '0 24px',
    position: 'relative'
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 16px',
    color: colors.textSecondary,
    WebkitTapHighlightColor: 'transparent'
  },
  navIcon: {
    width: '22px',
    height: '22px',
    opacity: 0.7
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: fonts.weight.semibold,
    letterSpacing: '0.02em',
    color: colors.textSecondary
  },
  addButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: gradients.accent,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.accent,
    marginTop: '-20px',
    WebkitTapHighlightColor: 'transparent'
  },
  addIcon: {
    width: '24px',
    height: '24px',
    filter: 'brightness(0) invert(1)'
  }
};

export default BottomNav;
