// File: src/hooks/usePaymentCalendar.js
// Calculate daily payment totals across all contracts

import { useState, useEffect } from 'react';
import { parseISO, addMonths, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const usePaymentCalendar = (contracts, currentMonth) => {
  const [dailyPayments, setDailyPayments] = useState(new Map());
  const [calendarDays, setCalendarDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contracts && currentMonth) {
      calculateDailyPayments();
    }
  }, [contracts, currentMonth]);

  const calculateDailyPayments = () => {
    setLoading(true);

    // Get all days in the current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a map to store payments per day
    const paymentsMap = new Map();

    // Initialize all days with zero
    daysInMonth.forEach(day => {
      paymentsMap.set(format(day, 'yyyy-MM-dd'), {
        date: day,
        contracts: [],
        totalCapital: 0,
        totalInterest: 0,
        totalPayment: 0,
        count: 0
      });
    });

    // Calculate payments for each contract
    contracts.forEach(contract => {
      if (contract.status !== 'active') return;

      const startDate = parseISO(contract.firstInstalmentDate);
      const conclusionDate = addMonths(startDate, contract.totalInstalments);

      // Check if contract has payments in this month
      if (conclusionDate < monthStart || startDate > monthEnd) return;

      // Calculate which instalment day this contract pays on
      const instalmentDay = startDate.getDate();

      // Find the matching day in the current month
      daysInMonth.forEach(day => {
        if (day.getDate() === instalmentDay) {
          // Check if this payment date is within contract period
          const monthsFromStart = Math.floor(
            (day - startDate) / (30.44 * 24 * 60 * 60 * 1000)
          );

          if (monthsFromStart >= 0 && monthsFromStart < contract.totalInstalments) {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayData = paymentsMap.get(dayKey);

            // Calculate payment for this contract
            const capitalPayment = contract.currentMonthlyCapital || 0;
            const interestPayment = calculateInterestForContract(contract);

            dayData.contracts.push({
              contractNumber: contract.contractNumber,
              capitalPayment,
              interestPayment,
              totalPayment: capitalPayment + interestPayment,
              interestType: contract.interestType
            });

            dayData.totalCapital += capitalPayment;
            dayData.totalInterest += interestPayment;
            dayData.totalPayment += (capitalPayment + interestPayment);
            dayData.count++;

            paymentsMap.set(dayKey, dayData);
          }
        }
      });
    });

    setDailyPayments(paymentsMap);
    setCalendarDays(daysInMonth);
    setLoading(false);
  };

  const calculateInterestForContract = (contract) => {
    if (contract.interestType === 'fixed') {
      return (contract.totalInterest || 0) / contract.totalInstalments;
    } else {
      // Variable interest - use current monthly interest
      return contract.monthlyInterest || 0;
    }
  };

  const getPaymentForDay = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    return dailyPayments.get(key) || {
      date,
      contracts: [],
      totalCapital: 0,
      totalInterest: 0,
      totalPayment: 0,
      count: 0
    };
  };

  const getMonthTotal = () => {
    let total = 0;
    dailyPayments.forEach(day => {
      total += day.totalPayment;
    });
    return total;
  };

  const getMonthCapitalTotal = () => {
    let total = 0;
    dailyPayments.forEach(day => {
      total += day.totalCapital;
    });
    return total;
  };

  const getMonthInterestTotal = () => {
    let total = 0;
    dailyPayments.forEach(day => {
      total += day.totalInterest;
    });
    return total;
  };

  const getBusiestDay = () => {
    let maxCount = 0;
    let busiestDay = null;

    dailyPayments.forEach((day, key) => {
      if (day.count > maxCount) {
        maxCount = day.count;
        busiestDay = day;
      }
    });

    return busiestDay;
  };

  const getHighestPaymentDay = () => {
    let maxAmount = 0;
    let highestDay = null;

    dailyPayments.forEach((day, key) => {
      if (day.totalPayment > maxAmount) {
        maxAmount = day.totalPayment;
        highestDay = day;
      }
    });

    return highestDay;
  };

  return {
    dailyPayments,
    calendarDays,
    loading,
    getPaymentForDay,
    getMonthTotal,
    getMonthCapitalTotal,
    getMonthInterestTotal,
    getBusiestDay,
    getHighestPaymentDay
  };
};