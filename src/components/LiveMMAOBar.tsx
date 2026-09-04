import React from 'react';
import { MMAOBreakdown } from '../types';
import { money } from '../utils/calc';

interface LiveMMAOBarProps {
  arv: number;
  rehab: number;
  fee: number;
  purchase: number;
  breakdown: MMAOBreakdown;
  onSetPurchaseToMMAO?: (targetMao: number) => void;
}

export const LiveMMAOBar: React.FC<LiveMMAOBarProps> = ({
  arv,
  rehab,
  fee,
  purchase,
  breakdown,
  onSetPurchaseToMMAO,
}) => {
  const arv70 = Math.round(arv * 0.7);
  const isOver = purchase > breakdown.mao70;
  const diff = Math.abs(purchase - breakdown.mao70);

  return (
    <div
      style={{
        background: '#ffffff',
        border: isOver ? '1.5px solid #b3261e' : '1.5px solid #27500a',
        borderRadius: '10px',
        padding: '16px',
        margin: '16px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header & Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#111827',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
              }}
            >
              LIVE WHOLESALE MMAO
            </span>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>
              Jerry Norton 70% Wholesaler Formula
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
            (ARV × 70%) − Rehab Budget − Wholesale Assignment Fee = Max Allowable Offer
          </div>
        </div>

        <div
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: isOver ? '#fee2e2' : '#dcfce7',
            color: isOver ? '#991b1b' : '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOver ? '#dc2626' : '#16a34a',
            }}
          />
          {isOver
            ? `${money(diff)} OVER MMAO`
            : `${money(diff)} UNDER MMAO (Wholesale Safe)`}
        </div>
      </div>

      {/* Live Equation breakdown */}
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '13px',
          color: '#374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>Live Formula: </span>
          <span>
            ({money(arv)} × 0.70 = <b>{money(arv70)}</b>) − Rehab <b>{money(rehab)}</b> − Fee{' '}
            <b>{money(fee)}</b>
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
          = <span style={{ color: '#185fa5' }}>{money(breakdown.mao70)}</span> MMAO
        </div>
      </div>

      {/* 3 Offer Tiers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
            Anchor (80%)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
            {money(breakdown.anchor)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Aggressive opening bid</div>
        </div>

        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
            Target (90%)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>
            {money(breakdown.target)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Realistic sweet spot</div>
        </div>

        <div
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>
            70% MMAO
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#581c87', margin: '4px 0' }}>
            {money(breakdown.mao70)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Hard ceiling — do not cross</div>
        </div>

        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
            75% MAO Tier
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#78350f', margin: '4px 0' }}>
            {money(breakdown.mao75)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Light cosmetic / fast flip</div>
        </div>
      </div>

      {/* Action / Context Note */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          color: '#4b5563',
          paddingTop: '6px',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div>
          Current Contract Price:{' '}
          <strong style={{ color: '#111827' }}>{money(purchase)}</strong>
          {isOver ? (
            <span style={{ color: '#b3261e', marginLeft: '6px' }}>
              (Must negotiate down {money(diff)} to lock fee)
            </span>
          ) : (
            <span style={{ color: '#27500a', marginLeft: '6px' }}>
              ({money(diff)} wholesale cushion available)
            </span>
          )}
        </div>

        {isOver && onSetPurchaseToMMAO && (
          <button
            type="button"
            onClick={() => onSetPurchaseToMMAO(breakdown.mao70)}
            style={{
              background: '#b3261e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Snap Purchase Price to MMAO ({money(breakdown.mao70)})
          </button>
        )}
      </div>
    </div>
  );
};
