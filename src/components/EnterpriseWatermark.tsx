import React from 'react';

export const EnterpriseWatermark: React.FC = () => {
  return (
    <div className="enterprise-mark" aria-label="Newcombe Enterprises">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.2 12 3l9 8.2V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.8Z" />
      </svg>
      <span>Newcombe Enterprises</span>
    </div>
  );
};
