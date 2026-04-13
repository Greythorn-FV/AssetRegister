// File: src/components/PaymentCalendar.jsx
// COMPACT & PROFESSIONAL - Visual calendar showing daily payment totals

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { usePaymentCalendar } from '../hooks/usePaymentCalendar.js';
import { formatCurrency } from '../utils/currencyHelpers.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const getStyles = (m) => ({
  container: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: m ? '12px' : '24px',
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    marginTop: m ? '16px' : '32px',
    maxWidth: '100vw',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    flexDirection: m ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: m ? 'flex-start' : 'center',
    gap: m ? '12px' : '0',
    marginBottom: m ? '12px' : '20px',
    paddingBottom: m ? '12px' : '16px',
    borderBottom: `2px solid ${colors.border}`
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '8px' : '12px'
  },
  iconWrapper: {
    width: m ? '32px' : '40px',
    height: m ? '32px' : '40px',
    background: gradients.primary,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    margin: '0 0 2px 0',
    fontSize: m ? '16px' : '20px',
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  subtitle: {
    margin: 0,
    fontSize: m ? '11px' : fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.medium
  },
  monthNavigation: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '6px' : '10px'
  },
  navButton: {
    padding: m ? '6px' : '8px',
    background: colors.background,
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: colors.primary
  },
  currentMonth: {
    fontSize: m ? fonts.size.sm : fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    minWidth: m ? '110px' : '150px',
    textAlign: 'center'
  },
  todayButton: {
    padding: m ? '6px 10px' : '8px 16px',
    background: gradients.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.md,
    fontSize: m ? '11px' : '13px',
    fontWeight: fonts.weight.bold,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: m ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: m ? '8px' : '12px',
    marginBottom: m ? '12px' : '20px'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '6px' : '10px',
    padding: m ? '8px 10px' : '12px 14px',
    background: gradients.surface,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`
  },
  summaryIcon: {
    width: m ? '26px' : '32px',
    height: m ? '26px' : '32px',
    background: gradients.primary,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textOnDark,
    flexShrink: 0
  },
  summaryContent: {
    flex: 1,
    minWidth: 0
  },
  summaryLabel: {
    fontSize: m ? '8px' : '10px',
    color: colors.textSecondary,
    fontWeight: fonts.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },
  summaryValue: {
    fontSize: m ? fonts.size.base : fonts.size.xl,
    fontWeight: fonts.weight.extrabold,
    color: colors.primary,
    lineHeight: '1.2'
  },
  summaryValueSmall: {
    fontSize: m ? fonts.size.sm : fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    lineHeight: '1.2'
  },
  calendarWrapper: {
    marginBottom: m ? '12px' : '16px',
    overflowX: m ? 'auto' : 'visible',
    WebkitOverflowScrolling: 'touch'
  },
  calendarInner: {
    minWidth: m ? '320px' : 'auto'
  },
  weekdayHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: m ? '3px' : '6px',
    marginBottom: m ? '3px' : '6px'
  },
  weekday: {
    textAlign: 'center',
    fontSize: m ? '9px' : fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: m ? '4px 2px' : '6px'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: m ? '3px' : '6px'
  },
  emptyCell: {
    aspectRatio: '1',
    background: 'transparent'
  },
  dayCell: {
    aspectRatio: '1',
    padding: m ? '3px' : '6px',
    borderRadius: radius.md,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: 'all 0.2s',
    cursor: 'pointer',
    minHeight: m ? '48px' : '80px',
    position: 'relative'
  },
  dayNumber: {
    fontSize: m ? '10px' : '13px',
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: m ? '1px' : '2px',
    width: '100%',
    textAlign: 'center'
  },
  paymentInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: m ? '1px' : '3px'
  },
  paymentCount: {
    fontSize: m ? '7px' : '9px',
    color: colors.textOnDark,
    fontWeight: fonts.weight.bold,
    background: colors.primary,
    padding: m ? '1px 3px' : '2px 6px',
    borderRadius: radius.sm,
    lineHeight: '1'
  },
  paymentAmount: {
    fontSize: m ? '9px' : fonts.size.sm,
    fontWeight: fonts.weight.extrabold,
    color: colors.info,
    textAlign: 'center',
    lineHeight: '1.1',
    marginTop: m ? '1px' : '2px'
  },
  paymentBreakdown: {
    display: m ? 'none' : 'flex',
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
    color: colors.textSecondary,
    fontWeight: fonts.weight.bold
  },
  breakdownValue: {
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  },
  legend: {
    display: 'flex',
    alignItems: m ? 'flex-start' : 'center',
    flexDirection: m ? 'column' : 'row',
    gap: m ? '8px' : '16px',
    paddingTop: m ? '12px' : '16px',
    borderTop: `1px solid ${colors.border}`,
    flexWrap: 'wrap'
  },
  legendSection: {
    display: 'flex',
    alignItems: 'center',
    gap: m ? '8px' : '12px',
    flexWrap: 'wrap'
  },
  legendTitle: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  legendColors: {
    display: 'flex',
    gap: m ? '6px' : '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: m ? '10px' : fonts.size.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  },
  legendBox: {
    width: m ? '14px' : '18px',
    height: m ? '14px' : '18px',
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`
  },
  legendDivider: {
    width: m ? '0' : '1px',
    height: m ? '0' : '20px',
    display: m ? 'none' : 'block',
    background: colors.border
  },
  legendNote: {
    fontSize: '10px',
    color: colors.textMuted,
    fontWeight: fonts.weight.semibold
  },
  loading: {
    padding: m ? '24px' : '40px',
    textAlign: 'center',
    background: colors.surface,
    borderRadius: radius.lg,
    marginTop: m ? '16px' : '32px'
  },
  loadingText: {
    fontSize: fonts.size.base,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold
  }
});

