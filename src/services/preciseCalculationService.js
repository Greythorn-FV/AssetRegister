// File: src/services/preciseCalculationService.js
// Day-Precise Interest Calculations for Variable Interest Contracts

import { parseISO, differenceInDays, addMonths, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Calculate exact interest for a specific calendar month with settlements
 * Uses ACTUAL days in month, not 30-day approximation
 */
export const calculatePreciseMonthInterest = (contract, monthDate, monthNumber = null) => {
  if (contract.interestType !== 'variable') {
    // Fixed interest - simple division
    return contract.totalInterest / contract.totalInstalments;
  }

  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  // Get actual days in this specific month
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInThisMonth = getDaysInMonth(monthDate);
  
  // Calculate starting balance for this month
  const monthsSinceStart = monthNumber !== null 
    ? monthNumber - 1 
    : Math.floor((monthDate - parseISO(contract.firstInstalmentDate)) / (30.44 * 24 * 60 * 60 * 1000));
  
  const monthlyCapitalTotal = contract.totalCapital / contract.totalInstalments;
  const capitalPaidBefore = monthlyCapitalTotal * monthsSinceStart;
  let currentBalance = contract.totalCapital - capitalPaidBefore;
  
  // Find any settlements that happened THIS month
  const settlementsThisMonth = (contract.vehicles || []).filter(v => {
    if (v.status !== 'settled' || !v.settledDate) return false;
    const settledDate = new Date(v.settledDate);
    return settledDate.getMonth() === month && 
           settledDate.getFullYear() === year;
  });
  
  // NO SETTLEMENTS THIS MONTH - Simple calculation
  if (settlementsThisMonth.length === 0) {
    return currentBalance * dailyRate * daysInThisMonth;
  }
  
  // HAS SETTLEMENTS - Day-by-day calculation
  let totalInterest = 0;
  let currentDay = 1;
  
  // Sort settlements by date
  settlementsThisMonth.sort((a, b) => 
    new Date(a.settledDate) - new Date(b.settledDate)
  );
  
  for (const settlement of settlementsThisMonth) {
    const settlementDay = new Date(settlement.settledDate).getDate();
    
    // Calculate interest from currentDay up to (but not including) settlement day
    const daysBefore = settlementDay - currentDay;
    if (daysBefore > 0) {
      const interestBefore = currentBalance * dailyRate * daysBefore;
      totalInterest += interestBefore;
    }
    
    // Reduce balance by this vehicle's remaining capital
    const monthsRemainingAtSettlement = contract.totalInstalments - monthsSinceStart;
    const vehicleCapitalRemaining = contract.perVehicleCapitalRate * monthsRemainingAtSettlement;
    currentBalance -= vehicleCapitalRemaining;
    
    currentDay = settlementDay;
  }
  
  // Calculate interest for remaining days after last settlement
  const daysAfter = daysInThisMonth - currentDay + 1;
  if (daysAfter > 0) {
    const interestAfter = currentBalance * dailyRate * daysAfter;
    totalInterest += interestAfter;
  }
  
  return totalInterest;
};

/**
 * Generate complete payment schedule with EXACT calendar days
 * Returns month-by-month breakdown with actual interest
 */
export const generatePrecisePaymentSchedule = (contract) => {
  if (!contract || !contract.totalInstalments) return [];
  
  const schedule = [];
  const startDate = parseISO(contract.firstInstalmentDate);
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapital = contract.totalCapital / contract.totalInstalments;
  
  let outstandingBalance = contract.totalCapital;
  
  for (let month = 1; month <= contract.totalInstalments; month++) {
    const monthDate = addMonths(startDate, month - 1);
    const daysInMonth = getDaysInMonth(monthDate);
    
    // Calculate interest for THIS specific month with actual days
    const monthlyInterest = contract.interestType === 'variable'
      ? outstandingBalance * dailyRate * daysInMonth
      : contract.totalInterest / contract.totalInstalments;
    
    // Check how many vehicles are active this month
    let activeVehicles = contract.originalVehicleCount;
    if (contract.vehicles) {
      contract.vehicles.forEach(v => {
        if (v.status === 'settled' && v.settledAtMonth < month) {
          activeVehicles--;
        }
      });
    }
    
    const actualMonthlyCapital = contract.perVehicleCapitalRate * activeVehicles;
    
    schedule.push({
      month,
      monthDate: monthDate.toISOString(),
      monthName: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      daysInMonth,
      outstandingBalanceStart: outstandingBalance,
      capitalPayment: actualMonthlyCapital,
      interestPayment: monthlyInterest,
      totalPayment: actualMonthlyCapital + monthlyInterest,
      outstandingBalanceEnd: Math.max(0, outstandingBalance - actualMonthlyCapital),
      activeVehicles,
      interestRate: contract.interestType === 'variable' ? annualRate : null
    });
    
    outstandingBalance = Math.max(0, outstandingBalance - actualMonthlyCapital);
  }
  
  return schedule;
};

/**
 * Calculate EXACT total interest for entire contract
 * Uses actual calendar days for each month
 */
export const calculateExactTotalInterest = (
  totalCapital,
  totalInstalments,
  baseRate,
  margin,
  firstInstalmentDate,
  originalVehicleCount = 1
) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapital = totalCapital / totalInstalments / originalVehicleCount;
  const startDate = typeof firstInstalmentDate === 'string' 
    ? parseISO(firstInstalmentDate) 
    : firstInstalmentDate;
  
  let totalInterest = 0;
  let outstandingBalance = totalCapital;
  
  for (let month = 0; month < totalInstalments; month++) {
    const monthDate = addMonths(startDate, month);
    const daysInThisMonth = getDaysInMonth(monthDate);
    
    // Interest for this specific month with ACTUAL days
    const monthInterest = outstandingBalance * dailyRate * daysInThisMonth;
    totalInterest += monthInterest;
    
    // Reduce balance
    const monthlyCapitalTotal = monthlyCapital * originalVehicleCount;
    outstandingBalance -= monthlyCapitalTotal;
    if (outstandingBalance < 0) outstandingBalance = 0;
  }
  
  return totalInterest;
};

