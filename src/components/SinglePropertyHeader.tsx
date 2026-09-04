import React from 'react';
import { UniversalProperty, MMAOBreakdown } from '../types';
import { money } from '../utils/calc';

interface SinglePropertyHeaderProps {
  property: UniversalProperty;
  mmao: MMAOBreakdown;
  onUpdate: <K extends keyof UniversalProperty>(key: K, value: UniversalProperty[K]) => void;
  onResetProperty: () => void;
}

export const SinglePropertyHeader: React.FC<SinglePropertyHeaderProps> = ({
  property,
  mmao,
  onUpdate,
  onResetProperty,
}) => {
  const isOverMMAO = property.purchasePrice > mmao.mao70;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top line: Property Address / Title & Universal Sync Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            🏠
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Property Underwriting
            </div>
            <input
              type="text"
              value={property.address}
              onChange={(e) => onUpdate('address', e.target.value)}
              placeholder="Enter property address (e.g. 124 Main St, Tampa, FL)"
              style={{
                width: '100%',
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                border: 'none',
                borderBottom: '1.5px dashed #9ca3af',
                outline: 'none',
                padding: '2px 0',
                background: 'transparent',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Universal Sync Active
          </span>
          <button
            type="button"
            onClick={onResetProperty}
            title="Reset to fresh clean property inputs"
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#4b5563',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            New Property
          </button>
        </div>
      </div>

      {/* Global Property Vitals Strip: Universally live across all strategies */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '10px 12px',
          border: '1px solid #f3f4f6',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Purchase Price
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.purchasePrice)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            ARV / Market Value
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.propertyValue)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Market Rent
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.rent)}/mo
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Taxes &amp; Insurance
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.taxesAndInsurance)}/mo
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Rehab Scope
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.rehab)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
            Wholesale Fee
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.assignmentFee)}
          </div>
        </div>

        <div
          style={{
            background: isOverMMAO ? '#fef2f2' : '#f0fdf4',
            border: isOverMMAO ? '1px solid #fecaca' : '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '4px 8px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: isOverMMAO ? '#991b1b' : '#166534',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Live 70% MMAO
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: isOverMMAO ? '#b91c1c' : '#15803d',
            }}
          >
            {money(mmao.mao70)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
        Changing purchase price, taxes, rent, or rehab on <i>any tab or tool below</i> updates this property universally.
      </div>
    </div>
  );
};