const PaymentCalendar = ({ contracts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

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
            <Calendar size={isMobile ? 16 : 20} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={styles.title}>Payment Calendar</h2>
            <p style={styles.subtitle}>Daily payment breakdown by contract instalment dates</p>
          </div>
        </div>
        <div style={styles.monthNavigation}>
          <button onClick={handlePreviousMonth} style={styles.navButton}>
            <ChevronLeft size={isMobile ? 16 : 18} />
          </button>
          <div style={styles.currentMonth}>
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={isMobile ? 16 : 18} />
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
            <DollarSign size={isMobile ? 12 : 16} />
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
        <div style={styles.calendarInner}>
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
                  onClick={() => payment.count > 0 && setSelectedDay(
                    selectedDay === format(day, 'yyyy-MM-dd') ? null : format(day, 'yyyy-MM-dd')
                  )}
                  style={{
                    ...styles.dayCell,
                    background: getColorIntensity(payment.totalPayment),
                    border: isToday ? `2px solid ${colors.primary}`
                      : selectedDay === format(day, 'yyyy-MM-dd') ? `2px solid ${colors.accent}`
                      : `1px solid ${colors.border}`,
                    boxShadow: isToday ? shadows.md : selectedDay === format(day, 'yyyy-MM-dd') ? shadows.lg : 'none',
                    cursor: payment.count > 0 ? 'pointer' : 'default'
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
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay && (() => {
        const dayPayment = getPaymentForDay(new Date(selectedDay + 'T00:00:00'));
        if (!dayPayment || dayPayment.count === 0) return null;
        return (
          <div style={dayDetailStyles.panel}>
            <div style={dayDetailStyles.header}>
              <span style={dayDetailStyles.title}>
                {format(new Date(selectedDay + 'T00:00:00'), 'EEEE, d MMMM yyyy')}
              </span>
              <button onClick={() => setSelectedDay(null)} style={dayDetailStyles.closeBtn}>
                &times;
              </button>
            </div>
            <div style={dayDetailStyles.summary}>
              {dayPayment.count} contract{dayPayment.count > 1 ? 's' : ''} &middot; {formatCurrency(dayPayment.totalPayment)} total
            </div>
            <div style={dayDetailStyles.list}>
              {dayPayment.contracts.map((c, i) => (
                <div key={i} style={dayDetailStyles.contractRow}>
                  <div style={dayDetailStyles.contractNum}>{c.contractNumber}</div>
                  <div style={dayDetailStyles.amounts}>
                    <span style={dayDetailStyles.amount}>Capital: {formatCurrency(c.capitalPayment)}</span>
                    <span style={dayDetailStyles.amount}>Interest: {formatCurrency(c.interestPayment)}</span>
                    <span style={dayDetailStyles.total}>Total: {formatCurrency(c.totalPayment)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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

const dayDetailStyles = {
  panel: {
    marginTop: '12px',
    padding: '16px',
    background: colors.surface,
    borderRadius: radius.lg,
    border: `2px solid ${colors.accent}`,
    boxShadow: shadows.md
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  title: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: colors.textMuted,
    padding: '0 4px'
  },
  summary: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: `1px solid ${colors.borderLight}`
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contractRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.borderLight}`,
    flexWrap: 'wrap',
    gap: '6px'
  },
  contractNum: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary
  },
  amounts: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  amount: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary
  },
  total: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.accent
  }
};

export default PaymentCalendar;
