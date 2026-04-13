import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { colors, gradients, fonts, shadows, radius } from '../styles/theme.js';
import { getDeletedContracts, restoreContract, permanentlyDeleteContract } from '../services/firestoreService.js';

const TrashModal = ({ isOpen, onClose, onRestore }) => {
  const isMobile = useIsMobile();
  const s = getStyles(isMobile);
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen) loadDeleted();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const loadDeleted = async () => {
    setLoading(true);
    try {
      const data = await getDeletedContracts();
      setDeleted(data);
    } catch (err) {
      alert('Failed to load deleted contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, contractNumber) => {
    if (!window.confirm(`Restore contract ${contractNumber}?`)) return;
    setActionLoading(id);
    try {
      await restoreContract(id);
      setDeleted(prev => prev.filter(c => c.id !== id));
      if (onRestore) onRestore();
    } catch (err) {
      alert('Failed to restore: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id, contractNumber) => {
    if (!window.confirm(`Permanently delete ${contractNumber}? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await permanentlyDeleteContract(id);
      setDeleted(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Trash</h2>
            <p style={s.subtitle}>Deleted contracts can be restored</p>
          </div>
          <button onClick={onClose} style={s.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={s.content}>
          {loading ? (
            <div style={s.empty}>Loading...</div>
          ) : deleted.length === 0 ? (
            <div style={s.empty}>Trash is empty</div>
          ) : (
            <div style={s.list}>
              {deleted.map(contract => {
                const deletedDate = contract.deletedAt?.toDate?.()
                  ? contract.deletedAt.toDate().toLocaleDateString()
                  : 'Unknown';
                const isActioning = actionLoading === contract.id;

                return (
                  <div key={contract.id} style={s.card}>
                    <div style={s.cardInfo}>
                      <div style={s.contractNum}>{contract.contractNumber}</div>
                      <div style={s.cardMeta}>
                        {contract.vehicles?.length || 0} vehicles &middot; Deleted {deletedDate}
                      </div>
                    </div>
                    <div style={s.cardActions}>
                      <button
                        onClick={() => handleRestore(contract.id, contract.contractNumber)}
                        disabled={isActioning}
                        style={s.restoreBtn}
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(contract.id, contract.contractNumber)}
                        disabled={isActioning}
                        style={s.permDeleteBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStyles = (m) => ({
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: m ? 'stretch' : 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: colors.surface,
    borderRadius: m ? 0 : radius.xl,
    width: m ? '100%' : '90%',
    maxWidth: m ? 'none' : '600px',
    maxHeight: m ? '100vh' : '80vh',
    height: m ? '100vh' : undefined,
    overflow: 'hidden',
    boxShadow: m ? 'none' : shadows.xl,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    background: gradients.primary,
    padding: m ? '16px' : '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    fontSize: m ? fonts.size.xl : fonts.size['2xl'],
    fontWeight: fonts.weight.bold,
    color: colors.textOnDark,
    margin: 0
  },
  subtitle: {
    fontSize: fonts.size.sm,
    color: colors.textOnDarkMuted,
    margin: '4px 0 0 0'
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    borderRadius: radius.md,
    padding: '8px',
    color: colors.textOnDark,
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: m ? '12px' : '20px'
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: colors.textMuted,
    fontSize: fonts.size.md
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: m ? '10px' : '14px 16px',
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    gap: '10px'
  },
  cardInfo: {
    flex: 1,
    minWidth: 0
  },
  contractNum: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary
  },
  cardMeta: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    marginTop: '2px'
  },
  cardActions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0
  },
  restoreBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: colors.successLight,
    color: colors.successText,
    border: `1px solid ${colors.successBorder}`,
    borderRadius: radius.sm,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    cursor: 'pointer'
  },
  permDeleteBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    background: colors.errorLight,
    color: colors.errorText,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: radius.sm,
    cursor: 'pointer'
  }
});

export default TrashModal;
