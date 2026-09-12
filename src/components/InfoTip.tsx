import React, { useState, useRef, useEffect } from 'react';

export interface InfoTipProps {
  title: string;
  eli12: string;            // Explain Like I'm 12 / In Plain English
  formula?: string;          // Optional mathematical formula breakdown
  ruleOfThumb?: string;      // Rule of thumb / threshold
  example?: string;          // Concrete dollar example
  size?: 'sm' | 'md';        // Icon size
  placement?: 'top' | 'bottom' | 'auto'; // Placement direction
  className?: string;
}

/**
 * Clean, non-intrusive circular info badge ("i") matching RangeInput styling.
 * Only opens when clicked (or optionally hovered if desired), so it doesn't
 * annoyingly pop up when users move their mouse across the screen.
 */
export const InfoTip: React.FC<InfoTipProps> = ({
  title,
  eli12,
  formula,
  ruleOfThumb,
  example,
  size = 'md',
  placement = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState<'top' | 'bottom'>('top');
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine top vs bottom on open
  useEffect(() => {
    if (!isOpen) return;
    if (placement === 'top') {
      setResolvedPlacement('top');
    } else if (placement === 'bottom') {
      setResolvedPlacement('bottom');
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If within top 220px of viewport or near top of screen/card, show below to prevent clipping
      if (rect.top < 220) {
        setResolvedPlacement('bottom');
      } else {
        setResolvedPlacement('top');
      }
    }
  }, [isOpen, placement]);

  // Close on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const buttonSize = size === 'sm' ? '15px' : '17px';
  const fontSize = size === 'sm' ? '10px' : '11px';

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        marginLeft: '4px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Info: ${title}`}
        title={`Click for explanation: ${title}`}
        style={{
          background: isOpen ? '#185fa5' : '#f0eee6',
          color: isOpen ? '#ffffff' : '#555555',
          border: isOpen ? '1px solid #185fa5' : '1px solid #d3d1c7',
          borderRadius: '50%',
          width: buttonSize,
          height: buttonSize,
          minWidth: buttonSize,
          fontSize: fontSize,
          fontFamily: 'serif',
          fontStyle: 'italic',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          fontWeight: 700,
          boxShadow: isOpen ? '0 0 0 2px rgba(24, 95, 165, 0.2)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        i
      </button>

      {/* Floating Info Tooltip */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          style={{
            position: 'absolute',
            ...(resolvedPlacement === 'top'
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            left: '50%',
            transform: 'translateX(-50%)',
            width: '290px',
            maxWidth: '85vw',
            background: '#111827',
            color: '#f9fafb',
            padding: '12px 14px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
            zIndex: 100005,
            textAlign: 'left',
            fontSize: '12px',
            lineHeight: 1.45,
            border: '1px solid #374151',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #374151',
              paddingBottom: '6px',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  background: '#374151',
                  color: '#93c5fd',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  fontSize: '10px',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                i
              </span>
              <span style={{ fontWeight: 800, color: '#facc15', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close info tip"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Explain Like I'm 12 */}
          <div style={{ color: '#e5e7eb', marginBottom: '8px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>In Plain English: </span>
            {eli12}
          </div>

          {/* Formula Breakdown if present */}
          {formula && (
            <div
              style={{
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '6px 8px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#a7f3d0',
                marginBottom: '8px',
              }}
            >
              <strong>Formula: </strong>{formula}
            </div>
          )}

          {/* Rule of Thumb */}
          {ruleOfThumb && (
            <div style={{ fontSize: '11px', color: '#fbbf24', marginBottom: example ? '6px' : '0' }}>
              <strong>🎯 Rule of Thumb: </strong>{ruleOfThumb}
            </div>
          )}

          {/* Example */}
          {example && (
            <div style={{ fontSize: '11px', color: '#93c5fd', borderTop: '1px dashed #374151', paddingTop: '6px', marginTop: '6px' }}>
              <strong>Example: </strong>{example}
            </div>
          )}

          {/* Arrow Pointer */}
          <div
            style={{
              position: 'absolute',
              ...(resolvedPlacement === 'top'
                ? {
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: '#111827 transparent transparent transparent',
                  }
                : {
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: 'transparent transparent #111827 transparent',
                  }),
            }}
          />
        </div>
      )}
    </div>
  );
};