/**
 * Get breakdown by month for preview display
 */
export const getMonthlyInterestBreakdown = (
  totalCapital,
  totalInstalments,
  baseRate,
  margin,
  firstInstalmentDate
) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapital = totalCapital / totalInstalments;
  const startDate = typeof firstInstalmentDate === 'string' 
    ? parseISO(firstInstalmentDate) 
    : firstInstalmentDate;
  
  const breakdown = [];
  let outstandingBalance = totalCapital;
  
  // Show first month, middle month, and last month
  const monthsToShow = [0, Math.floor(totalInstalments / 2), totalInstalments - 1];
  
  for (let month = 0; month < totalInstalments; month++) {
    const monthDate = addMonths(startDate, month);
    const daysInMonth = getDaysInMonth(monthDate);
    const monthInterest = outstandingBalance * dailyRate * daysInMonth;
    
    if (monthsToShow.includes(month)) {
      breakdown.push({
        monthNumber: month + 1,
        monthName: monthDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        daysInMonth,
        balance: outstandingBalance,
        interest: monthInterest
      });
    }
    
    outstandingBalance -= monthlyCapital;
    if (outstandingBalance < 0) outstandingBalance = 0;
  }
  
  return breakdown;
};

/**
 * Calculate interest outstanding with day-precision
 * Accounts for settlements and actual calendar days
 */
export const calculatePreciseInterestOutstanding = (contract) => {
  if (contract.interestType !== 'variable') {
    const monthsElapsed = Math.floor(
      (new Date() - parseISO(contract.firstInstalmentDate)) / (30.44 * 24 * 60 * 60 * 1000)
    );
    const monthsRemaining = Math.max(0, contract.totalInstalments - monthsElapsed);
    const monthlyInterest = contract.totalInterest / contract.totalInstalments;
    return monthlyInterest * monthsRemaining;
  }
  
  // Variable interest - calculate remaining months with actual days
  const startDate = parseISO(contract.firstInstalmentDate);
  const today = new Date();
  const monthsElapsed = Math.floor(
    (today - startDate) / (30.44 * 24 * 60 * 60 * 1000)
  );
  const monthsRemaining = Math.max(0, contract.totalInstalments - monthsElapsed);
  
  let totalInterestRemaining = 0;
  
  for (let i = 0; i < monthsRemaining; i++) {
    const monthDate = addMonths(startDate, monthsElapsed + i);
    const monthInterest = calculatePreciseMonthInterest(contract, monthDate, monthsElapsed + i + 1);
    totalInterestRemaining += monthInterest;
  }
  
  return totalInterestRemaining;
};

/**
 * Calculate current month's interest (including partial settlements)
 */
export const getCurrentMonthInterest = (contract) => {
  const today = new Date();
  return calculatePreciseMonthInterest(contract, today);
};

/**
 * Calculate interest for a specific date range (for custom reports)
 */
export const calculateInterestForDateRange = (contract, startDate, endDate) => {
  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const days = differenceInDays(end, start);
  
  // Get balance at start date
  const contractStart = parseISO(contract.firstInstalmentDate);
  const monthsElapsed = Math.floor((start - contractStart) / (30.44 * 24 * 60 * 60 * 1000));
  const monthlyCapitalTotal = contract.totalCapital / contract.totalInstalments;
  const capitalPaid = monthlyCapitalTotal * monthsElapsed;
  const balance = contract.totalCapital - capitalPaid;
  
  return balance * dailyRate * days;
};

/**
 * Validate contract dates and return insights
 */
export const analyzeContractDates = (firstInstalmentDate, totalInstalments) => {
  const startDate = typeof firstInstalmentDate === 'string' 
    ? parseISO(firstInstalmentDate) 
    : firstInstalmentDate;
  
  const endDate = addMonths(startDate, totalInstalments);
  
  // Count how many 28, 29, 30, and 31-day months
  const dayDistribution = { 28: 0, 29: 0, 30: 0, 31: 0 };
  
  for (let i = 0; i < totalInstalments; i++) {
    const monthDate = addMonths(startDate, i);
    const days = getDaysInMonth(monthDate);
    dayDistribution[days] = (dayDistribution[days] || 0) + 1;
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalInstalments,
    dayDistribution,
    hasFebruary: dayDistribution[28] > 0 || dayDistribution[29] > 0,
    totalDays: Array.from({ length: totalInstalments }, (_, i) => 
      getDaysInMonth(addMonths(startDate, i))
    ).reduce((sum, days) => sum + days, 0)
  };
};