import React, { useState } from 'react';
import { UniversalProperty } from '../types';
import { atDoubleClose, calcDoubleCloseOffer, money } from '../utils/calc';
import { KeyMetricsBar } from './KeyMetricsBar';
import { OfferCard } from './OfferCard';
import { RangeInput } from './RangeInput';
import { InfoTip } from './InfoTip';

interface DoubleCloseTabProps {
  property: UniversalProperty;
  onUpdate: <K extends keyof UniversalProperty>(key: K, value: UniversalProperty[K]) => void;
}

export const DoubleCloseTab: React.FC<DoubleCloseTabProps> = ({ property, onUpdate }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  // Defaults & Fallbacks
  const purchasePrice = property.purchasePrice;
  const endBuyerPrice = property.dcEndBuyerPrice > 0
    ? property.dcEndBuyerPrice
    : (purchasePrice > 0 ? purchasePrice + property.assignmentFee : 0);

  const dcInputs = {
    purchasePrice,
    endBuyerPrice,
    holdingDays: 1,
    transFundingPct: property.dcTransFundingPct,
    transFundingFlat: property.dcTransFundingFlat,
    atobClosingPct: property.dcAtobClosingPct,
    atobTitleFlat: property.dcAtobTitleFlat,
    btocClosingPct: property.dcBtocClosingPct,
    btocTitleFlat: property.dcBtocTitleFlat,
    paySellerClosingCosts: property.dcPaySellerClosingCosts,
    sellerClosingCostsPct: property.dcSellerClosingCostsPct,
    insuranceFee: property.dcInsuranceFee,
    otherConcessions: property.dcOtherConcessions,
  };

  const dcr = atDoubleClose(dcInputs);
  const dcOffer = calcDoubleCloseOffer(dcInputs, property.assignmentFee);

  const getViability = () => {
    if (dcr.netProfit >= 15000) {
      return { cls: 'green', text: 'Highly Lucrative — huge net payday, keeps fees 100% private' };
    } else if (dcr.netProfit >= 8000) {
      return { cls: 'yellow', text: 'Viable — covers double friction with solid profit' };
    } else if (dcr.netProfit > 0) {
      return { cls: 'yellow', text: 'Thin — friction consumes a large share of gross spread' };
    }
    return { cls: 'red', text: 'Not viable — double closing costs exceed gross spread' };
  };

  const viability = getViability();

  return (
    <div id="dc-tab" className="tab-panel">
      {/* Key Metrics Bar */}
      <KeyMetricsBar
        metrics={[
          {
            label: 'Entry Price (A-B Purchase)',
            value: money(purchasePrice),
            sub: 'From Seller A (Contract #1)',
            highlight: true,
            tooltipTitle: 'Entry Purchase Price (Contract #1)',
            tooltipEli12: 'The contract price you agree to buy the asset for from Seller A on closing morning. 100% funded via 1-day transactional flash funding.',
          },
          {
            label: 'Total Asset Sale (B-C Resale)',
            value: money(endBuyerPrice),
            sub: 'To Cash Buyer C (Contract #2)',
            tooltipTitle: 'Total Asset Sale Price (Contract #2)',
            tooltipEli12: 'The total purchase price paid by Cash Buyer C in the afternoon transaction to acquire the property.',
          },
          {
            label: 'Gross Spread',
            value: money(dcr.grossSpread),
            sub: `${money(endBuyerPrice)} − ${money(purchasePrice)}`,
          },
          {
            label: 'Double Close Friction',
            value: money(dcr.totalDeductions),
            sub: '2x Closing + Flash Loan',
            highlight: dcr.totalDeductions > 6000 ? 'yellow' : undefined,
          },
          {
            label: 'Net Take-Home Payday',
            value: money(dcr.netProfit),
            sub: `${dcr.frictionPctOfSpread.toFixed(0)}% lost to friction`,
            highlight: dcr.netProfit >= 10000 ? 'green' : dcr.netProfit > 0 ? 'yellow' : 'red',
          },
        ]}
      />

      {/* Primary Calculator Box */}
      <div className="calc-box">
        <div className="calc-grid">
          {/* Column 1: A-B Purchase & B-C Resale Inputs */}
          <div className="calc-col">
            <div className="col-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Transaction Structure</span>
              <InfoTip
                title="Double Close Transaction Flow"
                eli12="In a Double Close (also called back-to-back closing), you buy from Seller A on Contract #1 (A-to-B), take title for 10 minutes, and immediately sell to Buyer C on Contract #2 (B-to-C). You use same-day Flash Funding (Transactional Funding) so you don't need your own cash. This is 100% legal in all 50 states and protects large wholesale fees ($15k-$50k+) from being seen by either party!"
                ruleOfThumb="Double close when your spread is ≥$15,000 or when wholesaling in states like Illinois or Pennsylvania that restrict contract assignments."
                size="sm"
              />
            </div>

            <RangeInput
              id="dc-purchase"
              label="A-to-B Purchase Price (Contract #1)"
              val={purchasePrice}
              min={0}
              max={1500000}
              step={1000}
              format="money"
              onChange={(val) => onUpdate('purchasePrice', val)}
              eli12="The price you agree to buy the home for from the distressed seller."
            />

            <RangeInput
              id="dc-endbuyer"
              label="B-to-C End Buyer Price (Contract #2)"
              val={endBuyerPrice}
              min={0}
              max={1500000}
              step={1000}
              format="money"
              onChange={(val) => onUpdate('dcEndBuyerPrice', val)}
              eli12="The higher price your end cash buyer agreed to pay you for the property."
            />

            <RangeInput
              id="dc-targetfee"
              label="Target Wholesale Net Profit"
              val={property.assignmentFee}
              min={1000}
              max={100000}
              step={500}
              format="money"
              onChange={(val) => onUpdate('assignmentFee', val)}
              eli12="How much cash you want to walk away with after paying both sets of closing costs and transactional loan fees."
            />

            {/* Quick State & Law Callout */}
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '11px',
                lineHeight: 1.45,
                color: '#334155',
              }}
            >
              <span style={{ fontWeight: 700, color: '#0f172a' }}>🏛️ Why Double Close? </span>
              1. <strong>Privacy:</strong> Neither the seller nor the end buyer sees your profit margin on the settlement statement.<br />
              2. <strong>State Compliance:</strong> Satisfies strict licensing statutes in Illinois, Pennsylvania, Oklahoma, and South Carolina that restrict marketing equitable interest contracts.
            </div>
          </div>

          {/* Column 2: Friction Breakdown & Dropdowns */}
          <div className="calc-col">
            <div className="col-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Double Close Friction Costs</span>
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                Total: {money(dcr.totalDeductions)}
              </span>
            </div>

            <RangeInput
              id="dc-transfunding"
              label="Transactional Flash Funding Fee"
              val={property.dcTransFundingPct}
              min={0.5}
              max={3.0}
              step={0.25}
              format="pct"
              onChange={(val) => onUpdate('dcTransFundingPct', val)}
              eli12="Fee charged by a 1-day transactional lender to wire 100% of the funds to close transaction A-to-B. The loan is wired in the morning and repaid in the afternoon when Buyer C closes."
              ruleOfThumb="Standard rate is 1% to 1.5% with a $500-$750 doc fee."
            />

            <RangeInput
              id="dc-atobclosing"
              label="A-to-B Buyer Closing Costs"
              val={property.dcAtobClosingPct}
              min={0.5}
              max={4.0}
              step={0.1}
              format="pct"
              onChange={(val) => onUpdate('dcAtobClosingPct', val)}
              eli12="Your closing costs on the purchase from Seller A (title search, settlement, transfer tax stamps)."
            />

            <RangeInput
              id="dc-btocclosing"
              label="B-to-C Seller Closing Costs"
              val={property.dcBtocClosingPct}
              min={0.5}
              max={4.0}
              step={0.1}
              format="pct"
              onChange={(val) => onUpdate('dcBtocClosingPct', val)}
              eli12="Your seller closing costs when you immediately sell to End Buyer C (deed prep, title insurance, transfer taxes)."
            />

            {/* Pay Seller Closing Costs Switch */}
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: property.dcPaySellerClosingCosts ? '#fef3c7' : '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                  Cover Seller A's Closing Costs?
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Common wholesale pitch: &quot;We pay all normal seller closing fees&quot;
                </div>
              </div>
              <input
                type="checkbox"
                checked={property.dcPaySellerClosingCosts}
                onChange={(e) => onUpdate('dcPaySellerClosingCosts', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Title & Escrow Adjustments Dropdown */}
        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#185fa5',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0,
            }}
          >
            <span>{showAdvanced ? '▼ Hide' : '▶ Show'} Title Escrow &amp; Lender Flat Fees</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>(Doc fees, title search, insurance binder)</span>
          </button>

          {showAdvanced && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              <RangeInput
                id="dc-transflat"
                label="Lender Admin/Doc Flat Fee"
                val={property.dcTransFundingFlat}
                min={0}
                max={2500}
                step={50}
                format="money"
                onChange={(val) => onUpdate('dcTransFundingFlat', val)}
                eli12="Fixed underwriting or wire fee charged by your transactional flash funding company."
              />

              <RangeInput
                id="dc-atobflat"
                label="A-B Title/Escrow Flat Fee"
                val={property.dcAtobTitleFlat}
                min={0}
                max={2000}
                step={50}
                format="money"
                onChange={(val) => onUpdate('dcAtobTitleFlat', val)}
                eli12="Settlement fee and title exam charge for the purchase side."
              />

              <RangeInput
                id="dc-btocflat"
                label="B-C Escrow Settlement Flat Fee"
                val={property.dcBtocTitleFlat}
                min={0}
                max={2000}
                step={50}
                format="money"
                onChange={(val) => onUpdate('dcBtocTitleFlat', val)}
                eli12="Settlement fee for the second sale to the end buyer."
              />

              <RangeInput
                id="dc-insurancefee"
                label="Title Policy Binder Endorsement"
                val={property.dcInsuranceFee}
                min={0}
                max={1500}
                step={50}
                format="money"
                onChange={(val) => onUpdate('dcInsuranceFee', val)}
                eli12="Most title companies allow an 'interim binder' which discounts the second title policy to only $150-$400 instead of paying full price twice!"
              />

              {property.dcPaySellerClosingCosts && (
                <RangeInput
                  id="dc-sellerclosepct"
                  label="Seller A Closing Cost % (Paid by us)"
                  val={property.dcSellerClosingCostsPct}
                  min={1.0}
                  max={5.0}
                  step={0.5}
                  format="pct"
                  onChange={(val) => onUpdate('dcSellerClosingCostsPct', val)}
                  eli12="Estimated seller-side transfer stamps and settlement costs absorbed by you."
                />
              )}
            </div>
          )}
        </div>

        {/* Offer Range Card */}
        <OfferCard range={dcOffer} title="Double Close Maximum Allowable Offer (MMAO)" />

        {/* Viability Status Banner */}
        <div className={`viability ${viability.cls}`} style={{ marginTop: '12px' }}>
          <span className="dot" />
          <span className="text">{viability.text}</span>
        </div>

        {/* Friction Cost Watermark / HUD Breakdown Summary */}
        <div
          style={{
            marginTop: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
            Double Close HUD Settlement Ledger (Where every dollar goes)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px' }}>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>1. Gross Spread (B-to-C minus A-to-B)</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{money(dcr.grossSpread)}</div>
            </div>

            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>2. A-to-B Closing Costs (Purchase)</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>−{money(dcr.atobTotal)}</div>
            </div>

            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>3. B-to-C Closing Costs (Sale)</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>−{money(dcr.btocTotal)}</div>
            </div>

            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>4. Transactional Funding Flash Fee</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>−{money(dcr.transFundingFee)}</div>
            </div>

            <div style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <div style={{ color: '#166534', fontSize: '11px', fontWeight: 700 }}>5. Net Wholesaler Take-Home Check</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803d' }}>{money(dcr.netProfit)}</div>
            </div>
          </div>
        </div>

        {/* Accordion / Collapsible Rules for Double Closing */}
        <div style={{ marginTop: '14px' }}>
          <button
            type="button"
            onClick={() => setShowCriteria(!showCriteria)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#185fa5',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0,
            }}
          >
            <span>{showCriteria ? '▼ Hide' : '▶ Show'} Double Close Golden Rules &amp; State Check</span>
          </button>

          {showCriteria && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Golden Rules of Double Closing:
              </div>
              <ul style={{ margin: '0 0 10px 18px', padding: 0, color: '#334155' }}>
                <li><strong>Never use Buyer C's money to close A-to-B:</strong> In the past, title companies did &quot;pass-through funding&quot;. Today, wet-funding rules require you to bring your own 100% funds via Transactional Funding.</li>
                <li><strong>Same Title Company Requirement:</strong> Ensure both Contract #1 (A-B) and Contract #2 (B-C) are handled by the SAME investor-friendly title company or closing attorney.</li>
                <li><strong>Spread Threshold:</strong> Because friction costs run between $3,500 and $7,500, only double close if your spread is at least $10,000 to $15,000. Under $10,000, standard assignment is far cleaner.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
