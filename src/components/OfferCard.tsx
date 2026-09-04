import React from 'react';
import { OfferRange } from '../types';
import { money } from '../utils/calc';

interface OfferCardProps {
  range: OfferRange;
  title?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({ range, title }) => {
  return (
    <div className="offer-card">
      {title && (
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#185fa5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          {title}
        </div>
      )}
      <div className="offer-grid">
        <div className="offer-cell anchor">
          <div className="lab">Anchor (Opening)</div>
          <div className="amt">{range.anchor !== null ? money(range.anchor) : '--'}</div>
        </div>
        <div className="offer-cell target">
          <div className="lab">Target (Sweet Spot)</div>
          <div className="amt">{range.target !== null ? money(range.target) : '--'}</div>
        </div>
        <div className="offer-cell mao">
          <div className="lab">MMAO (Max Offer)</div>
          <div className="amt">{range.mao !== null ? money(range.mao) : '--'}</div>
        </div>
      </div>
      <div
        className={`offer-note ${range.status === 'warn' ? 'warn' : range.status === 'bad' ? 'bad' : ''}`}
        dangerouslySetInnerHTML={{ __html: range.note }}
      />
    </div>
  );
};
