import React, { useState } from 'react';
import { money } from '../utils/calc';

interface RehabChecklistProps {
  onApplyToFlip: (rehabTotal: number) => void;
}

const REHAB_CATEGORIES = [
  { id: 'rs-roof', label: 'Roof' },
  { id: 'rs-found', label: 'Foundation / structure' },
  { id: 'rs-hvac', label: 'HVAC' },
  { id: 'rs-elec', label: 'Electrical / panel' },
  { id: 'rs-plumb', label: 'Plumbing / sewer line' },
  { id: 'rs-water', label: 'Water heater' },
  { id: 'rs-window', label: 'Windows / doors' },
  { id: 'rs-kitch', label: 'Kitchen' },
  { id: 'rs-bath', label: 'Bathrooms' },
  { id: 'rs-floor', label: 'Flooring' },
  { id: 'rs-paintI', label: 'Interior paint / drywall' },
  { id: 'rs-paintE', label: 'Exterior paint / siding' },
  { id: 'rs-land', label: 'Landscaping / exterior' },
  { id: 'rs-mold', label: 'Mold / water damage' },
  { id: 'rs-permit', label: 'Permits / dumpster / misc' }
];

export const RehabChecklist: React.FC<RehabChecklistProps> = ({ onApplyToFlip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [contingency, setContingency] = useState(15);

  const subtotal = REHAB_CATEGORIES.reduce((acc, cat) => acc + (values[cat.id] || 0), 0);
  const total = subtotal * (1 + contingency / 100);

  const handleValueChange = (catId: string, val: number) => {
    const updated = { ...values, [catId]: val };
    setValues(updated);
    const newSub = REHAB_CATEGORIES.reduce((acc, cat) => acc + (updated[cat.id] || 0), 0);
    const newTot = Math.round(newSub * (1 + contingency / 100));
    if (newTot > 0) {
      onApplyToFlip(newTot);
    }
  };

  const handleContingencyChange = (c: number) => {
    setContingency(c);
    const newTot = Math.round(subtotal * (1 + c / 100));
    if (newTot > 0) {
      onApplyToFlip(newTot);
    }
  };

  return (
    <div className="tool">
      <button
        type="button"
        className="tool-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Rehab Scope &amp; Walkthrough Checklist <span className="chev">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="tool-body show">
          <div className="tool-hint">
            Work down the list on the walkthrough. Every number entered updates the property rehab budget and 70% Wholesale MMAO <b>live</b> in real time.
          </div>
          {REHAB_CATEGORIES.map((cat) => (
            <div className="mini-row" key={cat.id}>
              <label>{cat.label}</label>
              <input
                type="number"
                id={cat.id}
                value={values[cat.id] || ''}
                step={500}
                placeholder="0"
                onChange={(e) => handleValueChange(cat.id, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}

          <div className="mini-row">
            <label><b>Contingency %</b></label>
            <input
              type="number"
              value={contingency || ''}
              step={5}
              onChange={(e) => handleContingencyChange(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="tool-total">
            <span>Scope Total (Live Synced)</span>
            <span className="v">{money(total)}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#27500a', fontWeight: 600, marginTop: '4px', textAlign: 'right' }}>
            ✓ Live linked to Fix &amp; Flip &amp; Wholesale MMAO
          </div>
        </div>
      )}
    </div>
  );
};
