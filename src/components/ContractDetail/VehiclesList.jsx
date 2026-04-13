// File: src/components/ContractDetail/VehiclesList.jsx
// Vehicles list component

import React, { useState } from 'react';
import { CheckCircle, TrendingDown, RotateCcw, MessageSquare } from 'lucide-react';
import { colors, fonts, radius } from '../../styles/theme.js';
import { formatCurrency } from '../../utils/currencyHelpers.js';
import { formatDate } from '../../utils/dateHelpers.js';

const NOTE_PRESETS = ['SOLD', 'SCRAPPED', 'TOTAL LOSS', 'STOLEN', 'RETURNED', 'WRITTEN OFF'];

const VehiclesList = ({
  contract,
  metrics,
  loading,
  onSettleVehicle,
  onUnsettleVehicle,
  onUpdateVehicleNote,
  onSettleVehicleWithImpact
}) => {
  const [editingNote, setEditingNote] = useState(null); // registration of vehicle being edited
  const [noteText, setNoteText] = useState('');
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        Vehicles ({contract.activeVehiclesCount} active of {contract.originalVehicleCount} total)
      </h3>
      <div style={styles.vehiclesList}>
        {contract.vehicles.map((vehicle, index) => (
          <div key={index} style={styles.vehicleCard}>
            <div style={styles.vehicleHeader}>
              <div>
                <div style={styles.vehicleReg}>{vehicle.registration}</div>
                <div style={styles.vehicleMakeModel}>{vehicle.make} {vehicle.model}</div>
              </div>
              <div style={styles.vehicleActions}>
                <span style={{
                  ...styles.vehicleBadge,
                  ...(vehicle.status === 'active' ? styles.vehicleBadgeActive : styles.vehicleBadgeSettled)
                }}>
                  {vehicle.status}
                </span>
                {vehicle.status === 'active' && (
                  <>
                    {contract.interestType === 'variable' ? (
                      <button
                        onClick={() => onSettleVehicleWithImpact(vehicle)}
                        style={styles.analyzeButton}
                        disabled={loading}
                      >
                        <TrendingDown size={16} />
                        Settle
                      </button>
                    ) : (
                      <button
                        onClick={() => onSettleVehicle(vehicle.registration)}
                        style={styles.settleButton}
                        disabled={loading}
                      >
                        <CheckCircle size={16} />
                        Settle
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {vehicle.status === 'active' && (
              <div style={styles.vehicleMetrics}>
                <div style={styles.vehicleMetric}>
                  <span style={styles.metricLabel}>Monthly Capital:</span>
                  <span style={styles.metricValue}>{formatCurrency(contract.perVehicleCapitalRate)}</span>
                </div>
                <div style={styles.vehicleMetric}>
                  <span style={styles.metricLabel}>Outstanding:</span>
                  <span style={styles.metricValue}>
                    {formatCurrency(contract.perVehicleCapitalRate * metrics.monthsRemaining)}
                  </span>
                </div>
              </div>
            )}
            {vehicle.status === 'settled' && (
              <div style={styles.settledRow}>
                <div style={styles.settledInfo}>
                  {vehicle.settledDate ? `Settled on: ${formatDate(vehicle.settledDate)}` : 'Settled'}
                </div>
                <button
                  onClick={() => onUnsettleVehicle(vehicle.registration)}
                  style={styles.undoButton}
                  disabled={loading}
                >
                  <RotateCcw size={14} />
                  Undo
                </button>
              </div>
            )}

            {/* Vehicle Note */}
            <div style={styles.noteSection}>
              {vehicle.note && editingNote !== vehicle.registration && (
                <div style={styles.noteDisplay}>
                  <MessageSquare size={12} style={{flexShrink: 0, marginTop: '1px'}} />
                  <span style={styles.noteText}>{vehicle.note}</span>
                  <button
                    onClick={() => { setEditingNote(vehicle.registration); setNoteText(vehicle.note || ''); }}
                    style={styles.noteEditBtn}
                  >
                    Edit
                  </button>
                </div>
              )}
              {!vehicle.note && editingNote !== vehicle.registration && (
                <button
                  onClick={() => { setEditingNote(vehicle.registration); setNoteText(''); }}
                  style={styles.addNoteBtn}
                >
                  <MessageSquare size={12} />
                  Add note
                </button>
              )}
              {editingNote === vehicle.registration && (
                <div style={styles.noteEditor}>
                  <div style={styles.notePresets}>
                    {NOTE_PRESETS.map(preset => (
                      <button
                        key={preset}
                        onClick={() => setNoteText(preset)}
                        style={{
                          ...styles.presetBtn,
                          ...(noteText === preset ? styles.presetBtnActive : {})
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Or type a custom note..."
                    style={styles.noteInput}
                  />
                  <div style={styles.noteActions}>
                    <button
                      onClick={() => { onUpdateVehicleNote(vehicle.registration, noteText); setEditingNote(null); }}
                      style={styles.noteSaveBtn}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      style={styles.noteCancelBtn}
                    >
                      Cancel
                    </button>
                    {vehicle.note && (
                      <button
                        onClick={() => { onUpdateVehicleNote(vehicle.registration, ''); setEditingNote(null); }}
                        style={styles.noteRemoveBtn}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary,
    marginBottom: '16px'
  },
  vehiclesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  vehicleCard: {
    padding: '16px',
    background: colors.surfaceHover,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  vehicleReg: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary
  },
  vehicleMakeModel: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginTop: '2px'
  },
  vehicleActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  vehicleBadge: {
    padding: '4px 10px',
    borderRadius: radius.md,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    textTransform: 'capitalize'
  },
  vehicleBadgeActive: {
    background: colors.successLight,
    color: colors.successText
  },
  vehicleBadgeSettled: {
    background: colors.settledBg,
    color: colors.settled
  },
  settleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: colors.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.sm,
    cursor: 'pointer',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: colors.success,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.sm,
    cursor: 'pointer',
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold
  },
  vehicleMetrics: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`
  },
  vehicleMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metricLabel: {
    fontSize: fonts.size.xs,
    color: colors.textSecondary
  },
  metricValue: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary
  },
  settledRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    gap: '8px'
  },
  settledInfo: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    fontStyle: 'italic'
  },
  noteSection: {
    marginTop: '8px',
    borderTop: `1px solid ${colors.borderLight}`,
    paddingTop: '8px'
  },
  noteDisplay: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: fonts.size.sm,
    color: colors.textSecondary
  },
  noteText: {
    flex: 1,
    fontStyle: 'italic'
  },
  noteEditBtn: {
    background: 'none',
    border: 'none',
    color: colors.accent,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    flexShrink: 0
  },
  addNoteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    cursor: 'pointer',
    padding: 0
  },
  noteEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  notePresets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  presetBtn: {
    padding: '4px 8px',
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: '10px',
    fontWeight: fonts.weight.semibold,
    color: colors.textSecondary,
    cursor: 'pointer'
  },
  presetBtnActive: {
    background: colors.primary,
    color: colors.textOnDark,
    borderColor: colors.primary
  },
  noteInput: {
    width: '100%',
    padding: '8px 10px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.sm,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box'
  },
  noteActions: {
    display: 'flex',
    gap: '6px'
  },
  noteSaveBtn: {
    padding: '4px 12px',
    background: colors.primary,
    color: colors.textOnDark,
    border: 'none',
    borderRadius: radius.sm,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  },
  noteCancelBtn: {
    padding: '4px 12px',
    background: colors.background,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    cursor: 'pointer'
  },
  noteRemoveBtn: {
    padding: '4px 12px',
    background: colors.errorLight,
    color: colors.errorText,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.medium,
    cursor: 'pointer'
  },
  undoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: colors.warningLight,
    color: colors.warningText,
    border: `1px solid ${colors.warningBorder}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default VehiclesList;