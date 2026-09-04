import React, { useState } from 'react';

interface RangeInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  derived?: string;
  formulaBadge?: string;  // e.g. "x 0.8" or "70% Rule"
  tip?: string;           // Explains where to get it or how it affects the formula
  isCore?: boolean;       // Highlight for quick 15-second Zillow screen
  onChange: (val: number) => void;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  derived,
  formulaBadge,
  tip,
  isCore,
  onChange,
}) => {
  const [showTip, setShowTip] = useState(false);
  const currentMax = Math.max(max, value);
  const currentMin = Math.min(min, value);

  return (
    <div
      className="field-group"
      style={{
        position: 'relative',
        ...(isCore
          ? {
              background: '#fcfbf7',
              border: '1.5px solid #dcd8ce',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px',
            }
          : { marginBottom: '16px' }),
      }}
    >
      <div className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: isCore ? 600 : 500, color: isCore ? '#185fa5' : '#2c2c2a' }}>
            {label}
          </span>

          {formulaBadge && (
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                background: '#eef4fb',
                color: '#185fa5',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid #d2e3f7',
                fontWeight: 600,
                letterSpacing: '-0.2px',
              }}
              title={`Formula component: ${formulaBadge}`}
            >
              {formulaBadge}
            </span>
          )}

          {tip && (
            <button
              type="button"
              onClick={() => setShowTip(!showTip)}
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              aria-label="Info tip"
              style={{
                background: showTip ? '#185fa5' : '#f0eee6',
                color: showTip ? '#ffffff' : '#666666',
                border: '1px solid #d3d1c7',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              i
            </button>
          )}
        </div>

        {derived && <span className="derived">{derived}</span>}
      </div>

      {/* Touch/Apple Pencil/Desktop Tip Tooltip */}
      {showTip && tip && (
        <div
          style={{
            background: '#2c2c2a',
            color: '#f1efe8',
            fontSize: '12px',
            lineHeight: 1.45,
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div>
              <strong style={{ color: '#ecd19b' }}>Underwriting Tip: </strong>
              {tip}
            </div>
            <button
              type="button"
              onClick={() => setShowTip(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="input-row">
        <input
          type="number"
          id={id}
          value={isNaN(value) ? '' : value}
          step={step}
          inputMode="decimal"
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
        />
        <input
          type="range"
          id={`${id}-r`}
          min={currentMin}
          max={currentMax}
          step={step}
          value={isNaN(value) ? 0 : value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};
