import React, { useState, useEffect } from 'react';
import { money } from '../utils/calc';

interface HoldingCostsProps {
  propertyTI: number;
  onTIChange: (ti: number) => void;
  months: number;
  purchasePrice?: number;
  onHoldingChange: (monthlyHold: number, months: number) => void;
}

export const HoldingCosts: React.FC<HoldingCostsProps> = ({
  propertyTI,
  onTIChange,
  months: initialMonths,
  purchasePrice = 200000,
  onHoldingChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loan, setLoan] = useState(purchasePrice > 0 ? Math.round(purchasePrice * 0.8) : 150000);
  const [rate, setRate] = useState(11);
  const [points, setPoints] = useState(2);
  const [months, setMonths] = useState(initialMonths || 6);
  const [util, setUtil] = useState(150);
  const [other, setOther] = useState(0);

  // Sync loan with purchase price if loan is 0
  useEffect(() => {
    if (loan === 0 && purchasePrice > 0) {
      const l = Math.round(purchasePrice * 0.8);
      setLoan(l);
      updateCarry(l, rate, months, propertyTI, util, other);
    }
  }, [purchasePrice]);

  const monthlyInterest = (loan * (rate / 100)) / 12;
  const monthlyCarry = monthlyInterest + propertyTI + util + other;
  const pointsAmount = (loan * points) / 100;
  const totalCarry = monthlyCarry * months;
  const allInCarry = totalCarry + pointsAmount;

  const updateCarry = (
    newLoan: number,
    newRate: number,
    newMonths: number,
    newTI: number,
    newUtil: number,
    newOther: number
  ) => {
    const mInterest = (newLoan * (newRate / 100)) / 12;
    const mCarry = Math.round(mInterest + newTI + newUtil + newOther);
    onHoldingChange(mCarry, newMonths);
  };

  return (
    <div className="tool">
      <button
        type="button"
        className="tool-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Holding &amp; Financing Costs <span className="chev">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="tool-body show">
          <div className="tool-hint">
            The costs that quietly eat a flip. Every change here updates Fix &amp; Flip holding costs and property taxes <b>live</b> in real time.
          </div>
          <div className="mini-row">
            <label>Loan amount (Hard money)</label>
            <input
              type="number"
              value={loan || ''}
              step={5000}
              placeholder="0"
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setLoan(v);
                updateCarry(v, rate, months, propertyTI, util, other);
              }}
            />
          </div>
          {purchasePrice > 0 && (
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const l = Math.round(purchasePrice * 0.8);
                  setLoan(l);
                  updateCarry(l, rate, months, propertyTI, util, other);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔄 Auto-Set Loan to 80% Purchase ({money(purchasePrice * 0.8)})
              </button>
            </div>
          )}
          <div className="mini-row">
            <label>Lender rate %</label>
            <input
              type="number"
              value={rate || ''}
              step={0.5}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setRate(v);
                updateCarry(loan, v, months, propertyTI, util, other);
              }}
            />
          </div>
          <div className="mini-row">
            <label>Lender points %</label>
            <input
              type="number"
              value={points || ''}
              step={0.5}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setPoints(v);
              }}
            />
          </div>
          <div className="mini-row">
            <label>Months held</label>
            <input
              type="number"
              value={months || ''}
              step={1}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setMonths(v);
                updateCarry(loan, rate, v, propertyTI, util, other);
              }}
            />
          </div>
          <div className="mini-row">
            <label>Taxes + insurance /mo (Live Synced)</label>
            <input
              type="number"
              value={propertyTI || ''}
              step={25}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                onTIChange(v);
                updateCarry(loan, rate, months, v, util, other);
              }}
            />
          </div>
          <div className="mini-row">
            <label>Utilities /mo</label>
            <input
              type="number"
              value={util || ''}
              step={25}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setUtil(v);
                updateCarry(loan, rate, months, propertyTI, v, other);
              }}
            />
          </div>
          <div className="mini-row">
            <label>Other /mo (HOA, lawn, security)</label>
            <input
              type="number"
              value={other || ''}
              step={25}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setOther(v);
                updateCarry(loan, rate, months, propertyTI, util, v);
              }}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="detail-row">
              <span className="lbl">Interest / mo</span>
              <span className="val">{money(monthlyInterest)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Taxes + insurance / mo</span>
              <span className="val">{money(propertyTI)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Utilities / mo</span>
              <span className="val">{money(util)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Other / mo</span>
              <span className="val">{money(other)}</span>
            </div>
            <div className="tool-total">
              <span>Monthly carry (Live Synced)</span>
              <span className="v">{money(monthlyCarry)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Lender points (one time)</span>
              <span className="val">{money(pointsAmount)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Total carry over {months} mo</span>
              <span className="val">{money(totalCarry)}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">Carry + points</span>
              <span className="val">{money(allInCarry)}</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#27500a', fontWeight: 600, marginTop: '8px', textAlign: 'right' }}>
            ✓ Live linked to Fix &amp; Flip holding costs &amp; Property T&amp;I
          </div>
        </div>
      )}
    </div>
  );
};
