import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { updateContract } from '../services/firestoreService.js';
import { formatCurrency } from '../utils/currencyHelpers.js';

const RateChangeModal = ({ contract, isOpen, onClose, onSuccess }) => {
  const [newBaseRate, setNewBaseRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !contract) return null;

  const currentRate = (contract.baseRate || 0) + (contract.margin || 0);
  const margin = contract.margin || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newBaseRate || parseFloat(newBaseRate) < 0) {
      setError('Please enter a valid base rate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rateChange = {
        date: effectiveDate,
        oldBaseRate: contract.baseRate || 0,
        newBaseRate: parseFloat(newBaseRate),
        oldEffectiveRate: currentRate,
        newEffectiveRate: parseFloat(newBaseRate) + margin
      };

      // Get existing rate history or create new
      const rateHistory = contract.rateHistory || [];
      rateHistory.push(rateChange);

      // Update contract with new rate
      await updateContract(contract.id, {
        baseRate: parseFloat(newBaseRate),
        interestRateAnnual: parseFloat(newBaseRate) + margin,
        rateHistory: rateHistory
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update rate');
    } finally {
      setLoading(false);
    }
  };

  const newEffectiveRate = newBaseRate ? (parseFloat(newBaseRate) + margin) : 0;
  const rateDifference = newEffectiveRate - currentRate;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Update Interest Rate</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.infoBox}>
            <AlertCircle size={18} />
            <div>
              <strong>Bank of England Rate Change</strong>
              <p style={{ fontSize: '13px', marginTop: '4px', color: '#4A5568' }}>
                Update the base rate when Bank of England announces changes. 
                Your margin ({margin.toFixed(2)}%) stays fixed.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.currentRateBox}>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Current Base Rate:</span>
                <span style={styles.rateValue}>{(contract.baseRate || 0).toFixed(2)}%</span>
              </div>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Fixed Margin:</span>
                <span style={styles.rateValue}>+{margin.toFixed(2)}%</span>
              </div>
              <div style={styles.rateItem}>
                <span style={styles.rateLabel}>Current Effective Rate:</span>
                <span style={styles.rateValueHighlight}>{currentRate.toFixed(2)}%</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Bank of England Base Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                value={newBaseRate}
                onChange={(e) => setNewBaseRate(e.target.value)}
                style={styles.input}
                placeholder="e.g., 5.75"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Effective From Date *</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {newBaseRate && (
              <div style={{
                ...styles.newRateBox,
                ...(rateDifference > 0 ? styles.rateIncrease : styles.rateDecrease)
              }}>
                <div style={styles.impactHeader}>
                  {rateDifference > 0 ? (
                    <TrendingUp size={24} color="#DC2626" />
                  ) : (
                    <TrendingDown size={24} color="#059669" />
                  )}
                  <span style={styles.impactTitle}>
                    {rateDifference > 0 ? 'Rate Increase' : 'Rate Decrease'}
                  </span>
                </div>

                <div style={styles.newRateDetails}>
                  <div style={styles.rateItem}>
                    <span style={styles.rateLabel}>New Base Rate:</span>
                    <span style={styles.rateValue}>{parseFloat(newBaseRate).toFixed(2)}%</span>
                  </div>
                  <div style={styles.rateItem}>
                    <span style={styles.rateLabel}>New Effective Rate:</span>
                    <span style={styles.rateValueHighlight}>
                      {newEffectiveRate.toFixed(2)}%
                    </span>
                  </div>
                  <div style={styles.rateItem}>
                    <span style={styles.rateLabel}>Change:</span>
                    <span style={{
                      ...styles.rateValueHighlight,
                      color: rateDifference > 0 ? '#DC2626' : '#059669'
                    }}>
                      {rateDifference > 0 ? '+' : ''}{rateDifference.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div style={styles.impactNote}>
                  {rateDifference > 0 ? (
                    <p>⚠️ Your monthly interest charges will INCREASE from the effective date onwards.</p>
                  ) : (
                    <p>🎉 Your monthly interest charges will DECREASE from the effective date onwards.</p>
                  )}
                </div>
              </div>
            )}

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.cancelButton} disabled={loading}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update Rate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #E2E8F0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#718096'
  },
  content: {
    padding: '24px'
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#DBEAFE',
    border: '1px solid #93C5FD',
    borderRadius: '8px',
    marginBottom: '24px',
    color: '#1E3A8A'
  },
  currentRateBox: {
    background: '#F7FAFC',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #E2E8F0'
  },
  rateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #E2E8F0'
  },
  rateLabel: {
    fontSize: '14px',
    color: '#718096',
    fontWeight: '500'
  },
  rateValue: {
    fontSize: '14px',
    color: '#1A202C',
    fontWeight: '600'
  },
  rateValueHighlight: {
    fontSize: '16px',
    color: '#3182CE',
    fontWeight: '700'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  newRateBox: {
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    border: '2px solid'
  },
  rateIncrease: {
    background: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  rateDecrease: {
    background: '#F0FDF4',
    borderColor: '#86EFAC'
  },
  impactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  impactTitle: {
    fontSize: '18px',
    fontWeight: '700'
  },
  newRateDetails: {
    marginBottom: '16px'
  },
  impactNote: {
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  error: {
    background: '#FED7D7',
    color: '#C53030',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #E2E8F0'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#EDF2F7',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4A5568'
  },
  submitButton: {
    padding: '10px 20px',
    background: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default RateChangeModal;