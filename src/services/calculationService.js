import { getMonthsElapsed, getMonthsRemaining } from '../utils/dateHelpers.js';

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
 * Calculate monthly interest based on interest type
 */
export const calculateMonthlyInterest = (contract, outstandingCapital = null) => {
  if (contract.interestType === 'variable') {
    // Variable interest: calculated daily on outstanding balance
    const capital = outstandingCapital || contract.totalCapital;
    const annualRate = contract.interestRateAnnual || (contract.baseRate + contract.margin);
    const dailyRate = (annualRate / 100) / 365;
    return capital * dailyRate * 30; // Approximate for 30 days
  } else {
    // Fixed interest: total divided by instalments
    return contract.totalInterest / contract.totalInstalments;
  }
};

/**
 * Calculate total interest outstanding (estimated for variable)
 */
export const calculateInterestOutstanding = (contract, monthsRemaining, capitalOutstanding) => {
  if (contract.interestType === 'variable') {
    // For variable interest, estimate based on declining balance
    // This is an approximation - actual will vary with payments
    let totalInterest = 0;
    let remainingCapital = capitalOutstanding;
    const monthlyCapital = contract.currentMonthlyCapital;
    
    for (let i = 0; i < monthsRemaining; i++) {
      const monthInterest = calculateMonthlyInterest(contract, remainingCapital);
      totalInterest += monthInterest;
      remainingCapital -= monthlyCapital;
      if (remainingCapital < 0) remainingCapital = 0;
    }
    
    return totalInterest;
  } else {
    // Fixed interest
    const monthlyInterest = contract.totalInterest / contract.totalInstalments;
    return monthlyInterest * monthsRemaining;
  }
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (monthsElapsed, totalInstalments) => {
  if (!totalInstalments || totalInstalments === 0) return 0;
  return Math.min(100, (monthsElapsed / totalInstalments) * 100);
};

/**
 * Calculate all contract metrics at once
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
  
  // Calculate current outstanding capital for interest calculation
  const capitalPaid = (contract.totalCapital / contract.totalInstalments) * monthsElapsed;
  const currentOutstandingCapital = Math.max(0, contract.totalCapital - capitalPaid);
  
  const monthlyInterest = calculateMonthlyInterest(contract, currentOutstandingCapital);
  
  const interestOutstanding = calculateInterestOutstanding(
    contract,
    monthsRemaining,
    capitalOutstanding
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
 * Get detailed payment schedule for a contract (especially useful for variable interest)
 */
export const getPaymentSchedule = (contract) => {
  const schedule = [];
  let outstandingCapital = contract.totalCapital;
  const monthlyCapitalPayment = contract.totalCapital / contract.totalInstalments;
  
  for (let month = 1; month <= contract.totalInstalments; month++) {
    const monthlyInterest = calculateMonthlyInterest(contract, outstandingCapital);
    
    schedule.push({
      month,
      outstandingCapitalStart: outstandingCapital,
      capitalPayment: monthlyCapitalPayment,
      interestPayment: monthlyInterest,
      totalPayment: monthlyCapitalPayment + monthlyInterest,
      outstandingCapitalEnd: Math.max(0, outstandingCapital - monthlyCapitalPayment),
      interestRate: contract.interestType === 'variable' 
        ? (contract.interestRateAnnual || (contract.baseRate + contract.margin))
        : null
    });
    
    outstandingCapital -= monthlyCapitalPayment;
    if (outstandingCapital < 0) outstandingCapital = 0;
  }
  
  return schedule;
};