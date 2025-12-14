// File: src/components/PaymentCalendar.jsx
// COMPACT & PROFESSIONAL - Visual calendar showing daily payment totals

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { usePaymentCalendar } from '../hooks/usePaymentCalendar.js';
import { formatCurrency } from '../utils/currencyHelpers.js';

const PaymentCalendar = ({ contracts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    calendarDays,
    loading,
    getPaymentForDay,
    getMonthTotal,
    getMonthCapitalTotal,
    getMonthInterestTotal,
    getBusiestDay,
    getHighestPaymentDay
  } = usePaymentCalendar(contracts, currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  // Get color intensity based on payment amount
  const getColorIntensity = (amount) => {
    const maxAmount = getHighestPaymentDay()?.totalPayment || 1;
    const intensity = amount / maxAmount;

    if (amount === 0) return '#FFFFFF';
    if (intensity < 0.25) return '#EFF6FF'; // Very light blue
    if (intensity < 0.5) return '#DBEAFE';
    if (intensity < 0.75) return '#BFDBFE';
    return '#93C5FD'; // Strong blue
  };

  // Get weekday headers
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get first day of month and calculate offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  // Create calendar grid with empty cells for offset
  const calendarGrid = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarGrid.push(null); // Empty cells before month starts
  }
  calendarGrid.push(...calendarDays);

  const busiestDay = getBusiestDay();
  const highestDay = getHighestPaymentDay();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading calendar...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Calendar Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}>
            <Calendar size={20} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={styles.title}>Payment Calendar</h2>
            <p style={styles.subtitle}>Daily payment breakdown by contract instalment dates</p>
          </div>
        </div>
        <div style={styles.monthNavigation}>
          <button onClick={handlePreviousMonth} style={styles.navButton}>
            <ChevronLeft size={18} />
          </button>
          <div style={styles.currentMonth}>
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={18} />
          </button>
          <button onClick={handleToday} style={styles.todayButton}>
            Today
          </button>
        </div>
      </div>

      {/* Month Summary - Compact */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <DollarSign size={16} />
          </div>
          <div style={styles.summaryContent}>
            <div style={styles.summaryLabel}>Month Total</div>
            <div style={styles.summaryValue}>{formatCurrency(getMonthTotal())}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div style={styles.summaryLabel}>Capital</div>
            <div style={styles.summaryValueSmall}>{formatCurrency(getMonthCapitalTotal())}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryContent}>
            <div style={styles.summaryLabel}>Interest</div>
            <div style={styles.summaryValueSmall}>{formatCurrency(getMonthInterestTotal())}</div>
          </div>
        </div>

        {busiestDay && busiestDay.count > 0 && (
          <div style={styles.summaryCard}>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Busiest Day</div>
              <div style={styles.summaryValueSmall}>
                {format(busiestDay.date, 'dd MMM')} ({busiestDay.count})
              </div>
            </div>
          </div>
        )}

        {highestDay && highestDay.totalPayment > 0 && (
          <div style={styles.summaryCard}>
            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>Peak Payment</div>
              <div style={styles.summaryValueSmall}>
                {formatCurrency(highestDay.totalPayment)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarWrapper}>
        {/* Weekday Headers */}
        <div style={styles.weekdayHeader}>
          {weekdays.map(day => (
            <div key={day} style={styles.weekday}>{day}</div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={styles.calendarGrid}>
          {calendarGrid.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} style={styles.emptyCell} />;
            }

            const payment = getPaymentForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                style={{
                  ...styles.dayCell,
                  background: getColorIntensity(payment.totalPayment),
                  border: isToday ? '2px solid #4B6D8B' : '1px solid #E2E8F0',
                  boxShadow: isToday ? '0 2px 8px rgba(75, 109, 139, 0.3)' : 'none'
                }}
              >
                <div style={styles.dayNumber}>{format(day, 'd')}</div>
                
                {payment.count > 0 && (
                  <div style={styles.paymentInfo}>
                    <div style={styles.paymentCount}>
                      {payment.count}
                    </div>
                    <div style={styles.paymentAmount}>
                      {formatCurrency(payment.totalPayment)}
                    </div>
                    <div style={styles.paymentBreakdown}>
                      <div style={styles.breakdownRow}>
                        <span style={styles.breakdownLabel}>C:</span>
                        <span style={styles.breakdownValue}>{formatCurrency(payment.totalCapital)}</span>
                      </div>
                      <div style={styles.breakdownRow}>
                        <span style={styles.breakdownLabel}>I:</span>
                        <span style={styles.breakdownValue}>{formatCurrency(payment.totalInterest)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend - Compact */}
      <div style={styles.legend}>
        <div style={styles.legendSection}>
          <span style={styles.legendTitle}>Intensity:</span>
          <div style={styles.legendColors}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendBox, background: '#EFF6FF'}} />
              <span>Low</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendBox, background: '#DBEAFE'}} />
              <span>Medium</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendBox, background: '#BFDBFE'}} />
              <span>High</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendBox, background: '#93C5FD'}} />
              <span>Peak</span>
            </div>
          </div>
        </div>
        <div style={styles.legendDivider} />
        <div style={styles.legendNote}>
          <strong>C</strong> = Capital | <strong>I</strong> = Interest
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid #E2E8F0',
    marginTop: '32px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #E2E8F0'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    margin: '0 0 2px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0F172A'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '500'
  },
  monthNavigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  navButton: {
    padding: '8px',
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#4B6D8B'
  },
  currentMonth: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0F172A',
    minWidth: '150px',
    textAlign: 'center'
  },
  todayButton: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    borderRadius: '10px',
    border: '1px solid #E2E8F0'
  },
  summaryIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #4B6D8B, #6B8CAE)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0
  },
  summaryContent: {
    flex: 1,
    minWidth: 0
  },
  summaryLabel: {
    fontSize: '10px',
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#4B6D8B',
    lineHeight: '1.2'
  },
  summaryValueSmall: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: '1.2'
  },
  calendarWrapper: {
    marginBottom: '16px'
  },
  weekdayHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    marginBottom: '6px'
  },
  weekday: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '6px'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px'
  },
  emptyCell: {
    aspectRatio: '1',
    background: 'transparent'
  },
  dayCell: {
    aspectRatio: '1',
    padding: '6px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: 'all 0.2s',
    cursor: 'pointer',
    minHeight: '80px',
    position: 'relative'
  },
  dayNumber: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '2px',
    width: '100%',
    textAlign: 'center'
  },
  paymentInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px'
  },
  paymentCount: {
    fontSize: '9px',
    color: '#FFFFFF',
    fontWeight: '700',
    background: '#4B6D8B',
    padding: '2px 6px',
    borderRadius: '4px',
    lineHeight: '1'
  },
  paymentAmount: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: '1.1',
    marginTop: '2px'
  },
  paymentBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    fontSize: '9px',
    width: '100%',
    marginTop: '3px'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1px 4px'
  },
  breakdownLabel: {
    color: '#64748B',
    fontWeight: '700'
  },
  breakdownValue: {
    color: '#475569',
    fontWeight: '600'
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
    flexWrap: 'wrap'
  },
  legendSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  legendTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  legendColors: {
    display: 'flex',
    gap: '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600'
  },
  legendBox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid #E2E8F0'
  },
  legendDivider: {
    width: '1px',
    height: '20px',
    background: '#E2E8F0'
  },
  legendNote: {
    fontSize: '10px',
    color: '#94A3B8',
    fontWeight: '600'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    background: 'white',
    borderRadius: '16px',
    marginTop: '32px'
  },
  loadingText: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '600'
  }
};

export default PaymentCalendar;