//src/components/Header.jsx//
import React from 'react';

const Header = ({ title, children }) => {
  return (
    <div style={styles.header}>
      <img 
        src="/logo.png" 
        alt="Greythorn Logo" 
        style={styles.logo}
      />
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.actions}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  logo: {
    height: '60px',
    width: 'auto',
    flexShrink: 0
  },
  title: {
    fontSize: '42px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
    flex: '1 1 auto',
    textAlign: 'center',
    minWidth: '300px'
  },
  actions: {
    display: 'flex',
    gap: '14px',
    flexShrink: 0
  }
};

export default Header;