import React from 'react';
import { DSCRInputs, SFInputs, STInputs, FFInputs, UniversalProperty } from '../types';
import { atDSCR, atSF, atST, atFF, atDoubleClose, money } from '../utils/calc';
import { InfoTip } from './InfoTip';

interface CompareTabProps {
  dscr: DSCRInputs;
  sf: SFInputs;
  st: STInputs;
  ff: FFInputs;
  property: UniversalProperty;
  onSelectTab?: (tab: 'dscr' | 'sf' | 'st' | 'ff' | 'dc') => void;
}

export const CompareTab: React.FC<CompareTabProps> = ({ dscr, sf, st, ff, property, onSelectTab }) => {
  const ffr = atFF(ff.purchase, ff);
  const dr = atDSCR(dscr.purchase, dscr);
  const sr = atSF(sf.purchase, sf);
  const tr = atST(st);

  // Double close calculation
  const dcr = atDoubleClose({
    purchasePrice: property.purchasePrice,
    endBuyerPrice: property.dcEndBuyerPrice || (property.purchasePrice + property.assignmentFee),
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
  });

  const listPrice = property.listPrice || property.propertyValue || 0;
  const discountFromList = listPrice - property.purchasePrice;
  const discountPct = listPrice > 0 ? (discountFromList / listPrice) * 100 : 0;

  const hasSubToLoan = property.stMortgageBalance > 0;
  const hasRehab = property.rehab > 0;

  // 1. Cash Wholesale
  const wsOk = ff.fee > 0 && ffr.profit > ff.fee;

  // 2. Fix & Flip
  const ffCls = ffr.roi >= 20 ? 'green' : ffr.roi >= 12 ? 'yellow' : 'red';
  const ffVerdict = ffr.roi >= 20 ? 'Strong' : ffr.roi >= 12 ? 'Thin' : 'Not viable';

  // 3. Novation
  const novProfit = ff.arv - ff.purchase - ff.rehab - (ff.arv * (ff.realtor + ff.closing)) / 100 - ff.hold * ff.months;
  const novCls = novProfit > ff.fee * 2 ? 'green' : novProfit > ff.fee ? 'yellow' : 'red';
  const novVerdict = novProfit > ff.fee * 2 ? 'Worth it' : novProfit > ff.fee ? 'Marginal' : 'Not worth it';

  // 4. DSCR (Richard Taylor / Hold My Hand Wholesale standard: ≥1.25 DSCR and shooting for ~20% Cash-on-Cash)
  const dCls = dr.dscr >= 1.25 && dr.coc >= 20 ? 'green' : dr.dscr >= 1.0 && dr.coc >= 12 ? 'yellow' : 'red';
  const dVerdict = dr.dscr >= 1.25 && dr.coc >= 20 ? 'Lender Ready (≥20% CoC)' : dr.dscr >= 1.0 ? 'Borderline' : 'Will Not Fund';

  // 5. Seller Finance
  const sCls = sr.cf > 200 && sr.refiOk ? 'green' : sr.cf >= 0 && sr.refiOk ? 'yellow' : 'red';
  const sVerdict = sr.cf > 200 && sr.refiOk ? 'Strong' : sr.cf >= 0 && sr.refiOk ? 'Thin' : 'Exit problem';

  // 6. Subject-To
  const tCls = hasSubToLoan
    ? tr.cf > 200 && tr.equity > 0 ? 'green' : tr.cf >= 0 && tr.equity > 0 ? 'yellow' : 'red'
    : 'yellow';
  const tVerdict = hasSubToLoan
    ? tr.cf > 200 && tr.equity > 0 ? 'Strong' : tr.cf >= 0 && tr.equity > 0 ? 'Thin' : 'High risk'
    : 'Needs Seller Intel';

  // 7. Double Close
  const dcOk = dcr.netProfit > 5000;
  const dcCls = dcr.netProfit >= 15000 ? 'green' : dcr.netProfit >= 5000 ? 'yellow' : 'red';
  const dcVerdict = dcr.netProfit >= 15000 ? 'Lucrative' : dcr.netProfit >= 5000 ? 'Viable' : 'Friction too high';

  // Calculate Highest Profit / Optimal Deal Recommendation
  const strategies = [
    {
      name: 'Double Close (A-B & B-C)',
      tabKey: 'dc' as const,
      viable: dcr.netProfit >= 10000,
      profitSummary: `Net Payday: ${money(dcr.netProfit)} (Gross Spread: ${money(dcr.grossSpread)} − ${money(dcr.totalDeductions)} closing/funding friction)`,
      why: 'Best when your spread is large ($15k+) to keep your fee private from seller & buyer, or when state laws restrict contract assignments.',
      metric: dcr.netProfit,
    },
    {
      name: 'Fix & Flip (or Cash Wholesale)',
      tabKey: 'ff' as const,
      viable: ffr.profit > 0 && ffr.roi >= 15,
      profitSummary: `Projected Flip Net Profit: ${money(ffr.profit)} (or ${money(ff.fee)} Wholesale Fee)`,
      why: 'Best if property is heavily distressed and seller accepts a deep discount (70% MMAO).',
      metric: ffr.profit,
    },
    {
      name: 'Subject-To (Sub-To)',
      tabKey: 'st' as const,
      viable: hasSubToLoan && tr.cf > 150 && tr.equity > 0,
      profitSummary: `Monthly Cash Flow: ${money(tr.cf)}/mo | Instant Equity: ${money(tr.equity)}`,
      why: `Leverages seller's low ${property.stRate}% existing interest rate with only ${money(tr.cashIn)} total entry capital.`,
      metric: tr.cf * 12 + tr.equity * 0.2,
    },
    {
      name: 'Seller Financing (SF)',
      tabKey: 'sf' as const,
      viable: sr.cf > 150 && sr.refiOk,
      profitSummary: `Monthly Cash Flow: ${money(sr.cf)}/mo | Down: ${money(sr.down)} (10% down / 0% int)`,
      why: 'No bank underwriting! Seller acts as the bank, allowing you to pay up to 90%-100% of list price.',
      metric: sr.cf * 12,
    },
    {
      name: 'DSCR Rental (Buy & Hold)',
      tabKey: 'dscr' as const,
      viable: dr.dscr >= 1.25 && dr.coc >= 18,
      profitSummary: `Monthly Cash Flow: ${money(dr.cf)}/mo | DSCR: ${dr.dscr.toFixed(2)} | CoC: ${dr.coc.toFixed(1)}%`,
      why: 'Shooting for Richard Taylor\'s 20% CoC rule with zero personal income/W-2 verification.',
      metric: dr.cf * 12,
    },
  ];

  const viableStrategies = strategies.filter((s) => s.viable);
  const bestStrategy = viableStrategies.length > 0
    ? viableStrategies.reduce((prev, curr) => (curr.metric > prev.metric ? curr : prev))
    : null;

  return (
    <div id="cmp-tab" className="tab-panel">
      <div className="calc-box" style={{ display: 'block' }}>
        {/* Zillow Quick-Triage & Missing Info Intelligence Banner */}
        <div
          style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                  Zillow 30-Second Triage &amp; Strategy Readiness
                </span>
                <InfoTip
                  title="What is 30-Second Triage?"
                  eli12="When you look at a property on Zillow, you instantly know List Price, Market Rent, and Taxes. This triage bar tells you which of the 4 exit strategies are ready to offer right now, and what missing questions you must ask the seller to unlock the others!"
                  size="sm"
                />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Seller Asking: <strong>{money(listPrice)}</strong> ➔ Our Offer: <strong>{money(property.purchasePrice)}</strong>
                {listPrice > 0 && (
                  <span style={{ marginLeft: '6px', color: discountFromList >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    ({discountFromList >= 0 ? `-$${Math.abs(discountFromList).toLocaleString()} / ${discountPct.toFixed(1)}% below list` : `+$${Math.abs(discountFromList).toLocaleString()} over list`})
                  </span>
                )}
              </div>
            </div>

            {/* 4 Strategy Readiness Badges with Click InfoTips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* DSCR Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  🏢 DSCR: Online Ready
                  <InfoTip
                    title="DSCR: Online Ready"
                    eli12="Why is this ready? Because Zillow and Redfin already give you the Asking Price, Estimated Rent, and Property Taxes! With those 3 numbers, you can immediately test if a bank DSCR loan will work (aiming for ≥1.25 DSCR and ~20% Cash-on-Cash return)."
                    ruleOfThumb="Requires 20% down payment. Target rent > 1.25x total monthly PITI payment."
                    size="sm"
                  />
                </span>
              </div>

              {/* SF Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  🤝 SF: Baseline 10%/0%
                  <InfoTip
                    title="What does 'SF Baseline 10%/0%' mean?"
                    eli12="In Seller Financing, you don't know the owner's exact terms yet! So we start with our standard opening offer rule: 10% down payment and 0% interest (or 0%-2% interest) amortized over 30 years with a 5-6 year balloon payoff. If the seller owns the house free-and-clear (no mortgage), pitch this!"
                    ruleOfThumb="Start at 0% interest! If the seller balks, negotiate up to 2% to 4%."
                    example="On a $200k purchase: $20,000 down payment, $180,000 carried by seller at 0% interest = $500/mo principal payment."
                    size="sm"
                  />
                </span>
              </div>

              {/* Sub-To Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: hasSubToLoan ? '#ecfdf5' : '#fef2f2',
                    color: hasSubToLoan ? '#065f46' : '#991b1b',
                    border: hasSubToLoan ? '1px solid #a7f3d0' : '1px solid #fecaca',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  📑 Sub-To: {hasSubToLoan ? 'Loan Confirmed' : '⚠️ Need Mortgage Info'}
                  <InfoTip
                    title="What does 'Sub-To Loan Confirmed' mean?"
                    eli12={
                      hasSubToLoan
                        ? `We have the seller's existing mortgage details entered (${money(property.stMortgageBalance)} balance @ ${property.stRate}% rate). This lets us accurately calculate your exact monthly payment and cash flow without guessing!`
                        : 'Subject-To requires taking over the seller\'s existing bank loan. Since Zillow does NOT show private loan balances or interest rates, you must ask the seller on the phone: "Do you have an existing mortgage, and what is your approximate balance and monthly payment?"'
                    }
                    ruleOfThumb="Sub-To is gold when the seller has an existing 3% to 4.5% interest rate from 2020-2022."
                    size="sm"
                  />
                </span>
              </div>

              {/* Flip Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: hasRehab ? '#ecfdf5' : '#fef2f2',
                    color: hasRehab ? '#065f46' : '#991b1b',
                    border: hasRehab ? '1px solid #a7f3d0' : '1px solid #fecaca',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  🔨 Flip: {hasRehab ? `Rehab ${money(property.rehab)}` : '⚠️ Need Rehab Scope'}
                  <InfoTip
                    title="Flip & Wholesale Rehab Scope"
                    eli12={
                      hasRehab
                        ? `Rehab budget is set at ${money(property.rehab)}. This feeds the Jerry Norton 70% Wholesaling MMAO formula: (ARV × 70%) − Rehab − Fee = ${money(ff.arv * 0.7 - property.rehab - ff.fee)}.`
                        : 'A fix & flip or wholesale offer CANNOT be finalized without estimating repairs. Walk the house or view photos, then use the Rehab Checklist below to itemize cosmetic vs. heavy repairs.'
                    }
                    size="sm"
                  />
                </span>
              </div>

              {/* Double Close Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11px',
                    background: dcOk ? '#eff6ff' : '#fef2f2',
                    color: dcOk ? '#1d4ed8' : '#991b1b',
                    border: dcOk ? '1px solid #bfdbfe' : '1px solid #fecaca',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  🔄 Double Close: {dcOk ? `Net Payday ${money(dcr.netProfit)}` : 'Thin Spread'}
                  <InfoTip
                    title="Double Close Strategy Readiness"
                    eli12="Double closing (A-to-B purchase, B-to-C resale) lets you take title for 5 minutes and immediately sell to your cash buyer. Required in states that ban standard wholesale assignments (like IL, PA, OK) or when making huge spreads ($15k-$50k+) so neither party sees your profit on the settlement HUD!"
                    ruleOfThumb="Requires 1-day transactional funding and covers 2 sets of closing costs. Ideal when gross spread is ≥$12,000-$15,000."
                    example={`Gross spread: ${money(dcr.grossSpread)} minus ${money(dcr.totalDeductions)} closing & flash loan fees = ${money(dcr.netProfit)} net check.`}
                    size="sm"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Intelligent Acquisition Recommendations: Guides you to the Most Money */}
          {bestStrategy ? (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Best Deal Path Recommendation: {bestStrategy.name}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', marginTop: '2px' }}>
                  {bestStrategy.profitSummary}
                </div>
                <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                  {bestStrategy.why}
                </div>
              </div>

              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => onSelectTab(bestStrategy.tabKey)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  Open {bestStrategy.name} Tab ➔
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: '#fff1f2',
                border: '1.5px solid #fecdd3',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#9f1239' }}>
                ⚠️ No strategy is currently clearing green at the current {money(property.purchasePrice)} offer price.
              </div>
              <div style={{ fontSize: '11px', color: '#881337', marginTop: '3px' }}>
                To make this deal work: negotiate purchase price down toward 70% MMAO ({money(ff.arv * 0.7 - property.rehab - ff.fee)}) for a cash flip, or switch to Seller Financing at 0%-2% interest to keep purchase price high while maintaining positive cash flow.
              </div>
            </div>
          )}

          {/* Acquisition Action Items for Seller Phone Call */}
          {(!hasSubToLoan || !hasRehab) && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: 1.4,
              }}
            >
              <strong>Acquisition Action Items for Seller Call to Unlock More Money:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {!hasSubToLoan && (
                  <li>
                    <strong>Subject-To:</strong> Ask the seller: <i>&quot;Do you have a current mortgage on the property, and what is your approximate remaining balance and monthly payment?&quot;</i> Enter that in the Subject-To tab to see if you can take over a 3%-4% mortgage.
                  </li>
                )}
                {!hasRehab && (
                  <li>
                    <strong>Fix &amp; Flip / Wholesale:</strong> Rehab is currently $0. Click the Rehab Checklist tool below to select a cosmetic or full scope to calculate your real 70% MMAO.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="tool-hint" style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>Every strategy below is running live off the numbers you entered. Compare payouts, capital required, and risk side-by-side:</span>
          <span style={{ fontSize: '11px', color: '#185fa5', fontWeight: 600 }}>DSCR Target: ≥1.25 DSCR &amp; ~20% Cash-on-Cash</span>
        </div>

        <div id="cmp-list">
          {/* Cash Wholesale */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Cash Wholesale</span>
              <span className={`cmp-pill ${wsOk ? 'green' : 'yellow'}`}>
                {wsOk ? 'Cleanest' : 'Check spread'}
              </span>
            </div>
            <div className="cmp-sub">Contract it, assign it, collect a fee. You never own it.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Buyer entry (to close)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(ff.purchase + ff.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Your wholesale fee</span>
                <span className="v" style={{ fontWeight: 700 }}>{money(ff.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Your earnest money</span>
                <span className="v">{money(1000)} EMD</span>
              </div>
              <div className="cmp-r">
                <span className="l">Time to exit</span>
                <span className="v">2-4 weeks</span>
              </div>
            </div>
            <div className="cmp-risk">
              Fastest and lowest risk, smallest payday. The whole thing rests on the buyer actually closing — and on your spread surviving their inspection.
            </div>
          </div>

          {/* Double Close */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Double Close</span>
              <span className={`cmp-pill ${dcCls}`}>{dcVerdict}</span>
            </div>
            <div className="cmp-sub">A-B buy &amp; B-C sell back-to-back. Keep fees 100% private, legal in all 50 states.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry price (A-B buy)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(property.purchasePrice)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Total asset sale (B-C)</span>
                <span className="v" style={{ fontWeight: 600 }}>{money(property.dcEndBuyerPrice || (property.purchasePrice + property.assignmentFee))}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Net take-home check</span>
                <span className="v" style={{ color: dcr.netProfit >= 10000 ? '#15803d' : '#9a3412', fontWeight: 700 }}>
                  {money(dcr.netProfit)}
                </span>
              </div>
              <div className="cmp-r">
                <span className="l">Gross spread</span>
                <span className="v">{money(dcr.grossSpread)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Friction costs</span>
                <span className="v">{money(dcr.totalDeductions)}</span>
              </div>
            </div>
            <div className="cmp-risk">
              Essential when assignment fees exceed $15k (prevents buyer/seller remorse) or in states restricting assignment contracts. High friction costs ({money(dcr.totalDeductions)}) mean spreads under $8k are rarely worth it.
            </div>
          </div>

          {/* Fix & Flip */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Fix &amp; Flip</span>
              <span className={`cmp-pill ${ffCls}`}>{ffVerdict}</span>
            </div>
            <div className="cmp-sub">Buy, renovate, sell retail. Highest ceiling, highest exposure.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry price (to close)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(ff.purchase + ff.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Total all-in basis</span>
                <span className="v">{money(ffr.invested)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Net profit</span>
                <span className="v" style={{ fontWeight: 700, color: ffr.profit >= 25000 ? '#15803d' : undefined }}>{money(ffr.profit)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">ROI</span>
                <span className="v">{ffr.roi.toFixed(1)}%</span>
              </div>
              <div className="cmp-r">
                <span className="l">ARV resale</span>
                <span className="v">{money(ff.arv)}</span>
              </div>
            </div>
            <div className="cmp-risk">
              ARV is where flips die. Every month of overrun is another {money(ff.hold)} out of the profit.
            </div>
          </div>

          {/* Novation */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Novation</span>
              <span className={`cmp-pill ${novCls}`}>{novVerdict}</span>
            </div>
            <div className="cmp-sub">Seller lets you list and sell retail. You never take title.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry cash (rehab)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(ff.rehab)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Retail resale (ARV)</span>
                <span className="v">{money(ff.arv)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Est. profit</span>
                <span className="v" style={{ fontWeight: 700 }}>{money(novProfit)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">vs. assigning</span>
                <span className="v">{money(novProfit - ff.fee)} more</span>
              </div>
            </div>
            <div className="cmp-risk">
              More money than assigning, but you are carrying the seller relationship for months and the agreement has to be papered correctly. Only worth it when the gap over your assignment fee is real.
            </div>
          </div>

          {/* DSCR Rental */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">DSCR Rental</span>
              <span className={`cmp-pill ${dCls}`}>{dVerdict}</span>
            </div>
            <div className="cmp-sub">Conventional investor loan, hold it and rent it (shooting for ~20% CoC).</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry cash (to close)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(dr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Total purchase basis</span>
                <span className="v">{money(dscr.purchase + dscr.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v" style={{ fontWeight: 700, color: dr.cf >= 250 ? '#0f766e' : undefined }}>{money(dr.cf)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">DSCR</span>
                <span className="v">{dr.dscr.toFixed(2)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Cash-on-cash</span>
                <span className="v">{dr.coc.toFixed(1)}%</span>
              </div>
            </div>
            <div className="cmp-risk">
              DSCR under 1.25 and most lenders walk. Target a 20% Cash-on-Cash return so your money doubles quickly. Fix low returns with lower price, not inflated rents.
            </div>
          </div>

          {/* Seller Finance */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Seller Finance</span>
              <span className={`cmp-pill ${sCls}`}>{sVerdict}</span>
            </div>
            <div className="cmp-sub">Seller carries note. Buyer pays entry cash (down + fee) for cash flow.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry cash (to close)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(sr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Total purchase basis</span>
                <span className="v">{money(sf.purchase + sf.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v" style={{ fontWeight: 700, color: sr.cf >= 200 ? '#0f766e' : undefined }}>{money(sr.cf)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Cash-on-cash return</span>
                <span className="v" style={{ fontWeight: 700, color: sr.coc >= 20 ? '#15803d' : undefined }}>
                  {sr.coc.toFixed(1)}%
                </span>
              </div>
              <div className="cmp-r">
                <span className="l">Balloon due</span>
                <span className="v">{money(sr.bal)} ({sf.balloon} yr)</span>
              </div>
            </div>
            <div className="cmp-risk">
              {sr.refiOk
                ? `75% refi covers balloon. Downside risk is capped at entry cash with standard 2-month default forfeiture.`
                : `The balloon does not refinance at these terms. Do not sign this until the term, rate, or down payment changes.`}
            </div>
          </div>

          {/* Subject-To */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Subject-To</span>
              <span className={`cmp-pill ${tCls}`}>{tVerdict}</span>
            </div>
            <div className="cmp-sub">Take over their existing loan. Lowest cash of any strategy.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Entry cash (to close)</span>
                <span className="v" style={{ fontWeight: 700, color: '#166534' }}>{money(tr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Total property value</span>
                <span className="v">{money(st.val)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v" style={{ fontWeight: 700, color: tr.cf >= 200 ? '#0f766e' : undefined }}>{money(tr.cf)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Equity captured</span>
                <span className="v">{money(tr.equity)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Their rate</span>
                <span className="v">{st.rate}%</span>
              </div>
            </div>
            <div className="cmp-risk">
              Due-on-sale is real. Deals get done this way constantly, but go in with a refinance plan in case the note gets called.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
