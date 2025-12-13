import React from 'react';

const InterestRateDisplay = ({ contract }) => {
  if (!contract.interestType || contract.interestType === 'fixed') {
    return (
      <span style={styles.fixed}>
        Fixed Interest
      </span>
    );
  }
  
  const baseRate = contract.baseRate || 0;
  const margin = contract.margin || 0;
  const effectiveRate = baseRate + margin;
  
  return (
    <span style={styles.variable}>
      {effectiveRate.toFixed(2)}% Variable
      <span style={styles.breakdown}>
        ({baseRate.toFixed(2)}% + {margin.toFixed(2)}%)
      </span>
    </span>
  );
};

const styles = {
  fixed: {
    fontSize: '12px',
    color: '#4A5568',
    fontWeight: '500'
  },
  variable: {
    fontSize: '12px',
    color: '#F59E0B',
    fontWeight: '600'
  },
  breakdown: {
    fontSize: '11px',
    color: '#718096',
    marginLeft: '4px',
    fontWeight: '400'
  }
};

export default InterestRateDisplay;
