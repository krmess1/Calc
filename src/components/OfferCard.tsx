import React from 'react';
import { OfferRange } from '../types';
import { money } from '../utils/calc';
import { InfoTip } from './InfoTip';

interface OfferCardProps {
  range: OfferRange;
  title?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({ range, title }) => {
  return (
    <div className="offer-card">
      {title && (
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#185fa5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', padding: '0 12px', paddingTop: '10px' }}>
          {title}
        </div>
      )}
      <div className="offer-grid">
        <div className="offer-cell anchor" style={{ padding: '13px 10px' }}>
          <div className="lab" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Anchor (Opening)</span>
            <InfoTip
              title="Anchor Offer (Opening Bid)"
              eli12="Your opening bid to the seller! Start here so you have plenty of room to negotiate upward. If they accept immediately, you make huge bonus cash."
              ruleOfThumb="Usually 80% of MMAO or 20% below asking price."
              example={range.anchor !== null ? `Start negotiation at ${money(range.anchor)}.` : undefined}
              size="sm"
              placement="bottom"
            />
          </div>
          <div className="amt">{range.anchor !== null ? money(range.anchor) : '--'}</div>
        </div>

        <div className="offer-cell target" style={{ padding: '13px 10px' }}>
          <div className="lab" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Target (Sweet Spot)</span>
            <InfoTip
              title="Target Offer (Sweet Spot)"
              eli12="The realistic price where 80% of wholesale contracts actually get signed. Gives you your full desired wholesale fee and leaves enough meat on the bone for your cash buyer."
              ruleOfThumb="Walk up slowly from your Anchor toward this Target."
              example={range.target !== null ? `Aim to close at ${money(range.target)}.` : undefined}
              size="sm"
              placement="bottom"
            />
          </div>
          <div className="amt">{range.target !== null ? money(range.target) : '--'}</div>
        </div>

        <div className="offer-cell mao" style={{ padding: '13px 10px' }}>
          <div className="lab" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>MMAO (Max Offer)</span>
            <InfoTip
              title="MMAO (Maximum Allowable Offer)"
              eli12="Your hard ceiling! If the seller won't agree to this number or lower, DO NOT BUY for this strategy. You will lose money or fail to find a buyer."
              ruleOfThumb="If seller wants more than MMAO, switch to creative financing (Seller Finance or Sub-To) instead of overpaying cash."
              example={range.mao !== null ? `Do not exceed ${money(range.mao)}.` : undefined}
              size="sm"
              placement="bottom"
            />
          </div>
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

