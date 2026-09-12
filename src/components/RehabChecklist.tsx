import React, { useState, useEffect } from 'react';
import { money } from '../utils/calc';

interface RehabChecklistProps {
  currentRehab?: number;
  onApplyToFlip: (rehabTotal: number) => void;
}

const REHAB_CATEGORIES = [
  { id: 'rs-roof', label: 'Roof / Gutters', defaultPct: 0.15 },
  { id: 'rs-found', label: 'Foundation / Structure', defaultPct: 0 },
  { id: 'rs-hvac', label: 'HVAC Heating & Cooling', defaultPct: 0.10 },
  { id: 'rs-elec', label: 'Electrical / Panel', defaultPct: 0.05 },
  { id: 'rs-plumb', label: 'Plumbing / Sewer line', defaultPct: 0.05 },
  { id: 'rs-water', label: 'Water Heater', defaultPct: 0.03 },
  { id: 'rs-window', label: 'Windows / Exterior Doors', defaultPct: 0.05 },
  { id: 'rs-kitch', label: 'Kitchen (Cabinets/Counters/Appliances)', defaultPct: 0.20 },
  { id: 'rs-bath', label: 'Bathrooms (Vanity/Tile/Tub)', defaultPct: 0.12 },
  { id: 'rs-floor', label: 'Flooring (LVP / Carpet / Tile)', defaultPct: 0.10 },
  { id: 'rs-paintI', label: 'Interior Paint / Drywall', defaultPct: 0.08 },
  { id: 'rs-paintE', label: 'Exterior Paint / Siding', defaultPct: 0.05 },
  { id: 'rs-land', label: 'Landscaping / Curb Appeal', defaultPct: 0.02 },
  { id: 'rs-mold', label: 'Mold / Water Remediation', defaultPct: 0 },
  { id: 'rs-permit', label: 'Permits / Dumpster / Cleanout', defaultPct: 0.05 }
];

export const RehabChecklist: React.FC<RehabChecklistProps> = ({ currentRehab = 35000, onApplyToFlip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [contingency, setContingency] = useState(10);

  // Auto-distribute initial rehab if values are blank
  useEffect(() => {
    const hasValues = Object.values(values).some((v) => Number(v) > 0);
    if (!hasValues && currentRehab > 0) {
      applyPresetBudget(currentRehab, contingency, false);
    }
  }, [currentRehab]);

  const applyPresetBudget = (targetBudget: number, cont = contingency, notify = true) => {
    const baseBudget = Math.round(targetBudget / (1 + cont / 100));
    const newValues: Record<string, number> = {};
    
    // Distribute according to default percentages rounded to nearest $250
    REHAB_CATEGORIES.forEach((cat) => {
      newValues[cat.id] = Math.round((baseBudget * cat.defaultPct) / 250) * 250;
    });
    setValues(newValues);

    const newSub = Object.values(newValues).reduce((a, b) => a + b, 0);
    const calculatedTotal = Math.round(newSub * (1 + cont / 100));
    if (notify) {
      onApplyToFlip(calculatedTotal);
    }
  };

  const subtotal = REHAB_CATEGORIES.reduce((acc, cat) => acc + (values[cat.id] || 0), 0);
  const total = Math.round(subtotal * (1 + contingency / 100));

  const handleValueChange = (catId: string, val: number) => {
    const updated = { ...values, [catId]: val };
    setValues(updated);
    const newSub = REHAB_CATEGORIES.reduce((acc, cat) => acc + (updated[cat.id] || 0), 0);
    const newTot = Math.round(newSub * (1 + contingency / 100));
    onApplyToFlip(newTot);
  };

  const handleContingencyChange = (c: number) => {
    setContingency(c);
    const newTot = Math.round(subtotal * (1 + c / 100));
    onApplyToFlip(newTot);
  };

  return (
    <div className="tool">
      <button
        type="button"
        className="tool-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        Rehab Scope &amp; Walkthrough Checklist ({money(total)}) — Fix &amp; Flip Only <span className="chev">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="tool-body show">
          <div className="tool-hint">
            <strong>Fix &amp; Flip Scope of Work:</strong> Work down this checklist during or after your property walkthrough. Entries update your universal rehab budget and 70% Fix &amp; Flip Wholesale MMAO in real time.
            <div style={{ marginTop: '4px', color: '#b45309', fontWeight: 600 }}>
              ⚠️ DSCR Lending Rule: Standard DSCR rental loans require <strong>rent-ready / turnkey</strong> condition ($0 to light cosmetic work). Lenders will not fund heavy rehabs. For heavy fixers, sell to a cash flipper on the Fix &amp; Flip tab!
            </div>
          </div>

          {/* Quick Scope Presets */}
          <div style={{ marginBottom: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              ⚡ Quick Rehab Scope Presets (Auto-Fills Line Items):
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setValues({});
                  onApplyToFlip(0);
                }}
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#15803d',
                }}
                title="DSCR standard: $0 rehab for rent-ready rentals"
              >
                🏠 Turnkey / $0 (DSCR Standard)
              </button>
              <button
                type="button"
                onClick={() => applyPresetBudget(15000, 10, true)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#1e293b',
                }}
              >
                🧹 Light Cosmetic ($15k)
              </button>
              <button
                type="button"
                onClick={() => applyPresetBudget(35000, 10, true)}
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #93c5fd',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#1d4ed8',
                }}
              >
                🔨 Standard Flip / Turn ($35k)
              </button>
              <button
                type="button"
                onClick={() => applyPresetBudget(65000, 15, true)}
                style={{
                  background: '#fff7ed',
                  border: '1.5px solid #fdba74',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#c2410c',
                }}
              >
                🏗️ Heavy Rehab / Full Gut ($65k)
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues({});
                  onApplyToFlip(0);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                Reset to $0
              </button>
            </div>
          </div>

          {REHAB_CATEGORIES.map((cat) => (
            <div className="mini-row" key={cat.id}>
              <label>{cat.label}</label>
              <input
                type="number"
                id={cat.id}
                value={values[cat.id] || ''}
                step={250}
                placeholder="0"
                onChange={(e) => handleValueChange(cat.id, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}

          <div className="mini-row">
            <label><b>Contingency Buffer %</b> (Overruns/Hidden defects)</label>
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
            ✓ Universally linked to Fix &amp; Flip, Rehab Scope, &amp; 70% Wholesale MMAO
          </div>
        </div>
      )}
    </div>
  );
};
