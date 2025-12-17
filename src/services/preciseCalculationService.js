// File: src/services/preciseCalculationService.js
// Day-Precise Interest Calculations - FIXED CAPITAL PAYMENT BUG

import { parseISO, differenceInDays, addMonths, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Generate complete payment schedule with EXACT calendar days
 * FIXED TO MATCH HSBC: Uses actual days between payments, not calendar month days
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
    
    // FIXED: Calculate actual days between THIS payment and LAST payment (HSBC method)
    const lastPaymentDate = month === 1 ? startDate : addMonths(startDate, month - 2);
    const currentPaymentDate = monthDate;
    
    // Interest period ends day BEFORE payment date
    const interestPeriodEnd = new Date(currentPaymentDate);
    interestPeriodEnd.setDate(interestPeriodEnd.getDate() - 1);
    
    // Actual days in interest period (not calendar month days)
    const actualDaysInPeriod = differenceInDays(interestPeriodEnd, lastPaymentDate) + 1;
    
    // Calculate interest using the HSBC method (period-based, not calendar month)
    const monthlyInterest = contract.interestType === 'variable'
      ? calculatePreciseMonthInterest(contract, monthDate, month)
      : contract.totalInterest / contract.totalInstalments;
    
    // Check how many vehicles are active AT THE START of this payment month
    let activeVehicles = contract.originalVehicleCount;
    if (contract.vehicles) {
      contract.vehicles.forEach(v => {
        if (v.status === 'settled' && v.settledDate) {
          const settlementDate = parseISO(v.settledDate);
          const paymentDate = monthDate;
          
          // Only reduce count if vehicle was settled BEFORE this payment date
          if (settlementDate < paymentDate) {
            activeVehicles--;
          }
        }
      });
    }
    
    const actualMonthlyCapital = contract.perVehicleCapitalRate * activeVehicles;
    
    schedule.push({
      month,
      monthDate: monthDate.toISOString(),
      monthName: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      daysInMonth: actualDaysInPeriod, // CHANGED: Now shows actual days in interest period
      outstandingBalanceStart: outstandingBalance,
      capitalPayment: actualMonthlyCapital,
      interestPayment: monthlyInterest,
      totalPayment: actualMonthlyCapital + monthlyInterest,
      outstandingBalanceEnd: Math.max(0, outstandingBalance - actualMonthlyCapital),
      activeVehicles,
      interestRate: contract.interestType === 'variable' ? annualRate : null,
      interestPeriodStart: lastPaymentDate.toISOString(), // NEW: Show interest period
      interestPeriodEnd: interestPeriodEnd.toISOString()   // NEW: Show interest period
    });
    
    outstandingBalance = Math.max(0, outstandingBalance - actualMonthlyCapital);
  }
  
  return schedule;
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

/**
 * Calculate exact interest for a specific calendar month with settlements
 * FIXED TO MATCH HSBC: Interest calculated from LAST payment date to CURRENT payment date
 */
export const calculatePreciseMonthInterest = (contract, monthDate, monthNumber = null) => {
  if (contract.interestType !== 'variable') {
    // Fixed interest - simple division
    return contract.totalInterest / contract.totalInstalments;
  }

  const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
  const dailyRate = (annualRate / 100) / 365;
  
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // FIXED: Calculate actual days between payment dates (HSBC method)
  const startDate = parseISO(contract.firstInstalmentDate);
  const monthsSinceStart = monthNumber !== null 
    ? monthNumber - 1 
    : Math.floor((monthDate - startDate) / (30.44 * 24 * 60 * 60 * 1000));
  
  // Last payment date (or contract start for first month)
  const lastPaymentDate = monthsSinceStart === 0 
    ? startDate 
    : addMonths(startDate, monthsSinceStart - 1);
  
  // Current payment date
  const currentPaymentDate = addMonths(startDate, monthsSinceStart);
  
  // HSBC METHOD: Interest period is from last payment to day BEFORE current payment
  const interestPeriodEnd = addMonths(startDate, monthsSinceStart);
  interestPeriodEnd.setDate(interestPeriodEnd.getDate() - 1); // Day before payment
  
  // Actual days in THIS interest period (not calendar month days)
  const actualDaysInPeriod = differenceInDays(interestPeriodEnd, lastPaymentDate) + 1;
  
  // Calculate starting balance for this period
  const monthlyCapitalTotal = contract.totalCapital / contract.totalInstalments;
  const capitalPaidBefore = monthlyCapitalTotal * monthsSinceStart;
  let currentBalance = contract.totalCapital - capitalPaidBefore;
  
  // Find any settlements that happened DURING THIS INTEREST PERIOD
  const settlementsThisPeriod = (contract.vehicles || []).filter(v => {
    if (v.status !== 'settled' || !v.settledDate) return false;
    const settledDate = parseISO(v.settledDate);
    // Settlement must be within the interest period (lastPayment to currentPayment-1)
    return settledDate >= lastPaymentDate && settledDate <= interestPeriodEnd;
  });
  
  // NO SETTLEMENTS IN THIS PERIOD - Simple calculation
  if (settlementsThisPeriod.length === 0) {
    return currentBalance * dailyRate * actualDaysInPeriod;
  }
  
  // HAS SETTLEMENTS - Day-by-day calculation within the interest period
  let totalInterest = 0;
  let periodStartDay = lastPaymentDate;
  
  // Sort settlements by date
  settlementsThisPeriod.sort((a, b) => 
    parseISO(a.settledDate) - parseISO(b.settledDate)
  );
  
  for (const settlement of settlementsThisPeriod) {
    const settlementDate = parseISO(settlement.settledDate);
    
    // Calculate interest from period start to settlement date
    const daysBeforeSettlement = differenceInDays(settlementDate, periodStartDay);
    if (daysBeforeSettlement > 0) {
      const interestBefore = currentBalance * dailyRate * daysBeforeSettlement;
      totalInterest += interestBefore;
    }
    
    // Reduce balance by this vehicle's remaining capital
    const monthsRemainingAtSettlement = contract.totalInstalments - monthsSinceStart;
    const vehicleCapitalRemaining = contract.perVehicleCapitalRate * monthsRemainingAtSettlement;
    currentBalance -= vehicleCapitalRemaining;
    
    periodStartDay = settlementDate;
  }
  
  // Calculate interest for remaining days after last settlement until period end
  const daysAfterLastSettlement = differenceInDays(interestPeriodEnd, periodStartDay) + 1;
  if (daysAfterLastSettlement > 0) {
    const interestAfter = currentBalance * dailyRate * daysAfterLastSettlement;
    totalInterest += interestAfter;
  }
  
  return totalInterest;
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
  let balance = totalCapital;
  
  for (let i = 0; i < totalInstalments; i++) {
    const monthDate = addMonths(startDate, i);
    const days = getDaysInMonth(monthDate);
    const interest = balance * dailyRate * days;
    
    breakdown.push({
      month: i + 1,
      monthName: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      days,
      interest,
      balance
    });
    
    balance -= monthlyCapital;
    if (balance < 0) balance = 0;
  }
  
  return breakdown;
};