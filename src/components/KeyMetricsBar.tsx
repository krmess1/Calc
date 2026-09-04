import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  positive?: boolean;
}

interface KeyMetricsBarProps {
  metrics: MetricCardProps[];
}

export const KeyMetricsBar: React.FC<KeyMetricsBarProps> = ({ metrics }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        marginBottom: '16px',
      }}
    >
      {metrics.map((m, idx) => (
        <div
          key={idx}
          style={{
            background: m.highlight ? '#fcfbf7' : '#ffffff',
            border: m.highlight ? '1.5px solid #27500a' : '1px solid #dcd8ce',
            borderRadius: '8px',
            padding: '10px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              color: '#666',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            {m.label}
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: m.positive !== undefined ? (m.positive ? '#27500a' : '#b3261e') : '#111',
              lineHeight: 1.1,
            }}
          >
            {m.value}
          </div>
          {m.sub && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#888',
                marginTop: '4px',
              }}
            >
              {m.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
