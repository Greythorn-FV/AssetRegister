// File: src/services/calculationService.js
// FIXED - Correct capital outstanding and monthly instalment calculations

import { getMonthsElapsed, getMonthsRemaining } from '../utils/dateHelpers.js';
import { parseISO, addMonths, getDaysInMonth } from 'date-fns';

/**
 * Calculate per-vehicle capital rate
 * Total Capital ÷ Instalments ÷ Vehicle Count
 */
export const calculatePerVehicleRate = (totalCapital, totalInstalments, vehicleCount) => {
  if (!vehicleCount || vehicleCount === 0) return 0;
  return totalCapital / totalInstalments / vehicleCount;
};

/**
 * Calculate monthly capital instalment (TOTAL for contract)
 * Total Capital ÷ Instalments
 */
export const calculateMonthlyCapitalInstalment = (totalCapital, totalInstalments) => {
  if (!totalInstalments || totalInstalments === 0) return 0;
  return totalCapital / totalInstalments;
};

/**
 * Calculate current monthly capital based on active vehicles
 * Per Vehicle Rate × Active Vehicle Count
 */
export const calculateCurrentMonthlyCapital = (perVehicleRate, activeVehicleCount) => {
  return perVehicleRate * activeVehicleCount;
};

/**
 * Calculate capital outstanding for a specific vehicle
 */
export const calculateVehicleCapitalOutstanding = (perVehicleRate, monthsRemaining) => {
  return perVehicleRate * monthsRemaining;
};

/**
 * Calculate total capital outstanding for a contract
 * Monthly Capital Instalment × Months Remaining
 */
export const calculateContractCapitalOutstanding = (monthlyCapitalInstalment, monthsRemaining) => {
  return monthlyCapitalInstalment * monthsRemaining;
};

/**
 * Calculate monthly interest with DAY PRECISION
 */
export const calculateMonthlyInterest = (contract, monthDate = new Date(), outstandingCapital = null) => {
  if (contract.interestType === 'fixed') {
    return contract.totalInterest / contract.totalInstalments;
  }
  
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  const daysInThisMonth = getDaysInMonth(monthDate);
  
  const capital = outstandingCapital !== null 
    ? outstandingCapital 
    : contract.totalCapital;
  
  return capital * dailyRate * daysInThisMonth;
};

/**
 * Calculate interest outstanding
 */
