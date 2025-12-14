// File: src/hooks/useMaturityReports.js
// Business logic for maturity reports - PERFECT SEPARATION OF CONCERNS

import { useState, useEffect } from 'react';
import { addMonths, parseISO, differenceInDays } from 'date-fns';

export const useMaturityReports = (contracts) => {
  const [maturityReports, setMaturityReports] = useState({
    next30Days: [],
    next60Days: [],
    next90Days: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contracts && contracts.length > 0) {
      calculateMaturityReports();
    } else {
      setLoading(false);
    }
  }, [contracts]);

  const calculateMaturityReports = () => {
    setLoading(true);

    const today = new Date();
    const in30Days = addMonths(today, 1);
    const in60Days = addMonths(today, 2);
    const in90Days = addMonths(today, 3);

    const next30 = [];
    const next60 = [];
    const next90 = [];

    contracts.forEach(contract => {
      if (contract.status !== 'active') return;

      const startDate = parseISO(contract.firstInstalmentDate);
      const conclusionDate = addMonths(startDate, contract.totalInstalments);
      const daysUntilConclusion = differenceInDays(conclusionDate, today);

      // Skip if already concluded
      if (daysUntilConclusion < 0) return;

      const contractData = {
        id: contract.id,
        contractNumber: contract.contractNumber,
        conclusionDate: conclusionDate,
        daysUntilConclusion: daysUntilConclusion,
        activeVehicles: contract.activeVehiclesCount || 0,
        totalVehicles: contract.originalVehicleCount || 0,
        monthlyCapital: contract.currentMonthlyCapital || 0,
        interestType: contract.interestType,
        capitalOutstanding: calculateOutstanding(contract, today),
        vehicles: contract.vehicles || []
      };

      if (conclusionDate <= in30Days) {
        next30.push(contractData);
      } else if (conclusionDate <= in60Days) {
        next60.push(contractData);
      } else if (conclusionDate <= in90Days) {
        next90.push(contractData);
      }
    });

    // Sort by conclusion date (soonest first)
    next30.sort((a, b) => a.daysUntilConclusion - b.daysUntilConclusion);
    next60.sort((a, b) => a.daysUntilConclusion - b.daysUntilConclusion);
    next90.sort((a, b) => a.daysUntilConclusion - b.daysUntilConclusion);

    setMaturityReports({
      next30Days: next30,
      next60Days: next60,
      next90Days: next90
    });

    setLoading(false);
  };

  const calculateOutstanding = (contract, today) => {
    const startDate = parseISO(contract.firstInstalmentDate);
    const monthsElapsed = Math.floor(
      (today - startDate) / (30.44 * 24 * 60 * 60 * 1000)
    );
    const monthsRemaining = Math.max(0, contract.totalInstalments - monthsElapsed);
    return contract.currentMonthlyCapital * monthsRemaining;
  };

  const getTotalCapital = (contracts) => {
    return contracts.reduce((sum, c) => sum + c.capitalOutstanding, 0);
  };

  const getTotalVehicles = (contracts) => {
    return contracts.reduce((sum, c) => sum + c.activeVehicles, 0);
  };

  const getTotalContracts = () => {
    return maturityReports.next30Days.length + 
           maturityReports.next60Days.length + 
           maturityReports.next90Days.length;
  };

  const getTotalCapitalAllPeriods = () => {
    return getTotalCapital(maturityReports.next30Days) +
           getTotalCapital(maturityReports.next60Days) +
           getTotalCapital(maturityReports.next90Days);
  };

  return {
    maturityReports,
    loading,
    getTotalCapital,
    getTotalVehicles,
    getTotalContracts,
    getTotalCapitalAllPeriods
  };
};