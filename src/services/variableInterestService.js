// File: C:\Asset Register\src\services\variableInterestService.js

/**
 * Variable Interest Calculation Service
 * For contracts with variable interest rates (like HSBC Fully Variable Purchase)
 */

/**
 * Calculate daily interest rate
 * @param {number} annualRate - Annual interest rate as percentage (e.g., 8.75)
 * @returns {number} Daily interest rate as decimal
 */
export const calculateDailyRate = (annualRate) => {
  return (annualRate / 100) / 365;
};

/**
 * Calculate daily interest amount
 * @param {number} outstandingBalance - Current outstanding capital
 * @param {number} annualRate - Annual interest rate as percentage
 * @returns {number} Daily interest amount
 */
export const calculateDailyInterest = (outstandingBalance, annualRate) => {
  const dailyRate = calculateDailyRate(annualRate);
  return outstandingBalance * dailyRate;
};

/**
 * Calculate monthly interest (accumulated daily)
 * @param {number} outstandingBalance - Outstanding capital at start of month
 * @param {number} annualRate - Annual interest rate as percentage
 * @param {number} daysInMonth - Number of days in the month (default 30)
 * @returns {number} Total interest for the month
 */
export const calculateMonthlyInterest = (outstandingBalance, annualRate, daysInMonth = 30) => {
  const dailyInterest = calculateDailyInterest(outstandingBalance, annualRate);
  return dailyInterest * daysInMonth;
};

/**
 * Calculate outstanding balance after a capital payment
 * @param {number} currentBalance - Current outstanding capital
 * @param {number} capitalPayment - Capital payment amount
 * @returns {number} New outstanding balance
 */
export const calculateNewBalance = (currentBalance, capitalPayment) => {
  return Math.max(0, currentBalance - capitalPayment);
};

/**
 * Calculate variable interest for entire contract lifecycle
 * @param {Object} contract - Contract object
 * @returns {Array} Array of payment schedules with interest
 */
export const calculateVariableInterestSchedule = (contract) => {
  const {
    totalCapital,
    monthlyCapitalInstalment,
    totalInstalments,
    interestRateAnnual, // New field: annual interest rate
    baseRate, // New field: base rate (e.g., 5.25)
    margin // New field: margin above base rate (e.g., 3.50)
  } = contract;

  // Calculate effective annual rate
  const effectiveRate = interestRateAnnual || (baseRate + margin);
  
  let outstandingBalance = totalCapital;
  const schedule = [];
  
  for (let month = 1; month <= totalInstalments; month++) {
    // Calculate interest for this month
    const monthlyInterest = calculateMonthlyInterest(outstandingBalance, effectiveRate);
    
    // Capital payment (per vehicle basis if applicable)
    const capitalPayment = monthlyCapitalInstalment;
    
    // Calculate new balance
    const newBalance = calculateNewBalance(outstandingBalance, capitalPayment);
    
    schedule.push({
      month,
      outstandingBalanceStart: outstandingBalance,
      capitalPayment,
      interestCharge: monthlyInterest,
      totalPayment: capitalPayment + monthlyInterest,
      outstandingBalanceEnd: newBalance,
      interestRate: effectiveRate
    });
    
    outstandingBalance = newBalance;
  }
  
  return schedule;
};

/**
 * Calculate total interest over contract life (variable)
 * @param {Object} contract - Contract object
 * @returns {number} Total estimated interest
 */
export const calculateTotalVariableInterest = (contract) => {
  const schedule = calculateVariableInterestSchedule(contract);
  return schedule.reduce((total, month) => total + month.interestCharge, 0);
};

/**
 * Calculate interest outstanding at current point
 * @param {Object} contract - Contract object
 * @param {number} monthsElapsed - Months elapsed since start
 * @returns {number} Estimated interest remaining
 */
export const calculateVariableInterestOutstanding = (contract, monthsElapsed) => {
  const schedule = calculateVariableInterestSchedule(contract);
  
  // Sum interest from remaining months
  return schedule
    .slice(monthsElapsed)
    .reduce((total, month) => total + month.interestCharge, 0);
};

/**
 * Get interest for a specific month
 * @param {Object} contract - Contract object
 * @param {number} monthNumber - Month number (1-based)
 * @returns {Object} Payment details for that month
 */
export const getMonthPaymentDetails = (contract, monthNumber) => {
  const schedule = calculateVariableInterestSchedule(contract);
  return schedule[monthNumber - 1] || null;
};

/**
 * Calculate current outstanding balance (capital only)
 * @param {number} totalCapital - Original capital amount
 * @param {number} monthlyCapitalInstalment - Monthly capital payment
 * @param {number} monthsElapsed - Months paid
 * @returns {number} Remaining capital
 */
export const calculateCapitalOutstanding = (totalCapital, monthlyCapitalInstalment, monthsElapsed) => {
  const capitalPaid = monthlyCapitalInstalment * monthsElapsed;
  return Math.max(0, totalCapital - capitalPaid);
};

/**
 * Format interest rate for display
 * @param {number} baseRate - Base rate (e.g., 5.25)
 * @param {number} margin - Margin (e.g., 3.50)
 * @returns {string} Formatted rate string
 */
export const formatInterestRate = (baseRate, margin) => {
  const total = baseRate + margin;
  return `${total.toFixed(2)}% (Base: ${baseRate.toFixed(2)}% + Margin: ${margin.toFixed(2)}%)`;
};

/**
 * Calculate interest for a specific date range (daily)
 * @param {number} outstandingBalance - Outstanding capital
 * @param {number} annualRate - Annual rate as percentage
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Interest for date range
 */
export const calculateInterestForDateRange = (outstandingBalance, annualRate, startDate, endDate) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((endDate - startDate) / msPerDay);
  
  const dailyInterest = calculateDailyInterest(outstandingBalance, annualRate);
  return dailyInterest * days;
};