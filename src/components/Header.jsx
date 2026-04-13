//src/components/Header.jsx//
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';

const Header = ({ title, children, mobileActions, onBack }) => {
  const isMobile = useIsMobile();
  const s = getStyles(isMobile);

  return (
    <div style={s.header}>
      <div style={s.brandRow}>
        {isMobile && onBack && (
          <button onClick={onBack} style={s.backBtn}>
            <ArrowLeft size={18} />
          </button>
        )}
        <img
          src="/logo.png"
          alt="Greythorn Logo"
          style={s.logo}
        />
        {title && <h1 style={s.title}>{title}</h1>}
        {isMobile && mobileActions && (
          <div style={s.mobileActionsSlot}>{mobileActions}</div>
        )}
      </div>
      {!isMobile && (
        <div style={s.actions}>
          {children}
        </div>
      )}
    </div>
  );
};

const getStyles = (m) => ({
  header: {
    display: 'flex',
    flexDirection: m ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: m ? 'stretch' : 'center',
    marginBottom: m ? '12px' : '32px',
    gap: m ? '8px' : '20px',
    flexWrap: 'wrap'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '8px' : '14px',
    justifyContent: m ? 'flex-start' : 'flex-start',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: radius.md,
    background: colors.background,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    color: colors.primary,
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent'
  },
  logo: {
    height: m ? '28px' : '52px',
    width: 'auto',
    flexShrink: 0
  },
  title: {
    fontSize: m ? '16px' : fonts.size['4xl'],
    fontWeight: fonts.weight.extrabold,
    background: gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
    flex: '1 1 auto',
    textAlign: m ? 'left' : 'center',
    minWidth: m ? 'unset' : '300px'
  },
  mobileActionsSlot: {
    flexShrink: 0,
    marginLeft: 'auto'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  }
});

export default Header;
