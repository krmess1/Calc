import React, { useState } from 'react';
import { StrategyTab, DSCRInputs, SFInputs, STInputs, FFInputs, UniversalProperty } from './types';
import {
  money,
  atDSCR,
  calcDSCROffer,
  atSF,
  calcSFOffer,
  atST,
  calcSTOffer,
  atFF,
  calcFFOffer,
  calcMMAOBreakdown,
} from './utils/calc';
import { Splash } from './components/Splash';
import { RangeInput } from './components/RangeInput';
import { OfferCard } from './components/OfferCard';
import { SellerNetSheet } from './components/SellerNetSheet';
import { RehabChecklist } from './components/RehabChecklist';
import { HoldingCosts } from './components/HoldingCosts';
import { CompareTab } from './components/CompareTab';
import { GuideTab } from './components/GuideTab';
import { KeyMetricsBar } from './components/KeyMetricsBar';
import { ShareModal } from './components/ShareModal';
import { GoogleDrivePanel } from './components/GoogleDrivePanel';
import { EnterpriseWatermark } from './components/EnterpriseWatermark';
import { SinglePropertyHeader } from './components/SinglePropertyHeader';
import { LiveMMAOBar } from './components/LiveMMAOBar';

const DEFAULT_PROPERTY: UniversalProperty = {
  address: '124 Maple Avenue, Tampa, FL',
  purchasePrice: 200000,
  propertyValue: 260000,
  rent: 1800,
  occupancy: 85,
  taxesAndInsurance: 450,
  assignmentFee: 5000,
  rehab: 35000,

  // DSCR Specific
  dscrDown: 20,
  dscrRate: 7.0,
  dscrTerm: 30,
  dscrOpex: 150,

  // Seller Finance Specific
  sfDown: 10,
  sfRate: 0,
  sfBalloon: 6,
  sfAmort: 30,
  sfAppr: 3,

  // Subject-To Specific
  stMortgageBalance: 150000,
  stRate: 4.5,
  stMonthsRemaining: 330,
  stCashToSeller: 10000,

  // Fix & Flip Specific
  ffHoldMonthly: 900,
  ffMonths: 6,
  ffRealtorPct: 6,
  ffClosingPct: 3,

  // Seller Net Sheet Specific
  netPayoff: 150000,
  netLiens: 0,
  netClosePct: 2,
  netCredits: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<StrategyTab>('dscr');

  // Single Universal Property State
  const [property, setProperty] = useState<UniversalProperty>(DEFAULT_PROPERTY);

  // Accordion details toggle states
  const [dscrExpanded, setDscrExpanded] = useState(false);
  const [sfExpanded, setSfExpanded] = useState(false);
  const [stExpanded, setStExpanded] = useState(false);
  const [ffExpanded, setFfExpanded] = useState(false);

  // Share Modal state
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Universal updater helper
  const updateProperty = <K extends keyof UniversalProperty>(key: K, value: UniversalProperty[K]) => {
    setProperty((prev) => {
      const updated = { ...prev, [key]: value };
      // Keep mortgage balance and net payoff linked if not explicitly diverged
      if (key === 'stMortgageBalance' && prev.netPayoff === prev.stMortgageBalance) {
        updated.netPayoff = value as number;
      }
      return updated;
    });
  };

  // Derive Strategy Inputs from Universal Property
  const dscr: DSCRInputs = {
    purchase: property.purchasePrice,
    down: property.dscrDown,
    rate: property.dscrRate,
    term: property.dscrTerm,
    rent: property.rent,
    occ: property.occupancy,
    ti: property.taxesAndInsurance,
    opex: property.dscrOpex,
    fee: property.assignmentFee,
  };

  const sf: SFInputs = {
    purchase: property.purchasePrice,
    down: property.sfDown,
    rate: property.sfRate,
    balloon: property.sfBalloon,
    amort: property.sfAmort,
    rent: property.rent,
    occ: property.occupancy,
    ti: property.taxesAndInsurance,
    appr: property.sfAppr,
    fee: property.assignmentFee,
  };

  const st: STInputs = {
    value: property.propertyValue,
    mtg: property.stMortgageBalance,
    rate: property.stRate,
    months: property.stMonthsRemaining,
    cash: property.stCashToSeller,
    rent: property.rent,
    occ: property.occupancy,
    ti: property.taxesAndInsurance,
    fee: property.assignmentFee,
  };

  const ff: FFInputs = {
    purchase: property.purchasePrice,
    rehab: property.rehab,
    arv: property.propertyValue,
    hold: property.ffHoldMonthly,
    months: property.ffMonths,
    realtor: property.ffRealtorPct,
    closing: property.ffClosingPct,
    fee: property.assignmentFee,
  };

  // Live Calculations
  const dscrCalc = atDSCR(dscr.purchase, dscr);
  const dscrOffer = calcDSCROffer(dscr);

  const sfCalc = atSF(sf.purchase, sf);
  const sfOffer = calcSFOffer(sf);

  const stCalc = atST(st);
  const stOffer = calcSTOffer(st);

  const ffCalc = atFF(ff.purchase, ff);
  const ffOffer = calcFFOffer(ff);

  const mmaoBreakdown = calcMMAOBreakdown(
    property.propertyValue,
    property.rehab,
    property.assignmentFee,
    property.purchasePrice
  );

  // Viability label helpers
  const getDscrViability = () => {
    if (dscrCalc.dscr >= 1.25 && dscrCalc.coc >= 20) {
      return { cls: 'green', text: 'Ready — lender-safe DSCR and strong return' };
    } else if (dscrCalc.dscr >= 1.0 && dscrCalc.coc >= 8) {
      return { cls: 'yellow', text: 'Borderline — works, but thin' };
    }
    return { cls: 'red', text: 'Not viable as priced — renegotiate or pass' };
  };

  const getSfViability = () => {
    if (sfCalc.cf > 200 && sfCalc.refiOk && sfCalc.coc >= 20) {
      return { cls: 'green', text: 'Ready — cash flows now and the exit works' };
    } else if (sfCalc.cf >= 0 && sfCalc.refiOk) {
      return { cls: 'yellow', text: 'Borderline — exit works, but cash flow is thin' };
    } else if (sfCalc.cf < 0) {
      return { cls: 'red', text: 'Negative cash flow — renegotiate price or rate' };
    }
    return { cls: 'red', text: 'Balloon exit does not clear — no refi at these terms' };
  };

  const getStViability = () => {
    if (stCalc.cf > 200 && stCalc.equity > 0 && stCalc.coc >= 25) {
      return { cls: 'green', text: 'Ready — low cash in, real equity, cash flows' };
    } else if (stCalc.cf >= 0 && stCalc.equity > 0) {
      return { cls: 'yellow', text: 'Borderline — equity is there, cash flow is thin' };
    } else if (stCalc.equity <= 0) {
      return { cls: 'red', text: 'No equity — nothing to capture here' };
    }
    return { cls: 'red', text: 'Negative cash flow — you would be paying to hold it' };
  };

  const getFfViability = () => {
    const mao70 = ff.arv * 0.7 - ff.rehab - ff.fee;
    if (ffCalc.roi >= 20 && ff.purchase <= mao70) {
      return { cls: 'green', text: 'Ready — clears the 70% rule with room' };
    } else if (ffCalc.roi >= 12) {
      return { cls: 'yellow', text: 'Borderline — thin for the risk you carry' };
    }
    return { cls: 'red', text: 'Not enough margin — no room for surprises' };
  };

  return (
    <>
      <Splash />

      <div id="app">
        <div className="calc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Deal Calculator</h1>
            <p>Drag or type. Everything updates live.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              style={{
                background: '#185fa5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(24,95,165,0.2)',
              }}
            >
              📄 Export Tear Sheet / Pipeline
            </button>
          </div>
        </div>

        {/* Single Property Universal Live Header */}
        <SinglePropertyHeader
          property={property}
          mmao={mmaoBreakdown}
          onUpdate={updateProperty}
          onResetProperty={() => setProperty(DEFAULT_PROPERTY)}
        />

        {/* Navigation Tabs */}
        <div className="tabs" role="tablist">
          <button
            type="button"
            className={`tab ${activeTab === 'dscr' ? 'active' : ''}`}
            onClick={() => setActiveTab('dscr')}
          >
            DSCR Rental
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'sf' ? 'active' : ''}`}
            onClick={() => setActiveTab('sf')}
          >
            Seller Finance
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'st' ? 'active' : ''}`}
            onClick={() => setActiveTab('st')}
          >
            Subject-To
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'ff' ? 'active' : ''}`}
            onClick={() => setActiveTab('ff')}
          >
            Fix &amp; Flip
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'cmp' ? 'active' : ''}`}
            onClick={() => setActiveTab('cmp')}
          >
            Compare
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            Guide &amp; Cheat Sheet
          </button>
        </div>

        {/* 1. DSCR Tab */}
        {activeTab === 'dscr' && (
          <div id="dscr-tab" className="tab-panel">
            <KeyMetricsBar
              metrics={[
                { label: 'Total Capital Required', value: money(dscrCalc.cashIn), sub: 'Down payment + assignment fee', highlight: true },
                { label: 'Lender DSCR Ratio', value: dscrCalc.dscr.toFixed(2), sub: dscrCalc.dscr >= 1.25 ? '✓ Meets lender 1.25 bar' : '⚠️ Below 1.25 minimum', positive: dscrCalc.dscr >= 1.25 },
                { label: 'Monthly Cash Flow', value: money(dscrCalc.cf), sub: `At ${dscr.occ}% occupancy`, positive: dscrCalc.cf > 0 },
                { label: 'Cash on Cash Return', value: `${dscrCalc.coc.toFixed(1)}%`, sub: `${money(dscrCalc.cf * 12)}/yr`, positive: dscrCalc.coc >= 20 },
              ]}
            />
            <div className="calc-box">
              <RangeInput
                id="dscr-purchase"
                label="Purchase Price"
                value={property.purchasePrice}
                min={30000}
                max={1000000}
                step={5000}
                derived={money(property.purchasePrice)}
                formulaBadge="Basis"
                tip="The contract price you offer the seller. Universally synced across all tabs & tools."
                isCore={true}
                onChange={(v) => updateProperty('purchasePrice', v)}
              />

              <RangeInput
                id="dscr-rent"
                label="Monthly Rent"
                value={property.rent}
                min={200}
                max={12000}
                step={25}
                derived={`${money(property.rent * 12)}/yr gross`}
                formulaBadge="Gross Rev"
                tip="Check Zillow Rent Zestimate, Rentometer, or actual in-place leases. Universally synced across rental tabs."
                isCore={true}
                onChange={(v) => updateProperty('rent', v)}
              />

              <RangeInput
                id="dscr-down"
                label="Down Payment %"
                value={property.dscrDown}
                min={0}
                max={50}
                step={1}
                derived={`${money(dscrCalc.down)} down · ${money(dscrCalc.loan)} loan`}
                formulaBadge="P × Down%"
                tip="Lenders typically require 20% to 25% down for DSCR investment loans."
                isCore={true}
                onChange={(v) => updateProperty('dscrDown', v)}
              />

              <RangeInput
                id="dscr-rate"
                label="Interest Rate %"
                value={property.dscrRate}
                min={0}
                max={15}
                step={0.125}
                derived={`${money(dscrCalc.pay)}/mo payment`}
                formulaBadge="Loan P&I"
                tip="Current prevailing investor DSCR rates are usually 6.75% to 7.75%."
                isCore={true}
                onChange={(v) => updateProperty('dscrRate', v)}
              />

              <RangeInput
                id="dscr-term"
                label="Loan Term (years)"
                value={property.dscrTerm}
                min={5}
                max={40}
                step={1}
                derived={`${property.dscrTerm * 12} payments`}
                formulaBadge="Amort"
                tip="Standard is 30 years fixed. Some DSCR loans offer interest-only for the first 5–10 years."
                onChange={(v) => updateProperty('dscrTerm', v)}
              />

              <RangeInput
                id="dscr-occ"
                label="Occupancy %"
                value={property.occupancy}
                min={50}
                max={100}
                step={1}
                derived={`${money(dscrCalc.effRent)} effective`}
                formulaBadge="Rent × Occ%"
                tip="80% occupancy is the realistic formula standard. Universally synced across cash flow strategies."
                onChange={(v) => updateProperty('occupancy', v)}
              />

              <RangeInput
                id="dscr-ti"
                label="Taxes + Insurance /mo"
                value={property.taxesAndInsurance}
                min={0}
                max={3000}
                step={25}
                derived={`${money(property.taxesAndInsurance * 12)}/yr`}
                formulaBadge="Fixed Opex"
                tip="Taxes & insurance. Universally synced with holding costs and all strategies."
                onChange={(v) => updateProperty('taxesAndInsurance', v)}
              />

              <RangeInput
                id="dscr-opex"
                label="Other Expenses /mo"
                value={property.dscrOpex}
                min={0}
                max={2000}
                step={25}
                derived={`${money(property.dscrOpex * 12)}/yr`}
                formulaBadge="Maint / Mgmt"
                tip="Budget 8% to 10% for property management plus maintenance reserves."
                onChange={(v) => updateProperty('dscrOpex', v)}
              />

              <RangeInput
                id="dscr-fee"
                label="Your Assignment Fee"
                value={property.assignmentFee}
                min={0}
                max={50000}
                step={500}
                derived="your payday"
                formulaBadge="Cash Out"
                tip="Your assignment fee is paid by the end buyer at closing. Universally synced."
                onChange={(v) => updateProperty('assignmentFee', v)}
              />

              <div className="result-card">
                <div className="result-label">Monthly Cash Flow</div>
                <div className={`result-value ${dscrCalc.cf >= 0 ? 'pos' : 'neg'}`}>
                  {money(dscrCalc.cf)}
                </div>
              </div>

              {(() => {
                const vi = getDscrViability();
                return (
                  <div className={`viability ${vi.cls}`}>
                    <div className="viability-dot" />
                    <span>{vi.text}</span>
                  </div>
                );
              })()}

              <OfferCard range={dscrOffer} />

              <button
                type="button"
                className="expand-btn"
                onClick={() => setDscrExpanded(!dscrExpanded)}
              >
                {dscrExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {dscrExpanded && (
                <div className="expanded-content">
                  <div className="detail-head">The math</div>
                  <div className="detail-row">
                    <span className="lbl">Down payment ({dscr.down}%)</span>
                    <span className="val">{money(dscrCalc.down)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Loan amount</span>
                    <span className="val">{money(dscrCalc.loan)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Monthly P&amp;I</span>
                    <span className="val">{money(dscrCalc.pay)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Gross rent</span>
                    <span className="val">{money(dscr.rent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">At {dscr.occ}% occupancy</span>
                    <span className="val">{money(dscrCalc.effRent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Taxes + insurance</span>
                    <span className="val">-{money(dscr.ti)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Other expenses</span>
                    <span className="val">-{money(dscr.opex)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">NOI (monthly)</span>
                    <span className="val">{money(dscrCalc.noi)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash flow after debt</span>
                    <span className={`val ${dscrCalc.cf >= 0 ? 'pos' : 'neg'}`}>{money(dscrCalc.cf)}</span>
                  </div>

                  <div className="detail-head">The ratios lenders look at</div>
                  <div className="detail-row">
                    <span className="lbl">DSCR</span>
                    <span className={`val ${dscrCalc.dscr >= 1.25 ? 'pos' : 'neg'}`}>{dscrCalc.dscr.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cap rate</span>
                    <span className="val">{dscrCalc.capRate.toFixed(2)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash-on-cash</span>
                    <span className={`val ${dscrCalc.coc >= 20 ? 'pos' : 'neg'}`}>{dscrCalc.coc.toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash in deal</span>
                    <span className="val">{money(dscrCalc.cashIn)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Annual cash flow</span>
                    <span className={`val ${dscrCalc.cf >= 0 ? 'pos' : 'neg'}`}>{money(dscrCalc.cf * 12)}</span>
                  </div>

                  <div className="detail-head">Does it clear the bar?</div>
                  <div className={`criteria-item ${dscrCalc.dscr >= 1.25 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {dscrCalc.dscr >= 1.25 ? '✓' : '✗'} <span>DSCR at or above 1.25 — this is the number the lender underwrites to</span>
                  </div>
                  <div className={`criteria-item ${dscrCalc.coc >= 20 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {dscrCalc.coc >= 20 ? '✓' : '✗'} <span>Cash-on-cash 20% or better</span>
                  </div>
                  <div className={`criteria-item ${dscrCalc.cf > 0 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {dscrCalc.cf > 0 ? '✓' : '✗'} <span>Positive monthly cash flow at {dscr.occ}% occupancy</span>
                  </div>
                  <div className={`criteria-item ${dscr.occ <= 85 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {dscr.occ <= 85 ? '✓' : '✗'} <span>Occupancy assumption is conservative (85% or lower)</span>
                  </div>

                  <div className="guide">
                    <strong>How to read this</strong>
                    {dscrCalc.dscr < 1.25
                      ? 'DSCR is the whole game here. Below 1.25 most lenders will not fund it, so the fix is a lower price or a bigger down payment — not more rent. Drop the price until DSCR clears 1.25, and that number is your offer.'
                      : 'DSCR clears the lender bar. Now the question is your return: if cash-on-cash is under 20%, the deal is safe but your money is working slowly. Push the price down to buy the return up.'}
                  </div>

                  <div className="guide">
                    <strong>Before you commit</strong>
                    Rent at 100% occupancy is a fantasy number. This model runs at {dscr.occ}%. If the seller quotes rents higher than local comps, verify with actual leases before you use them.
                  </div>
                </div>
              )}
            </div>

            <div className="buyer-pays">
              <div className="buyer-pays-label">Buyer Pays (price + your fee)</div>
              <div className="buyer-pays-value">{money(dscr.purchase + dscr.fee)}</div>
            </div>
          </div>
        )}

        {/* 2. Seller Finance Tab */}
        {activeTab === 'sf' && (
          <div id="sf-tab" className="tab-panel">
            <KeyMetricsBar
              metrics={[
                { label: 'Down + Your Fee', value: money(sfCalc.down + sf.fee), sub: `${money(sfCalc.down)} to seller · ${money(sf.fee)} fee`, highlight: true },
                { label: 'Monthly Cash Flow', value: money(sfCalc.cf), sub: `At ${sf.occ}% occupancy`, positive: sfCalc.cf > 0 },
                { label: 'Balloon Refi Test', value: sfCalc.refiOk ? 'Pass' : 'Shortfall', sub: sfCalc.refiOk ? '75% LTV covers balloon' : `Short ${money(sfCalc.bal - sfCalc.fv * 0.75)}`, positive: sfCalc.refiOk },
                { label: 'Cash on Cash Return', value: `${sfCalc.coc.toFixed(1)}%`, sub: `${money(sfCalc.cf * 12)}/yr`, positive: sfCalc.coc >= 20 },
              ]}
            />
            <div className="calc-box">
              <RangeInput
                id="sf-purchase"
                label="Purchase Price"
                value={property.purchasePrice}
                min={30000}
                max={1000000}
                step={5000}
                derived={money(property.purchasePrice)}
                formulaBadge="Basis"
                tip="The agreed purchase price. Universally synced across all tabs & tools."
                isCore={true}
                onChange={(v) => updateProperty('purchasePrice', v)}
              />

              <RangeInput
                id="sf-rent"
                label="Monthly Rent"
                value={property.rent}
                min={200}
                max={12000}
                step={25}
                derived={`${money(property.rent * 12)}/yr gross`}
                formulaBadge="Gross Rev"
                tip="Estimated monthly rental income. Universally synced across rental strategies."
                isCore={true}
                onChange={(v) => updateProperty('rent', v)}
              />

              <RangeInput
                id="sf-down"
                label="Down Payment %"
                value={property.sfDown}
                min={0}
                max={50}
                step={1}
                derived={`${money(sfCalc.down)} down · ${money(sfCalc.loan)} carried`}
                formulaBadge="P × Down%"
                tip="Typical seller finance down payments range from 5% to 15%. Lower down = higher cash on cash return."
                isCore={true}
                onChange={(v) => updateProperty('sfDown', v)}
              />

              <RangeInput
                id="sf-rate"
                label="Interest Rate %"
                value={property.sfRate}
                min={0}
                max={12}
                step={0.25}
                derived={property.sfRate === 0 ? 'zero interest' : `${money(sfCalc.totalInterest)} interest by balloon`}
                formulaBadge="Note Rate"
                tip="Aim for 0% to 4%. A 0% interest note amortized over 30 years keeps debt service minimal."
                isCore={true}
                onChange={(v) => updateProperty('sfRate', v)}
              />

              <RangeInput
                id="sf-balloon"
                label="Balloon Term (years)"
                value={property.sfBalloon}
                min={1}
                max={30}
                step={1}
                derived={`${money(sfCalc.bal)} due`}
                formulaBadge="Refi Due"
                tip="When the remaining loan balance must be paid off. Aim for 5–10 years minimum so you have time to refinance or sell."
                onChange={(v) => updateProperty('sfBalloon', v)}
              />

              <RangeInput
                id="sf-amort"
                label="Amortization (years)"
                value={property.sfAmort}
                min={1}
                max={40}
                step={1}
                derived={`${money(sfCalc.pay)}/mo payment`}
                formulaBadge="P&I Base"
                tip="Standard amortization is 30 years. Longer amortization reduces the monthly payment."
                onChange={(v) => updateProperty('sfAmort', v)}
              />

              <RangeInput
                id="sf-occ"
                label="Occupancy %"
                value={property.occupancy}
                min={50}
                max={100}
                step={1}
                derived={`${money(sfCalc.effRent)} effective`}
                formulaBadge="Rent × Occ%"
                tip="Accounts for tenant vacancy and credit loss. Universally synced."
                onChange={(v) => updateProperty('occupancy', v)}
              />

              <RangeInput
                id="sf-ti"
                label="Taxes + Insurance /mo"
                value={property.taxesAndInsurance}
                min={0}
                max={3000}
                step={25}
                derived={`${money(property.taxesAndInsurance * 12)}/yr`}
                formulaBadge="T&I Opex"
                tip="Fixed monthly costs for property taxes and hazard insurance. Universally synced."
                onChange={(v) => updateProperty('taxesAndInsurance', v)}
              />

              <RangeInput
                id="sf-appr"
                label="Appreciation %/yr"
                value={property.sfAppr}
                min={0}
                max={10}
                step={0.5}
                derived={`${money(sfCalc.fv)} in ${property.sfBalloon} yrs`}
                formulaBadge="Future Value"
                tip="Historical conservative average is 2%–3% annually. Used to test if a 75% LTV refi clears the balloon."
                onChange={(v) => updateProperty('sfAppr', v)}
              />

              <RangeInput
                id="sf-fee"
                label="Your Assignment Fee"
                value={property.assignmentFee}
                min={0}
                max={50000}
                step={500}
                derived="your payday"
                formulaBadge="Cash Out"
                tip="Collected upfront from your end buyer. Universally synced."
                onChange={(v) => updateProperty('assignmentFee', v)}
              />

              <div className="result-card">
                <div className="result-label">Monthly Cash Flow</div>
                <div className={`result-value ${sfCalc.cf >= 0 ? 'pos' : 'neg'}`}>
                  {money(sfCalc.cf)}
                </div>
              </div>

              {(() => {
                const vi = getSfViability();
                return (
                  <div className={`viability ${vi.cls}`}>
                    <div className="viability-dot" />
                    <span>{vi.text}</span>
                  </div>
                );
              })()}

              <OfferCard range={sfOffer} />

              <button
                type="button"
                className="expand-btn"
                onClick={() => setSfExpanded(!sfExpanded)}
              >
                {sfExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {sfExpanded && (
                <div className="expanded-content">
                  <div className="detail-head">The math</div>
                  <div className="detail-row">
                    <span className="lbl">Down payment ({sf.down}%)</span>
                    <span className="val">{money(sfCalc.down)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Seller carries</span>
                    <span className="val">{money(sfCalc.loan)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Monthly payment</span>
                    <span className="val">{money(sfCalc.pay)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Gross rent</span>
                    <span className="val">{money(sf.rent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">At {sf.occ}% occupancy</span>
                    <span className="val">{money(sfCalc.effRent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Taxes + insurance</span>
                    <span className="val">-{money(sf.ti)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Monthly cash flow</span>
                    <span className={`val ${sfCalc.cf >= 0 ? 'pos' : 'neg'}`}>{money(sfCalc.cf)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash-on-cash</span>
                    <span className={`val ${sfCalc.coc >= 20 ? 'pos' : 'neg'}`}>{sfCalc.coc.toFixed(1)}%</span>
                  </div>

                  <div className="detail-head">The balloon — year {sf.balloon}</div>
                  <div className="detail-row">
                    <span className="lbl">Balance still owed</span>
                    <span className="val">{money(sfCalc.bal)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Value at {sf.appr}%/yr growth</span>
                    <span className="val">{money(sfCalc.fv)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Equity at balloon</span>
                    <span className={`val ${sfCalc.equityAtBalloon > 0 ? 'pos' : 'neg'}`}>{money(sfCalc.equityAtBalloon)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Refi at 75% LTV pulls</span>
                    <span className="val">{money(sfCalc.fv * 0.75)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Covers the balloon?</span>
                    <span className={`val ${sfCalc.refiOk ? 'pos' : 'neg'}`}>
                      {sfCalc.refiOk ? 'Yes' : `No — short ${money(sfCalc.bal - sfCalc.fv * 0.75)}`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash flow collected by then</span>
                    <span className={`val ${sfCalc.totalCF >= 0 ? 'pos' : 'neg'}`}>{money(sfCalc.totalCF)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Interest paid to seller</span>
                    <span className="val">{money(sfCalc.totalInterest)}</span>
                  </div>

                  <div className="detail-head">Does it clear the bar?</div>
                  <div className={`criteria-item ${sfCalc.cf > 0 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {sfCalc.cf > 0 ? '✓' : '✗'} <span>Positive cash flow at {sf.occ}% occupancy</span>
                  </div>
                  <div className={`criteria-item ${sfCalc.refiOk ? 'criteria-pass' : 'criteria-fail'}`}>
                    {sfCalc.refiOk ? '✓' : '✗'} <span>A 75% LTV refi covers the balloon</span>
                  </div>
                  <div className={`criteria-item ${sfCalc.coc >= 20 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {sfCalc.coc >= 20 ? '✓' : '✗'} <span>Cash-on-cash 20% or better</span>
                  </div>
                  <div className={`criteria-item ${sf.down <= 15 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {sf.down <= 15 ? '✓' : '✗'} <span>Down payment 15% or less — keeps your cash free</span>
                  </div>
                  <div className={`criteria-item ${sf.rate <= 5 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {sf.rate <= 5 ? '✓' : '✗'} <span>Interest rate 5% or lower</span>
                  </div>

                  <div className="guide">
                    <strong>How to read this</strong>
                    {sfCalc.cf < 0
                      ? 'You are feeding this deal every month. Two levers fix it: drop the price or drop the rate. Rate is usually the easier ask — sellers who carry care more about the number on the check than the interest. Pull the rate to zero and see what the cash flow does before you touch price.'
                      : (!sfCalc.refiOk
                        ? `It cash flows, but the exit is the problem. At the balloon you owe ${money(sfCalc.bal)} and a refi only pulls ${money(sfCalc.fv * 0.75)}. Stretch the balloon term out or push the price down so the payoff is smaller.`
                        : 'Cash flow works and the balloon refis out. This is the shape a carry deal should be in.')}
                  </div>

                  <div className="guide">
                    <strong>The one that bites people</strong>
                    Never sign a carry without knowing how you exit the balloon. Refi, sale, or extension — pick one before you sign, not in year five.
                  </div>
                </div>
              )}
            </div>

            <div className="buyer-pays">
              <div className="buyer-pays-label">Buyer Pays (price + your fee)</div>
              <div className="buyer-pays-value">{money(sf.purchase + sf.fee)}</div>
            </div>
          </div>
        )}

        {/* 3. Subject-To Tab */}
        {activeTab === 'st' && (
          <div id="st-tab" className="tab-panel">
            <KeyMetricsBar
              metrics={[
                { label: 'Total Cash to Enter', value: money(stCalc.cashIn), sub: `${money(st.cash)} seller · ${money(st.fee)} fee`, highlight: true },
                { label: 'Instant Equity Captured', value: money(stCalc.equity), sub: `${stCalc.equityPct.toFixed(0)}% equity · ${stCalc.ltv.toFixed(0)}% LTV`, positive: stCalc.equity > 0 },
                { label: 'Monthly Cash Flow', value: money(stCalc.cf), sub: `At ${st.occ}% occupancy`, positive: stCalc.cf > 0 },
                { label: 'Cash on Cash Return', value: `${stCalc.coc.toFixed(1)}%`, sub: `${money(stCalc.cf * 12)}/yr`, positive: stCalc.coc >= 20 },
              ]}
            />
            <div className="calc-box">
              <RangeInput
                id="st-value"
                label="Property Value"
                value={property.propertyValue}
                min={30000}
                max={1000000}
                step={5000}
                derived={money(property.propertyValue)}
                formulaBadge="Current Value"
                tip="Fair market value today as-is. Universally synced with ARV across all strategies."
                isCore={true}
                onChange={(v) => updateProperty('propertyValue', v)}
              />

              <RangeInput
                id="st-mtg"
                label="Existing Mortgage Balance"
                value={property.stMortgageBalance}
                min={0}
                max={900000}
                step={5000}
                derived={`${stCalc.ltv.toFixed(0)}% LTV`}
                formulaBadge="Payoff Amount"
                tip="The exact remaining principal on seller's current loan. Also automatically syncs to Seller Net Sheet payoff."
                isCore={true}
                onChange={(v) => {
                  updateProperty('stMortgageBalance', v);
                  updateProperty('netPayoff', v);
                }}
              />

              <RangeInput
                id="st-rate"
                label="Their Interest Rate %"
                value={property.stRate}
                min={0}
                max={12}
                step={0.125}
                derived={`${money(stCalc.pay)}/mo payment`}
                formulaBadge="Locked Rate"
                tip="The existing fixed rate. If they locked 2.75%–4.5% during 2020–2021, that loan rate is the real gold mine."
                isCore={true}
                onChange={(v) => updateProperty('stRate', v)}
              />

              <RangeInput
                id="st-rent"
                label="Monthly Rent"
                value={property.rent}
                min={200}
                max={12000}
                step={25}
                derived={`${money(property.rent * 12)}/yr gross`}
                formulaBadge="Gross Rev"
                tip="Expected rent. Must exceed their monthly PITI payment for positive cash flow. Universally synced."
                isCore={true}
                onChange={(v) => updateProperty('rent', v)}
              />

              <RangeInput
                id="st-cash"
                label="Cash to Seller"
                value={property.stCashToSeller}
                min={0}
                max={100000}
                step={1000}
                derived={`${money(stCalc.cashIn)} all-in`}
                formulaBadge="Move Money"
                tip="Upfront cash to the seller (moving money, catching up arrears, or equity buyout). Keep this low."
                isCore={true}
                onChange={(v) => updateProperty('stCashToSeller', v)}
              />

              <RangeInput
                id="st-months"
                label="Months Remaining"
                value={property.stMonthsRemaining}
                min={12}
                max={360}
                step={6}
                derived={`${(property.stMonthsRemaining / 12).toFixed(1)} years left`}
                formulaBadge="Remaining Term"
                tip="How many months left on their 30-year or 15-year amortizing loan."
                onChange={(v) => updateProperty('stMonthsRemaining', v)}
              />

              <RangeInput
                id="st-occ"
                label="Occupancy %"
                value={property.occupancy}
                min={50}
                max={100}
                step={1}
                derived={`${money(stCalc.effRent)} effective`}
                formulaBadge="Rent × Occ%"
                tip="Standard 80%–85% occupancy benchmark for vacancy and maintenance reserve buffer. Universally synced."
                onChange={(v) => updateProperty('occupancy', v)}
              />

              <RangeInput
                id="st-ti"
                label="Taxes + Insurance /mo"
                value={property.taxesAndInsurance}
                min={0}
                max={3000}
                step={25}
                derived={`${money(property.taxesAndInsurance * 12)}/yr`}
                formulaBadge="Escrow T&I"
                tip="Check their mortgage statement: Is T&I already escrowed into the monthly payment? Universally synced."
                onChange={(v) => updateProperty('taxesAndInsurance', v)}
              />

              <RangeInput
                id="st-fee"
                label="Your Assignment Fee"
                value={property.assignmentFee}
                min={0}
                max={50000}
                step={500}
                derived="your payday"
                formulaBadge="Cash Out"
                tip="Your assignment fee collected from the investor buying the SubTo deal. Universally synced."
                onChange={(v) => updateProperty('assignmentFee', v)}
              />

              <div className="result-card">
                <div className="result-label">Monthly Cash Flow</div>
                <div className={`result-value ${stCalc.cf >= 0 ? 'pos' : 'neg'}`}>
                  {money(stCalc.cf)}
                </div>
              </div>

              {(() => {
                const vi = getStViability();
                return (
                  <div className={`viability ${vi.cls}`}>
                    <div className="viability-dot" />
                    <span>{vi.text}</span>
                  </div>
                );
              })()}

              <OfferCard range={stOffer} />

              <button
                type="button"
                className="expand-btn"
                onClick={() => setStExpanded(!stExpanded)}
              >
                {stExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {stExpanded && (
                <div className="expanded-content">
                  <div className="detail-head">The math</div>
                  <div className="detail-row">
                    <span className="lbl">Property value</span>
                    <span className="val">{money(st.value)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Loan you assume</span>
                    <span className="val">{money(st.mtg)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Equity captured</span>
                    <span className={`val ${stCalc.equity > 0 ? 'pos' : 'neg'}`}>{money(stCalc.equity)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Equity %</span>
                    <span className="val">{stCalc.equityPct.toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">LTV</span>
                    <span className="val">{stCalc.ltv.toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Payment on their loan</span>
                    <span className="val">{money(stCalc.pay)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Gross rent</span>
                    <span className="val">{money(st.rent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">At {st.occ}% occupancy</span>
                    <span className="val">{money(stCalc.effRent)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Taxes + insurance</span>
                    <span className="val">-{money(st.ti)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Monthly cash flow</span>
                    <span className={`val ${stCalc.cf >= 0 ? 'pos' : 'neg'}`}>{money(stCalc.cf)}</span>
                  </div>

                  <div className="detail-head">Your money</div>
                  <div className="detail-row">
                    <span className="lbl">Cash to seller</span>
                    <span className="val">{money(st.cash)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Your assignment fee</span>
                    <span className="val">{money(st.fee)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Total cash to enter</span>
                    <span className="val">{money(stCalc.cashIn)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Annual cash flow</span>
                    <span className={`val ${stCalc.cf >= 0 ? 'pos' : 'neg'}`}>{money(stCalc.cf * 12)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Cash-on-cash</span>
                    <span className={`val ${stCalc.coc >= 25 ? 'pos' : 'neg'}`}>{stCalc.coc.toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Equity + first-year cash flow</span>
                    <span className="val">{money(stCalc.equity + stCalc.cf * 12)}</span>
                  </div>

                  <div className="detail-head">Does it clear the bar?</div>
                  <div className={`criteria-item ${stCalc.equity > 0 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {stCalc.equity > 0 ? '✓' : '✗'} <span>Real equity in the property</span>
                  </div>
                  <div className={`criteria-item ${stCalc.cf > 0 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {stCalc.cf > 0 ? '✓' : '✗'} <span>Positive cash flow at {st.occ}% occupancy</span>
                  </div>
                  <div className={`criteria-item ${st.rate < 6 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {st.rate < 6 ? '✓' : '✗'} <span>Their rate beats what you could get today — the whole reason to do this</span>
                  </div>
                  <div className={`criteria-item ${stCalc.ltv < 85 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {stCalc.ltv < 85 ? '✓' : '✗'} <span>LTV under 85% — room if values dip</span>
                  </div>
                  <div className={`criteria-item ${st.cash < st.value * 0.1 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {st.cash < st.value * 0.1 ? '✓' : '✗'} <span>Cash to seller under 10% of value</span>
                  </div>

                  <div className="guide">
                    <strong>How to read this</strong>
                    {stCalc.equity <= 0
                      ? 'The loan is at or above the value. There is no equity to capture, so the only reason to take this on is cash flow — and that is a thin reason to inherit someone else\'s debt.'
                      : (st.rate < 6
                        ? `The rate they locked is the asset here. You are buying a ${st.rate}% loan you could not get today, plus ${money(stCalc.equity)} of equity, for ${money(stCalc.cashIn)} in cash.`
                        : `At ${st.rate}% their loan is not much better than market, so the case rests on the equity and the low cash to enter. Make sure the cash to seller stays small.`)}
                  </div>

                  <div className="guide">
                    <strong>The risk nobody skips</strong>
                    Almost every mortgage has a due-on-sale clause. Transferring title can let the lender call the note. Deals get done this way constantly, but go in knowing the exposure and have a plan to refi if the note is called.
                  </div>
                </div>
              )}
            </div>

            <div className="buyer-pays">
              <div className="buyer-pays-label">Buyer Entry Cost (cash to seller + your fee)</div>
              <div className="buyer-pays-value">{money(stCalc.cashIn)}</div>
            </div>
          </div>
        )}

        {/* 4. Fix & Flip Tab */}
        {activeTab === 'ff' && (
          <div id="ff-tab" className="tab-panel">
            <KeyMetricsBar
              metrics={[
                { label: 'Total Cash Invested', value: money(ffCalc.invested), sub: `Purchase + ${money(ff.rehab)} rehab + carry`, highlight: true },
                { label: 'Net Profit to Flipper', value: money(ffCalc.profit), sub: `After ${money(ffCalc.sell)} realtor & closing`, positive: ffCalc.profit >= 25000 },
                { label: 'Flipper ROI', value: `${ffCalc.roi.toFixed(1)}%`, sub: `${ffCalc.margin.toFixed(1)}% margin on ARV`, positive: ffCalc.roi >= 20 },
                { label: 'Your Assignment Fee', value: money(ff.fee), sub: 'Deducted from seller MAO', positive: true },
              ]}
            />
            <div className="calc-box">
              <RangeInput
                id="ff-purchase"
                label="Purchase Price"
                value={property.purchasePrice}
                min={20000}
                max={900000}
                step={5000}
                derived={money(property.purchasePrice)}
                formulaBadge="Contract Price"
                tip="The price on the wholesale contract. Universally synced across all tabs & tools."
                isCore={true}
                onChange={(v) => updateProperty('purchasePrice', v)}
              />

              <RangeInput
                id="ff-arv"
                label="After Repair Value"
                value={property.propertyValue}
                min={30000}
                max={1200000}
                step={5000}
                derived={money(property.propertyValue)}
                formulaBadge="ARV Basis"
                tip="What the property will sell for fully renovated. Universally synced with property value."
                isCore={true}
                onChange={(v) => updateProperty('propertyValue', v)}
              />

              <RangeInput
                id="ff-rehab"
                label="Rehab Budget"
                value={property.rehab}
                min={0}
                max={300000}
                step={2500}
                derived={property.propertyValue > 0 ? `${((property.rehab / property.propertyValue) * 100).toFixed(0)}% of ARV` : ''}
                formulaBadge="Deducted in MAO"
                tip="Estimated scope of work. Live-synced with the Itemized Rehab Checklist tool below."
                isCore={true}
                onChange={(v) => updateProperty('rehab', v)}
              />

              <RangeInput
                id="ff-fee"
                label="Your Assignment Fee"
                value={property.assignmentFee}
                min={0}
                max={50000}
                step={500}
                derived="your payday"
                formulaBadge="Deducted in MAO"
                tip="Your wholesale assignment fee. In the Jerry Norton formula: MAO = (ARV x 70%) - Rehab - Fee."
                isCore={true}
                onChange={(v) => updateProperty('assignmentFee', v)}
              />

              <RangeInput
                id="ff-hold"
                label="Holding Cost /mo"
                value={property.ffHoldMonthly}
                min={0}
                max={6000}
                step={50}
                derived={`${money(ffCalc.holding)} over ${property.ffMonths} mo`}
                formulaBadge="Debt + T&I"
                tip="Hard money interest, utilities, property taxes, and builder risk insurance. Synced with Holding Costs tool."
                onChange={(v) => updateProperty('ffHoldMonthly', v)}
              />

              <RangeInput
                id="ff-months"
                label="Months Held"
                value={property.ffMonths}
                min={1}
                max={24}
                step={1}
                derived={`${money(property.ffHoldMonthly * property.ffMonths)} total`}
                formulaBadge="Project Duration"
                tip="Standard flip timeline: 3 months rehab + 1 month list/pending + 1 month close = 5 to 6 months."
                onChange={(v) => updateProperty('ffMonths', v)}
              />

              <RangeInput
                id="ff-realtor"
                label="Realtor Commission %"
                value={property.ffRealtorPct}
                min={0}
                max={10}
                step={0.5}
                derived={money(ffCalc.realtor)}
                formulaBadge="ARV × Comm%"
                tip="Listing and buyer agent fees when selling the finished house (typically 5% to 6%)."
                onChange={(v) => updateProperty('ffRealtorPct', v)}
              />

              <RangeInput
                id="ff-closing"
                label="Closing Costs %"
                value={property.ffClosingPct}
                min={0}
                max={8}
                step={0.5}
                derived={money(ffCalc.closing)}
                formulaBadge="ARV × Close%"
                tip="Title insurance, escrow fees, transfer stamps, and seller concessions (typically 2% to 3%)."
                onChange={(v) => updateProperty('ffClosingPct', v)}
              />

              <div className="result-card">
                <div className="result-label">Net Profit to Flipper</div>
                <div className={`result-value ${ffCalc.profit >= 0 ? 'pos' : 'neg'}`}>
                  {money(ffCalc.profit)}
                </div>
              </div>

              {(() => {
                const vi = getFfViability();
                return (
                  <div className={`viability ${vi.cls}`}>
                    <div className="viability-dot" />
                    <span>{vi.text}</span>
                  </div>
                );
              })()}

              {/* Live Jerry Norton 70% Rule Wholesale MMAO Bar */}
              <LiveMMAOBar
                arv={property.propertyValue}
                rehab={property.rehab}
                fee={property.assignmentFee}
                purchase={property.purchasePrice}
                breakdown={mmaoBreakdown}
                onSetPurchaseToMMAO={(mao) => updateProperty('purchasePrice', mao)}
              />

              <OfferCard range={ffOffer} />

              <button
                type="button"
                className="expand-btn"
                onClick={() => setFfExpanded(!ffExpanded)}
              >
                {ffExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {ffExpanded && (
                <div className="expanded-content">
                  <div className="detail-head">Money out</div>
                  <div className="detail-row">
                    <span className="lbl">Purchase price</span>
                    <span className="val">{money(ff.purchase)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Rehab budget</span>
                    <span className="val">{money(ff.rehab)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Holding ({ff.months} mo @ {money(ff.hold)})</span>
                    <span className="val">{money(ffCalc.holding)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Total invested</span>
                    <span className="val">{money(ffCalc.invested)}</span>
                  </div>

                  <div className="detail-head">Money back</div>
                  <div className="detail-row">
                    <span className="lbl">After repair value</span>
                    <span className="val">{money(ff.arv)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Realtor ({ff.realtor}%)</span>
                    <span className="val">-{money(ffCalc.realtor)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Closing ({ff.closing}%)</span>
                    <span className="val">-{money(ffCalc.closing)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Net proceeds</span>
                    <span className="val">{money(ff.arv - ffCalc.sell)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Net profit</span>
                    <span className={`val ${ffCalc.profit >= 0 ? 'pos' : 'neg'}`}>{money(ffCalc.profit)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">ROI on cash invested</span>
                    <span className={`val ${ffCalc.roi >= 20 ? 'pos' : 'neg'}`}>{ffCalc.roi.toFixed(1)}%</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Margin on ARV</span>
                    <span className="val">{ffCalc.margin.toFixed(1)}%</span>
                  </div>

                  <div className="detail-head">The 70% rule (Jerry Norton Wholesaler Formula)</div>
                  <div className="detail-row">
                    <span className="lbl">70% of ARV</span>
                    <span className="val">{money(ff.arv * 0.7)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Minus rehab</span>
                    <span className="val">-{money(ff.rehab)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Minus your assignment fee</span>
                    <span className="val">-{money(ff.fee)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Wholesaler Max Allowable Offer</span>
                    <span className="val">{money(ff.arv * 0.7 - ff.rehab - ff.fee)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="lbl">Your price vs MAO</span>
                    <span className={`val ${ff.purchase <= ff.arv * 0.7 - ff.rehab - ff.fee ? 'pos' : 'neg'}`}>
                      {ff.purchase <= ff.arv * 0.7 - ff.rehab - ff.fee
                        ? `${money(ff.arv * 0.7 - ff.rehab - ff.fee - ff.purchase)} under`
                        : `${money(ff.purchase - (ff.arv * 0.7 - ff.rehab - ff.fee))} over`}
                    </span>
                  </div>

                  <div className="detail-head">Does it clear the bar?</div>
                  <div className={`criteria-item ${ff.purchase <= ff.arv * 0.7 - ff.rehab - ff.fee ? 'criteria-pass' : 'criteria-fail'}`}>
                    {ff.purchase <= ff.arv * 0.7 - ff.rehab - ff.fee ? '✓' : '✗'} <span>Purchase price at or under the 70% Wholesale MAO</span>
                  </div>
                  <div className={`criteria-item ${ffCalc.roi >= 20 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {ffCalc.roi >= 20 ? '✓' : '✗'} <span>ROI 20% or better</span>
                  </div>
                  <div className={`criteria-item ${ffCalc.profit >= 25000 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {ffCalc.profit >= 25000 ? '✓' : '✗'} <span>At least $25k profit — enough to absorb a surprise</span>
                  </div>
                  <div className={`criteria-item ${ff.months <= 6 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {ff.months <= 6 ? '✓' : '✗'} <span>Six months or less on the hold</span>
                  </div>
                  <div className={`criteria-item ${ff.rehab <= ff.arv * 0.25 ? 'criteria-pass' : 'criteria-fail'}`}>
                    {ff.rehab <= ff.arv * 0.25 ? '✓' : '✗'} <span>Rehab under 25% of ARV — heavy rehabs blow budgets</span>
                  </div>

                  <div className="guide">
                    <strong>How to read this</strong>
                    {ff.purchase > ff.arv * 0.7 - ff.rehab - ff.fee
                      ? `You are ${money(ff.purchase - (ff.arv * 0.7 - ff.rehab - ff.fee))} over the wholesale 70% rule. That rule protects your end buyer so you can collect your fee. Your offer should be ${money(ff.arv * 0.7 - ff.rehab - ff.fee)} or lower — that is the number to anchor to.`
                      : `Price clears the wholesale 70% rule with ${money(ff.arv * 0.7 - ff.rehab - ff.fee - ff.purchase)} of cushion. That cushion protects your assignment fee and your buyer's margin.`}
                  </div>

                  <div className="guide">
                    <strong>Sanity check your ARV</strong>
                    ARV is where flips die. Pull sold comps in the last 90 days, same neighborhood, similar square footage. If your ARV is above every recent sale on the street, it is not an ARV — it is a hope.
                  </div>
                </div>
              )}
            </div>

            <div className="buyer-pays">
              <div className="buyer-pays-label">Buyer Pays (price + your fee)</div>
              <div className="buyer-pays-value">{money(ff.purchase + ff.fee)}</div>
            </div>
          </div>
        )}

        {/* 5. Compare Tab */}
        {activeTab === 'cmp' && (
          <CompareTab dscr={dscr} sf={sf} st={st} ff={ff} />
        )}

        {/* 6. Guide & Cheat Sheet Tab */}
        {activeTab === 'guide' && (
          <GuideTab />
        )}

        {/* Collapsible Drawers / Tools under the tabs */}
        <div className="tools" id="tools">
          <SellerNetSheet
            contractPrice={property.purchasePrice}
            payoff={property.netPayoff}
            liens={property.netLiens}
            closeP={property.netClosePct}
            credits={property.netCredits}
            onUpdate={(field, val) => updateProperty(field, val)}
          />

          <RehabChecklist
            onApplyToFlip={(total) => updateProperty('rehab', total)}
          />

          <HoldingCosts
            propertyTI={property.taxesAndInsurance}
            onTIChange={(ti) => updateProperty('taxesAndInsurance', ti)}
            months={property.ffMonths}
            onHoldingChange={(monthlyHold, months) => {
              updateProperty('ffHoldMonthly', monthlyHold);
              updateProperty('ffMonths', months);
            }}
          />

          <GoogleDrivePanel />
        </div>
      </div>

      {/* Floating Share Button at Bottom Left */}
      <button
        id="share-fab"
        type="button"
        onClick={() => setIsShareOpen(true)}
      >
        Share Deal Summary
      </button>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        activeTab={activeTab}
        defaultAddress={property.address}
        dscr={dscr}
        sf={sf}
        st={st}
        ff={ff}
        offers={{
          dscr: dscrOffer,
          sf: sfOffer,
          st: stOffer,
          ff: ffOffer,
        }}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Hidden Print Container for Clean Single-Page PDF Printouts */}
      <div id="print-sheet" />

      {/* Floating Enterprise Watermark at Bottom Right */}
      <EnterpriseWatermark />
    </>
  );
}
