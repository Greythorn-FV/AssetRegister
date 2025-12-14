// File: src/utils/interestCalculator.js
// Day-precise interest calculation utility

export const calculateExactInterest = (capital, baseRate, margin, months, startDate) => {
  const annualRate = baseRate + margin;
  const dailyRate = (annualRate / 100) / 365;
  const monthlyCapitalPayment = capital / months;

  let totalInterest = 0;
  let remainingCapital = capital;
  const monthSamples = [];
  const dayCount = { 28: 0, 29: 0, 30: 0, 31: 0 };

  for (let i = 0; i < months; i++) {
    // Get actual month date
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    // Get ACTUAL days in this specific month
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).getDate();

    // Track day distribution
    dayCount[daysInMonth] = (dayCount[daysInMonth] || 0) + 1;

    // Calculate interest for THIS month with ACTUAL days
    const monthlyInterest = remainingCapital * dailyRate * daysInMonth;
    totalInterest += monthlyInterest;

    // Store samples for display (first, middle, last)
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