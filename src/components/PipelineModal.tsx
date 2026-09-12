import React, { useState, useEffect } from 'react';
import { SavedDeal } from './ShareModal';
import { money } from '../utils/calc';
import { StrategyTab } from '../types';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDeal: (deal: SavedDeal) => void;
  onSaveCurrentDeal: () => void;
  currentAddress: string;
}

export const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  onLoadDeal,
  onSaveCurrentDeal,
  currentAddress,
}) => {
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [feedback, setFeedback] = useState('');
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadDeals = () => {
    try {
      const stored = localStorage.getItem('deal_calculator_saved_deals');
      if (stored) {
        setDeals(JSON.parse(stored));
      } else {
        setDeals([]);
      }
    } catch {
      setDeals([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDeals();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, address: string) => {
    if (!window.confirm(`Delete "${address}" from your pipeline?`)) return;
    const updated = deals.filter((d) => d.id !== id);
    setDeals(updated);
    localStorage.setItem('deal_calculator_saved_deals', JSON.stringify(updated));
    setFeedback(`Deleted "${address}" from pipeline.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleCopySummary = (deal: SavedDeal) => {
    const text = `🏠 DEAL PIPELINE SUMMARY
Address: ${deal.address}
Strategy: ${deal.strategy.toUpperCase()}
Offer Price: ${money(deal.price)}
Metrics: ${deal.highlight}
Saved: ${deal.date}${deal.seller ? ` | Seller: ${deal.seller}` : ''}${
      deal.notes ? `\nNotes: ${deal.notes}` : ''
    }`;

    navigator.clipboard.writeText(text);
    setFeedback(`✓ Copied "${deal.address}" summary to clipboard! Ready to text/email.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleExportCSV = () => {
    if (deals.length === 0) {
      setFeedback('No deals in pipeline to export.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const headers = ['Address', 'Seller', 'Date Saved', 'Strategy', 'Offer Price', 'Metrics & Profit', 'Notes'];
    const rows = deals.map((d) => [
      `"${(d.address || '').replace(/"/g, '""')}"`,
      `"${(d.seller || '').replace(/"/g, '""')}"`,
      `"${d.date || ''}"`,
      `"${(d.strategy || '').toUpperCase()}"`,
      d.price || 0,
      `"${(d.highlight || '').replace(/"/g, '""')}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wholesale_Deal_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedback('✓ Exported Master Pipeline CSV spreadsheet!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const filtered = deals.filter((d) => {
    const matchesSearch =
      d.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.seller && d.seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStrat = filterStrategy === 'all' || d.strategy === filterStrategy;
    return matchesSearch && matchesStrat;
  });

  return (
    <div
      className="modal-back show"
      style={{ zIndex: 10002 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: '800px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#185fa5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📁 Wholesale &amp; Deal Pipeline
              <span
                style={{
                  fontSize: '12px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                {deals.length} {deals.length === 1 ? 'deal' : 'deals'} saved
              </span>
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              All deals you save are securely stored locally in your browser. Load any deal back into the live calculator with 1 click!
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 12px',
            margin: '12px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 320px' }}>
            <input
              type="text"
              placeholder="🔍 Search address, seller, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                flex: '1 1 180px',
              }}
            />

            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
              }}
            >
              <option value="all">All Strategies</option>
              <option value="dscr">DSCR Rental</option>
              <option value="sf">Seller Finance</option>
              <option value="st">Subject-To</option>
              <option value="ff">Fix &amp; Flip</option>
              <option value="dc">Double Close</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                onSaveCurrentDeal();
                loadDeals();
              }}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`Save currently loaded deal: ${currentAddress}`}
            >
              💾 Save Current Deal
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                background: '#185fa5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {feedback && (
          <div
            style={{
              padding: '8px 12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            {feedback}
          </div>
        )}

        {/* Deals List */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 20px',
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
            <div style={{ fontWeight: 700, color: '#334155', fontSize: '15px' }}>
              {deals.length === 0 ? 'No Deals in Your Pipeline Yet' : 'No deals match your search filter'}
            </div>
            <div style={{ marginTop: '4px', maxWidth: '420px', margin: '4px auto 14px', lineHeight: 1.5 }}>
              Click <strong>&quot;Save Current Deal&quot;</strong> above or click <strong>&quot;📄 Export Tear Sheet / Pipeline&quot;</strong> to save addresses, offers, and profit metrics as you analyze properties on Zillow!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((deal) => {
              const stratBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
                dscr: { label: '🏢 DSCR', bg: '#eff6ff', color: '#1d4ed8' },
                sf: { label: '🤝 Seller Finance', bg: '#f5f3ff', color: '#6d28d9' },
                st: { label: '📑 Subject-To', bg: '#f0fdf4', color: '#15803d' },
                ff: { label: '🔨 Fix & Flip', bg: '#fff7ed', color: '#c2410c' },
                dc: { label: '🔄 Double Close', bg: '#fef3c7', color: '#b45309' },
              };

              const strat = stratBadgeMap[deal.strategy] || { label: deal.strategy.toUpperCase(), bg: '#f1f5f9', color: '#334155' };

              return (
                <div
                  key={deal.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          📍 {deal.address}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: strat.bg,
                            color: strat.color,
                          }}
                        >
                          {strat.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Saved {deal.date}
                        </span>
                      </div>

                      {deal.seller && (
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                          Seller Contact: <strong>{deal.seller}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDeal(deal);
                          onClose();
                        }}
                        style={{
                          background: '#185fa5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Load this address and price directly into the live calculator"
                      >
                        ⚡ Load into Calc
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopySummary(deal)}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Copy deal bullets to send to Richard Taylor or a cash buyer"
                      >
                        📋 Copy
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(deal.id, deal.address)}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Delete from pipeline"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Highlights & Numbers */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      marginTop: '4px',
                      padding: '6px 10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>Contract Offer: </span>
                      <strong style={{ color: '#0f172a' }}>{money(deal.price)}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b' }}>Key Metric: </span>
                      <strong style={{ color: '#16a34a' }}>{deal.highlight}</strong>
                    </div>
                  </div>

                  {deal.notes && (
                    <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                      Notes: {deal.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            Close Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};
