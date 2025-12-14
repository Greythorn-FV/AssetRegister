// File: src/utils/hsbcInterestCalculator.js
// HSBC-EXACT interest calculation with multiple precision methods

/**
 * Calculate interest EXACTLY as HSBC does for Fully Variable Purchase
 * Method: ACT/365 with interest on beginning balance
 */
export const calculateHSBCExactInterest = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;
  const monthSamples = [];
  const dayCount = { 28: 0, 29: 0, 30: 0, 31: 0 };

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    dayCount[daysInMonth] = (dayCount[daysInMonth] || 0) + 1;

    // Interest on BEGINNING balance BEFORE capital payment
    const monthlyInterest = remainingCapital * dailyRate * daysInMonth;
    totalInterest += monthlyInterest;

    if (i === 0 || i === Math.floor(months / 2) || i === months - 1) {
      monthSamples.push({
        monthNum: i + 1,
        monthName: monthDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        days: daysInMonth,
        balance: remainingCapital,
        interest: monthlyInterest
      });
    }

    remainingCapital -= monthlyCapitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return {
    totalInterest,
    monthSamples,
    dayCount
  };
};

/**
 * HSBC method with monthly rounding
 */
export const calculateHSBCWithRounding = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthlyInterest = Math.round(remainingCapital * dailyRate * daysInMonth * 100) / 100;
    totalInterest += monthlyInterest;

    remainingCapital -= monthlyCapitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return Math.round(totalInterest * 100) / 100;
};

/**
 * 30/360 Day Count Convention
 */
export const calculateHSBC30_360 = (capital, baseRate, margin, months) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 360;
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;

  for (let i = 0; i < months; i++) {
    const monthlyInterest = remainingCapital * dailyRate * 30;
    totalInterest += monthlyInterest;
    
    remainingCapital -= monthlyCapitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return Math.round(totalInterest * 100) / 100;
};

/**
 * METHOD 5: Ultra-Precise using EXACT contract instalments
 * Uses £401.02 × 35 + £401.13 × 1 = £14,436.83
 */
export const calculateHSBCUltraPrecise = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  
  // EXACT instalments from HSBC contract
  const regularInstalment = 401.02;
  const finalInstalment = 401.13;
  
  let totalInterest = 0;
  let remainingCapital = capital;
  const monthSamples = [];
  const dayCount = { 28: 0, 29: 0, 30: 0, 31: 0 };

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    dayCount[daysInMonth] = (dayCount[daysInMonth] || 0) + 1;

    // Interest on BEGINNING balance
    const monthlyInterest = remainingCapital * dailyRate * daysInMonth;
    totalInterest += monthlyInterest;

    if (i === 0 || i === Math.floor(months / 2) || i === months - 1) {
      monthSamples.push({
        monthNum: i + 1,
        monthName: monthDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        days: daysInMonth,
        balance: remainingCapital,
        interest: monthlyInterest
      });
    }

    // Use EXACT instalment from contract
    const capitalPayment = (i === months - 1) ? finalInstalment : regularInstalment;
    remainingCapital -= capitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return {
    totalInterest,
    monthSamples,
    dayCount
  };
};

/**
 * METHOD 6: Extended precision (rate ÷ 36500 instead of rate/100/365)
 */
export const calculateHSBCWithExtendedPrecision = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = annualRate / 36500; // More precision
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthlyInterest = remainingCapital * dailyRate * daysInMonth;
    totalInterest += monthlyInterest;

    remainingCapital -= monthlyCapitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return totalInterest;
};

/**
 * METHOD 7: Final rounding only (no intermediate rounding)
 */
export const calculateHSBCFinalRounding = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    
    const daysInMonth = new Date(
      monthDate.getFullYear(), 
      monthDate.getMonth() + 1, 
      0
    ).getDate();

    const monthlyInterest = remainingCapital * dailyRate * daysInMonth;
    totalInterest += monthlyInterest;

    remainingCapital -= monthlyCapitalPayment;
    if (remainingCapital < 0) remainingCapital = 0;
  }

  return Math.round(totalInterest * 100) / 100;
};