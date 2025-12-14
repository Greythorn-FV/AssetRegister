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
    position: 'relative'
  },
  logo: {
    height: '60px',
    width: 'auto'
  },
  title: {
    fontSize: '42px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  actions: {
    display: 'flex',
    gap: '14px'
  }
};

export default Header;