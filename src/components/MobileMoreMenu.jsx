import React, { useState, useRef, useEffect } from 'react';
import { colors, fonts, shadows, radius } from '../styles/theme.js';

const MobileMoreMenu = ({ onImport, onDeleteAll, onTrash, deleteDisabled, isDeleting }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('touchstart', handler);
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  return (
    <div ref={menuRef} style={styles.wrapper}>
      <button onClick={() => setOpen(!open)} style={styles.trigger}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="4" r="1.8" fill={colors.textSecondary} />
          <circle cx="10" cy="10" r="1.8" fill={colors.textSecondary} />
          <circle cx="10" cy="16" r="1.8" fill={colors.textSecondary} />
        </svg>
      </button>

      {open && (
        <div style={styles.menu}>
          <button
            onClick={() => { onImport(); setOpen(false); }}
            style={styles.menuItem}
          >
            <img src="/import.svg" alt="" style={styles.menuIcon} />
            Import Contracts
          </button>
          <div style={styles.divider} />
          <button
            onClick={() => { onTrash(); setOpen(false); }}
            style={styles.menuItem}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Trash
          </button>
          <div style={styles.divider} />
          <button
            onClick={() => { onDeleteAll(); setOpen(false); }}
            disabled={deleteDisabled}
            style={{
              ...styles.menuItem,
              ...styles.menuItemDanger,
              opacity: deleteDisabled ? 0.4 : 1
            }}
          >
            <img src="/delete.svg" alt="" style={styles.menuIcon} />
            {isDeleting ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative'
  },
  trigger: {
    width: '36px',
    height: '36px',
    borderRadius: radius.md,
    background: colors.background,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent'
  },
  menu: {
    position: 'absolute',
    top: '42px',
    right: 0,
    background: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border}`,
    minWidth: '180px',
    zIndex: 1000,
    overflow: 'hidden'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    textAlign: 'left',
    WebkitTapHighlightColor: 'transparent'
  },
  menuItemDanger: {
    color: colors.error
  },
  menuIcon: {
    width: '16px',
    height: '16px'
  },
  divider: {
    height: '1px',
    background: colors.borderLight
  }
};

export default MobileMoreMenu;
