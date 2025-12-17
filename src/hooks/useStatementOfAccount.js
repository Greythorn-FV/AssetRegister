// File: src/hooks/useStatementOfAccount.js
// Hook for generating statement of account transactions

import { useMemo } from 'react';
import { parseISO, addMonths, format } from 'date-fns';
import { generatePrecisePaymentSchedule } from '../services/preciseCalculationService.js';

export const useStatementOfAccount = (contract) => {
  
  const transactions = useMemo(() => {
    if (!contract) return [];
    
    const txns = [];
    let runningBalance = contract.totalCapital;
    
    // 1. Opening Balance
    txns.push({
      id: 'opening',
      date: parseISO(contract.firstInstalmentDate),
      type: 'OPENING',
      description: 'Contract Opening Balance',
      debit: 0,
      credit: 0,
      balance: runningBalance,
      metadata: {}
    });
    
    // 2. Generate payment schedule
    const schedule = generatePrecisePaymentSchedule(contract);
    
    // Track if contract becomes fully settled
    let contractFullySettled = false;
    let finalSettlementDate = null;
    
    schedule.forEach((month, index) => {
      const monthDate = parseISO(month.monthDate);
      
      // Skip this month if contract was already fully settled in a previous month
      if (contractFullySettled && monthDate > finalSettlementDate) {
        return; // Don't add any more transactions
      }
      
      // FIXED: Add capital payment FIRST (happens on 1st of month)
      if (month.capitalPayment > 0) {
        runningBalance -= month.capitalPayment; // Update balance first
        
        txns.push({
          id: `capital-${index + 1}`,
          date: monthDate,
          type: 'CAPITAL_PAYMENT',
          description: `Monthly Capital Payment - ${month.monthName}`,
          debit: month.capitalPayment,
          credit: 0,
          balance: runningBalance, // Use updated balance
          metadata: {
            month: index + 1,
            activeVehicles: month.activeVehicles
          }
        });
      }
      
      // Check for settlements in this month (happen mid-month AFTER capital payment)
      const settlementsThisMonth = (contract.vehicles || []).filter(v => {
        if (v.status !== 'settled' || !v.settledDate) return false;
        const settledDate = parseISO(v.settledDate);
        return settledDate.getMonth() === monthDate.getMonth() && 
               settledDate.getFullYear() === monthDate.getFullYear();
      });
      
      // Add settlements (chronologically they happen mid-month AFTER capital payment)
      settlementsThisMonth.forEach(vehicle => {
        const settlementDate = parseISO(vehicle.settledDate);
        const vehicleCapital = contract.perVehicleCapitalRate * (contract.totalInstalments - index);
        
        runningBalance -= vehicleCapital; // Update balance first
        
        txns.push({
          id: `settlement-${vehicle.registration}-${vehicle.settledDate}`,
          date: settlementDate,
          type: 'SETTLEMENT',
          description: `Early Settlement - ${vehicle.registration}`,
          debit: vehicleCapital,
          credit: 0,
          balance: runningBalance, // Use updated balance
          metadata: {
            registration: vehicle.registration,
            vehicleCapital
          }
        });
      });
      
      // Check if contract is now fully settled (all vehicles settled)
      const allVehiclesSettled = contract.vehicles.every(v => v.status === 'settled');
      if (allVehiclesSettled && settlementsThisMonth.length > 0) {
        contractFullySettled = true;
        finalSettlementDate = parseISO(settlementsThisMonth[settlementsThisMonth.length - 1].settledDate);
        // Don't add any more capital or interest payments - contract is closed
        return;
      }
      
      // Only add interest charge if contract is not fully settled
      if (!contractFullySettled && month.interestPayment > 0) {
        txns.push({
          id: `interest-${index + 1}`,
          date: monthDate,
          type: 'INTEREST_CHARGE',
          description: `Interest Charge - ${month.monthName} (${month.daysInMonth} days)`,
          debit: month.interestPayment,
          credit: 0,
          balance: runningBalance, // Balance stays same (interest is a cost, not capital)
          metadata: {
            month: index + 1,
            daysInMonth: month.daysInMonth,
            interestRate: month.interestRate
          }
        });
      }
    });
    
    // Sort all transactions by date, then by type priority
    // Priority: Opening → Capital → Settlement → Interest
    const typePriority = {
      'OPENING': 0,
      'CAPITAL_PAYMENT': 1,
      'SETTLEMENT': 2,
      'INTEREST_CHARGE': 3
    };
    
    return txns.sort((a, b) => {
      // First sort by date
      const dateCompare = a.date - b.date;
      if (dateCompare !== 0) return dateCompare;
      
      // If same date, sort by type priority
      return typePriority[a.type] - typePriority[b.type];
    });
  }, [contract]);
  
  // Calculate summary stats
  const summary = useMemo(() => {
    if (transactions.length === 0) return null;
    
    const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCapitalPaid = transactions
      .filter(t => t.type === 'CAPITAL_PAYMENT' || t.type === 'SETTLEMENT')
      .reduce((sum, t) => sum + t.debit, 0);
    const totalInterestPaid = transactions
      .filter(t => t.type === 'INTEREST_CHARGE')
      .reduce((sum, t) => sum + t.debit, 0);
    
    return {
      totalDebits,
      totalCapitalPaid,
      totalInterestPaid,
      transactionCount: transactions.length - 1 // Exclude opening
    };
  }, [transactions]);
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = transactions.map(t => [
      format(t.date, 'dd/MM/yyyy'),
      t.type,
      t.description,
      t.debit > 0 ? t.debit.toFixed(2) : '',
      t.credit > 0 ? t.credit.toFixed(2) : '',
      t.balance.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${contract.contractNumber}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return {
    transactions,
    summary,
    exportToCSV
  };
};