export const calculateInterestOutstanding = (contract, monthsRemaining) => {
  if (contract.interestType === 'fixed') {
    const monthlyInterest = contract.totalInterest / contract.totalInstalments;
    return monthlyInterest * monthsRemaining;
  }
  
  // Variable - estimate based on current balance
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  const avgDaysPerMonth = 30.44;
  
  // Calculate remaining interest based on declining balance
  const monthlyCapital = contract.totalCapital / contract.totalInstalments;
  let totalInterest = 0;
  let balance = monthlyCapital * monthsRemaining; // Current outstanding
  
  for (let i = 0; i < monthsRemaining; i++) {
    totalInterest += balance * dailyRate * avgDaysPerMonth;
    balance -= monthlyCapital;
  }
  
  return totalInterest;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (monthsElapsed, totalInstalments) => {
  if (!totalInstalments || totalInstalments === 0) return 0;
  return Math.min(100, (monthsElapsed / totalInstalments) * 100);
};

/**
 * Calculate all contract metrics at once (FIXED VERSION)
 */
export const calculateContractMetrics = (contract) => {
  const monthsElapsed = getMonthsElapsed(contract.firstInstalmentDate);
  const monthsRemaining = getMonthsRemaining(contract.totalInstalments, contract.firstInstalmentDate);
  
  // Per vehicle rate
  const perVehicleRate = calculatePerVehicleRate(
    contract.totalCapital,
    contract.totalInstalments,
    contract.originalVehicleCount
  );
  
  // Monthly capital instalment (TOTAL for contract - what you pay each month)
  const monthlyCapitalInstalment = calculateMonthlyCapitalInstalment(
    contract.totalCapital,
    contract.totalInstalments
  );
  
  // Current monthly capital (adjusted for settled vehicles)
  const currentMonthlyCapital = calculateCurrentMonthlyCapital(
    perVehicleRate,
    contract.activeVehiclesCount
  );
  
  // FIXED: Capital outstanding uses MONTHLY INSTALMENT, not per-vehicle
  const capitalOutstanding = calculateContractCapitalOutstanding(
    monthlyCapitalInstalment,  // FIXED: Use total monthly, not current
    monthsRemaining
  );
  
  // Calculate current month's interest
  const today = new Date();
  const monthlyInterest = calculateMonthlyInterest(contract, today, capitalOutstanding);
  
  // Calculate remaining interest
  const interestOutstanding = calculateInterestOutstanding(contract, monthsRemaining);
  
  const progress = calculateProgress(monthsElapsed, contract.totalInstalments);
  
  return {
    monthsElapsed,
    monthsRemaining,
    perVehicleRate,
    monthlyCapitalInstalment,  // NEW: Total monthly instalment
    currentMonthlyCapital,     // Adjusted for active vehicles
    capitalOutstanding,        // FIXED: Now uses correct calculation
    monthlyInterest,
    interestOutstanding,
    progress,
    interestType: contract.interestType || 'fixed',
    effectiveRate: contract.interestType === 'variable' 
      ? (contract.interestRateAnnual || (contract.baseRate + contract.margin))
      : null
  };
};

/**
 * Calculate portfolio-wide totals
 */
export const calculatePortfolioStats = (contracts) => {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const settledContracts = contracts.filter(c => c.status === 'settled');
  
  let totalCapitalOutstanding = 0;
  let totalInterestOutstanding = 0;
  let nextMonthCapitalDue = 0;
  let totalActiveVehicles = 0;
  
  activeContracts.forEach(contract => {
    const metrics = calculateContractMetrics(contract);
    totalCapitalOutstanding += metrics.capitalOutstanding;
    totalInterestOutstanding += metrics.interestOutstanding;
    nextMonthCapitalDue += metrics.monthlyCapitalInstalment; // Use total monthly
    totalActiveVehicles += contract.activeVehiclesCount;
  });
  
  return {
    totalActiveContracts: activeContracts.length,
    totalSettledContracts: settledContracts.length,
    totalCapitalOutstanding,
    totalInterestOutstanding,
    nextMonthCapitalDue,
    totalActiveVehicles,
    totalSettledVehicles: settledContracts.reduce((sum, c) => sum + c.originalVehicleCount, 0)
  };
};

/**
 * Get detailed payment schedule
 */
export const getPaymentSchedule = (contract) => {
  const schedule = [];
  const startDate = parseISO(contract.firstInstalmentDate);
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  let outstandingCapital = contract.totalCapital;
  const monthlyCapitalInstalment = contract.totalCapital / contract.totalInstalments;
  
  for (let month = 1; month <= contract.totalInstalments; month++) {
    const monthDate = addMonths(startDate, month - 1);
    const daysInMonth = getDaysInMonth(monthDate);
    
    const monthlyInterest = contract.interestType === 'variable'
      ? outstandingCapital * dailyRate * daysInMonth
      : contract.totalInterest / contract.totalInstalments;
    
    // Determine active vehicles this month
    let activeVehicles = contract.originalVehicleCount;
    if (contract.vehicles) {
      contract.vehicles.forEach(v => {
        if (v.status === 'settled' && v.settledAtMonth < month) {
          activeVehicles--;
        }
      });
    }
    
    const monthlyCapital = contract.perVehicleCapitalRate * activeVehicles;
    
    schedule.push({
      month,
      monthDate: monthDate.toISOString(),
      monthName: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      daysInMonth,
      outstandingCapitalStart: outstandingCapital,
      capitalPayment: monthlyCapital,
      interestPayment: monthlyInterest,
      totalPayment: monthlyCapital + monthlyInterest,
      outstandingCapitalEnd: Math.max(0, outstandingCapital - monthlyCapital),
      activeVehicles,
      interestRate: contract.interestType === 'variable' ? annualRate : null
    });
    
    outstandingCapital = Math.max(0, outstandingCapital - monthlyCapital);
  }
  
  return schedule;
};