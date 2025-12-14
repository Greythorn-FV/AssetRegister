// File: src/services/calculationService.js
// UPDATED with precise day-accurate calculations

import { getMonthsElapsed, getMonthsRemaining } from '../utils/dateHelpers.js';
import { parseISO, addMonths, getDaysInMonth } from 'date-fns';

/**
 * Calculate per-vehicle capital rate
 */
export const calculatePerVehicleRate = (totalCapital, totalInstalments, vehicleCount) => {
  if (!vehicleCount || vehicleCount === 0) return 0;
  return totalCapital / totalInstalments / vehicleCount;
};

/**
 * Calculate current monthly capital instalment based on active vehicles
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
 */
export const calculateContractCapitalOutstanding = (currentMonthlyCapital, monthsRemaining) => {
  return currentMonthlyCapital * monthsRemaining;
};

/**
 * Calculate monthly interest with DAY PRECISION
 * Handles mid-month settlements and actual calendar days
 */
export const calculateMonthlyInterest = (contract, monthDate = new Date(), outstandingCapital = null) => {
  if (contract.interestType === 'fixed') {
    // Fixed interest: total divided by instalments
    return contract.totalInterest / contract.totalInstalments;
  }
  
  // Variable interest with day precision
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  // Get actual days in this specific month
  const daysInThisMonth = getDaysInMonth(monthDate);
  
  // Use provided capital or calculate current balance
  const capital = outstandingCapital !== null 
    ? outstandingCapital 
    : calculateCurrentBalance(contract, monthDate);
  
  // Check for settlements THIS month
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  const settlementsThisMonth = (contract.vehicles || []).filter(v => {
    if (v.status !== 'settled' || !v.settledDate) return false;
    const settledDate = new Date(v.settledDate);
    return settledDate.getMonth() === month && 
           settledDate.getFullYear() === year;
  });
  
  // NO settlements this month - simple calculation
  if (settlementsThisMonth.length === 0) {
    return capital * dailyRate * daysInThisMonth;
  }
  
  // HAS settlements - day-by-day split calculation
  let totalInterest = 0;
  let currentBalance = capital;
  let currentDay = 1;
  
  // Sort by settlement date
  settlementsThisMonth.sort((a, b) => 
    new Date(a.settledDate) - new Date(b.settledDate)
  );
  
  for (const settlement of settlementsThisMonth) {
    const settlementDay = new Date(settlement.settledDate).getDate();
    
    // Interest before settlement
    const daysBefore = settlementDay - currentDay;
    if (daysBefore > 0) {
      totalInterest += currentBalance * dailyRate * daysBefore;
    }
    
    // Reduce balance
    const monthsRemaining = getMonthsRemaining(
      contract.totalInstalments,
      contract.firstInstalmentDate
    );
    const vehicleCapitalRemaining = contract.perVehicleCapitalRate * monthsRemaining;
    currentBalance -= vehicleCapitalRemaining;
    
    currentDay = settlementDay;
  }
  
  // Interest after last settlement
  const daysAfter = daysInThisMonth - currentDay + 1;
  if (daysAfter > 0) {
    totalInterest += currentBalance * dailyRate * daysAfter;
  }
  
  return totalInterest;
};

/**
 * Calculate current balance at a specific date
 */
const calculateCurrentBalance = (contract, date = new Date()) => {
  const startDate = parseISO(contract.firstInstalmentDate);
  const monthsElapsed = Math.floor(
    (date - startDate) / (30.44 * 24 * 60 * 60 * 1000)
  );
  
  const monthlyCapitalTotal = contract.totalCapital / contract.totalInstalments;
  const capitalPaid = monthlyCapitalTotal * monthsElapsed;
  return Math.max(0, contract.totalCapital - capitalPaid);
};

/**
 * Calculate total interest outstanding (PRECISE - uses real calendar days)
 */
export const calculateInterestOutstanding = (contract, monthsRemaining) => {
  if (contract.interestType === 'fixed') {
    // Fixed interest
    const monthlyInterest = contract.totalInterest / contract.totalInstalments;
    return monthlyInterest * monthsRemaining;
  }
  
  // Variable interest - calculate each remaining month with actual days
  const startDate = parseISO(contract.firstInstalmentDate);
  const today = new Date();
  const monthsElapsed = Math.floor(
    (today - startDate) / (30.44 * 24 * 60 * 60 * 1000)
  );
  
  let totalInterestRemaining = 0;
  
  for (let i = 0; i < monthsRemaining; i++) {
    const monthDate = addMonths(startDate, monthsElapsed + i);
    const monthInterest = calculateMonthlyInterest(contract, monthDate);
    totalInterestRemaining += monthInterest;
  }
  
  return totalInterestRemaining;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (monthsElapsed, totalInstalments) => {
  if (!totalInstalments || totalInstalments === 0) return 0;
  return Math.min(100, (monthsElapsed / totalInstalments) * 100);
};

/**
 * Calculate all contract metrics at once (UPDATED with precise calculations)
 */
export const calculateContractMetrics = (contract) => {
  const monthsElapsed = getMonthsElapsed(contract.firstInstalmentDate);
  const monthsRemaining = getMonthsRemaining(contract.totalInstalments, contract.firstInstalmentDate);
  
  const perVehicleRate = calculatePerVehicleRate(
    contract.totalCapital,
    contract.totalInstalments,
    contract.originalVehicleCount
  );
  
  const currentMonthlyCapital = calculateCurrentMonthlyCapital(
    perVehicleRate,
    contract.activeVehiclesCount
  );
  
  const capitalOutstanding = calculateContractCapitalOutstanding(
    currentMonthlyCapital,
    monthsRemaining
  );
  
  // Calculate current month's interest with day precision
  const today = new Date();
  const monthlyInterest = calculateMonthlyInterest(contract, today);
  
  // Calculate remaining interest with precise calendar days
  const interestOutstanding = calculateInterestOutstanding(
    contract,
    monthsRemaining
  );
  
  const progress = calculateProgress(monthsElapsed, contract.totalInstalments);
  
  return {
    monthsElapsed,
    monthsRemaining,
    perVehicleRate,
    currentMonthlyCapital,
    capitalOutstanding,
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
    nextMonthCapitalDue += metrics.currentMonthlyCapital;
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
 * Get detailed payment schedule with EXACT calendar days
 */
export const getPaymentSchedule = (contract) => {
  const schedule = [];
  const startDate = parseISO(contract.firstInstalmentDate);
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  let outstandingCapital = contract.totalCapital;
  
  for (let month = 1; month <= contract.totalInstalments; month++) {
    const monthDate = addMonths(startDate, month - 1);
    const daysInMonth = getDaysInMonth(monthDate);
    
    // Calculate interest with ACTUAL days in this month
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
      interestRate: contract.interestType === 'variable' 
        ? annualRate
        : null
    });
    
    outstandingCapital = Math.max(0, outstandingCapital - monthlyCapital);
  }
  
  return schedule;
};