import React, { useState } from 'react';

interface RangeInputProps {
  id: string;
  label: string;
  value?: number;
  val?: number; // Alias for value to support components passing val
  min?: number;
  max?: number;
  step?: number;
  derived?: string;
  format?: 'money' | 'pct' | 'num';
  eli12?: string;
  ruleOfThumb?: string;
  formulaBadge?: string;  // e.g. "x 0.8" or "70% Rule"
  tip?: string;           // Explains where to get it or how it affects the formula
  isCore?: boolean;       // Highlight for quick 15-second Zillow screen
  warnStatus?: 'normal' | 'warn' | 'bad'; // 'warn' = yellow/amber, 'bad' = red
  warnMessage?: string;   // Contextual advice when value is extreme/unviable
  onChange: (val: number) => void;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  id,
  label,
  value: rawValue,
  val: rawVal,
  min: rawMin = 0,
  max: rawMax = 100,
  step = 1,
  derived: rawDerived,
  format,
  eli12,
  ruleOfThumb,
  formulaBadge,
  tip: rawTip,
  isCore,
  warnStatus = 'normal',
  warnMessage,
  onChange,
}) => {
  const [showTip, setShowTip] = useState(false);

  // Unify value vs val
  const numValue = rawValue !== undefined ? rawValue : (rawVal !== undefined ? rawVal : 0);
  const safeValue = Number.isFinite(numValue) ? numValue : 0;
  const safeMin = Number.isFinite(rawMin) ? rawMin : 0;
  const safeMax = Number.isFinite(rawMax) ? rawMax : Math.max(safeMin + 100, 100);

  // Unify tip and eli12
  const tip = rawTip || eli12 || (ruleOfThumb ? `Rule of Thumb: ${ruleOfThumb}` : undefined);

  // Unify derived display
  let derived = rawDerived;
  if (!derived && format) {
    if (format === 'money') {
      derived = `$${safeValue.toLocaleString('en-US')}`;
    } else if (format === 'pct') {
      derived = `${safeValue}%`;
    }
  }

  const effectiveMin = Math.min(safeMin, 0); // Always allow sliding down to 0 if user wants to zero it out
  const currentMax = Number.isFinite(Math.max(safeMax, safeValue)) ? Math.max(safeMax, safeValue) : 100;
  const currentMin = Number.isFinite(Math.min(effectiveMin, safeValue)) ? Math.min(effectiveMin, safeValue) : 0;
  const isZero = safeValue === 0 || isNaN(safeValue);

  // Border & background based on realistic/extreme range status
  let borderColor = isCore ? '#dcd8ce' : '#e5e7eb';
  let bgColor = isCore ? '#fcfbf7' : 'transparent';
  let inputBorderColor = undefined;

  if (warnStatus === 'bad') {
    borderColor = '#ef4444';
    bgColor = '#fef2f2';
    inputBorderColor = '#ef4444';
  } else if (warnStatus === 'warn') {
    borderColor = '#f59e0b';
    bgColor = '#fffbeb';
    inputBorderColor = '#f59e0b';
  } else if (isCore && isZero) {
    borderColor = '#e2d9c8';
    bgColor = '#fffdfa';
    inputBorderColor = '#d97706';
  }

  const showDashedZeroBorder = isCore && isZero && warnStatus === 'normal';

  return (
    <div
      className="field-group"
      style={{
        position: 'relative',
        borderRadius: '8px',
        padding: isCore || warnStatus !== 'normal' ? '10px 12px' : '4px 0',
        marginBottom: isCore || warnStatus !== 'normal' ? '14px' : '16px',
        border: showDashedZeroBorder
          ? '1.5px dashed ' + borderColor
          : (isCore || warnStatus !== 'normal' ? '1.5px solid ' + borderColor : 'none'),
        background: bgColor,
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <div className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            onClick={() => tip && setShowTip(!showTip)}
            onMouseEnter={() => tip && setShowTip(true)}
            onMouseLeave={() => tip && setShowTip(false)}
            style={{
              fontWeight: isCore ? 600 : 500,
              color: warnStatus === 'bad' ? '#b91c1c' : warnStatus === 'warn' ? '#92400e' : isCore ? '#185fa5' : '#2c2c2a',
              cursor: tip ? 'help' : 'default',
              borderBottom: tip ? '1px dotted #9ca3af' : 'none',
            }}
          >
            {label} {tip && <span style={{ fontSize: '10px', opacity: 0.65 }}>💡</span>}
          </span>

          {isZero && isCore && (
            <span
              style={{
                fontSize: '10px',
                background: '#fef3c7',
                color: '#92400e',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid #fde68a',
                fontWeight: 600,
              }}
            >
              $0 / Not entered
            </span>
          )}

          {warnStatus === 'bad' && warnMessage && (
            <span
              style={{
                fontSize: '10px',
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid #fca5a5',
                fontWeight: 700,
              }}
            >
              🛑 {warnMessage}
            </span>
          )}

          {warnStatus === 'warn' && warnMessage && (
            <span
              style={{
                fontSize: '10px',
                background: '#fef3c7',
                color: '#92400e',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid #fde68a',
                fontWeight: 700,
              }}
            >
              ⚠️ {warnMessage}
            </span>
          )}

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
                cursor: 'help',
              }}
              title={`Formula component: ${formulaBadge}. Explains how this value factors into underwriting.`}
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
          value={isNaN(safeValue) ? '' : safeValue}
          step={step}
          inputMode="decimal"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(0);
              return;
            }
            const parsed = parseFloat(raw);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
          placeholder="0"
          style={{
            borderColor: inputBorderColor || (isCore && isZero ? '#d97706' : undefined),
          }}
        />
        <input
          type="range"
          id={`${id}-r`}
          min={Number.isFinite(currentMin) ? currentMin : 0}
          max={Number.isFinite(currentMax) ? currentMax : 100}
          step={step}
          value={isNaN(safeValue) ? 0 : safeValue}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
        />
      </div>
    </div>
  );
};
