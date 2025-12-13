import { format, differenceInMonths, addMonths, parseISO, isValid } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'dd/MM/yyyy');
};

export const formatMonthYear = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'MMM yy');
};

export const getMonthsElapsed = (startDate) => {
  if (!startDate) return 0;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  if (!isValid(start)) return 0;
  
  const months = differenceInMonths(new Date(), start);
  return Math.max(0, months);
};

export const getMonthsRemaining = (totalInstalments, startDate) => {
  const elapsed = getMonthsElapsed(startDate);
  return Math.max(0, totalInstalments - elapsed);
};

export const getEndOfMonth = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  return new Date(year, month + 1, 0);
};

export const addMonthsEndOfMonth = (date, months) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const newDate = addMonths(dateObj, months);
  return getEndOfMonth(newDate);
};

export const isActiveInMonth = (startDate, totalInstalments, targetDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  
  if (!isValid(start) || !isValid(target)) return false;
  
  const endDate = addMonths(start, totalInstalments);
  return target >= start && target <= endDate;
};