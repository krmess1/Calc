import React, { useState } from 'react';
import { NetSheetInputs } from '../types';
import { money } from '../utils/calc';

interface SellerNetSheetProps {
  contractPrice: number;
  payoff: number;
  liens: number;
  closeP: number;
  credits: number;
  onUpdate: (field: 'netPayoff' | 'netLiens' | 'netClosePct' | 'netCredits', value: number) => void;
}

export const SellerNetSheet: React.FC<SellerNetSheetProps> = ({
  contractPrice,
  payoff,
  liens,
  closeP,
  credits,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closing = (contractPrice * closeP) / 100;
  const net = contractPrice - payoff - liens - closing - credits;

  return (
    <div className="tool">
      <button
        type="button"
        className="tool-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Seller Net Sheet <span className="chev">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="tool-body show">
          <div className="tool-hint">
            What the seller actually walks away with. Fully live and synced with the active property contract price.
          </div>
          <div className="mini-row">
            <label>Mortgage payoff (Live Synced)</label>
            <input
              type="number"
              value={payoff || ''}
              step={1000}
              placeholder="0"
              onChange={(e) => onUpdate('netPayoff', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mini-row">
            <label>Liens / back taxes</label>
            <input
              type="number"
              value={liens || ''}
              step={500}
              placeholder="0"
              onChange={(e) => onUpdate('netLiens', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mini-row">
            <label>Seller closing costs %</label>
            <input
              type="number"
              value={closeP || ''}
              step={0.5}
              onChange={(e) => onUpdate('netClosePct', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mini-row">
            <label>Credits to buyer</label>
            <input
              type="number"
              value={credits || ''}
              step={500}
              placeholder="0"
              onChange={(e) => onUpdate('netCredits', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="detail-row">
              <span className="lbl">Contract price (Live Synced)</span>
              <span className="val">{money(contractPrice)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Mortgage payoff</span>
              <span className="val">-{money(payoff)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Liens / back taxes</span>
              <span className="val">-{money(liens)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Seller closing ({closeP}%)</span>
              <span className="val">-{money(closing)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Credits to buyer</span>
              <span className="val">-{money(credits)}</span>
            </div>
            <div className="tool-total">
              <span>Seller walks with (Live)</span>
              <span className={`v ${net >= 0 ? 'pos' : 'neg'}`}>{money(net)}</span>
            </div>

            {net < 0 && (
              <div className="guide">
                <strong>This is a short sale</strong>
                The payoff and costs exceed the price. Nothing closes here without lender approval on a reduced payoff, and that is a different deal with a different timeline.
              </div>
            )}
            {contractPrice > 0 && net >= 0 && net < contractPrice * 0.08 && (
              <div className="guide">
                <strong>Very little left for the seller</strong>
                Under 8% of the contract price is reaching them. Expect resistance, and be ready to walk them through this line by line rather than defending your offer number.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
