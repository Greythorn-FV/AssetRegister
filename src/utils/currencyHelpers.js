export const formatCurrency = (amount, showPence = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '£0.00';
  }
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: showPence ? 2 : 0,
    maximumFractionDigits: showPence ? 2 : 0
  }).format(amount);
};

export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  const cleaned = currencyString.replace(/[£,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatCompactCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '£0';
  }
  
  if (amount >= 1000000) {
    return `£${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `£${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, false);
};