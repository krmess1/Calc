import React, { useState } from 'react';

export const GuideTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'flow' | 'cheatsheet' | 'scripts' | 'pitfalls'>('flow');

  return (
    <div id="guide-tab" className="tab-panel">
      <div className="calc-box" style={{ display: 'block', padding: '20px' }}>
        
        {/* Navigation buttons inside Guide */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSection === 'flow' ? '1.5px solid #185fa5' : '1px solid #dcd8ce',
              background: activeSection === 'flow' ? '#eef4fb' : '#ffffff',
              color: activeSection === 'flow' ? '#185fa5' : '#555'
            }}
            onClick={() => setActiveSection('flow')}
          >
            📋 The 5-Step Underwriting Process
          </button>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSection === 'cheatsheet' ? '1.5px solid #185fa5' : '1px solid #dcd8ce',
              background: activeSection === 'cheatsheet' ? '#eef4fb' : '#ffffff',
              color: activeSection === 'cheatsheet' ? '#185fa5' : '#555'
            }}
            onClick={() => setActiveSection('cheatsheet')}
          >
            ⚡ Formulas & Rule of Thumb
          </button>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSection === 'scripts' ? '1.5px solid #185fa5' : '1px solid #dcd8ce',
              background: activeSection === 'scripts' ? '#eef4fb' : '#ffffff',
              color: activeSection === 'scripts' ? '#185fa5' : '#555'
            }}
            onClick={() => setActiveSection('scripts')}
          >
            🎙️ 3-Option Seller Presentation
          </button>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSection === 'pitfalls' ? '1.5px solid #185fa5' : '1px solid #dcd8ce',
              background: activeSection === 'pitfalls' ? '#eef4fb' : '#ffffff',
              color: activeSection === 'pitfalls' ? '#185fa5' : '#555'
            }}
            onClick={() => setActiveSection('pitfalls')}
          >
            ⚠️ Traps to Avoid
          </button>
        </div>

        {/* SECTION 1: The 5-Step Underwriting Process */}
        {activeSection === 'flow' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              Mastering the Underwriting Flow
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              Professional acquisition managers at companies like Buy Box Cartel don’t guess. They triage deals in 5 strict sequential steps:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>ARV (After Repair Value) Verification</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Find 3 sold comps within 0.5–1 mile in the last 90–180 days that match square footage (±20%) and bed/bath count. Never use active listings as your ARV—active listings are just asking prices that haven’t cleared the market yet.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Rapid Rehab Estimate</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Open the <strong>Rehab Scope Checklist</strong> at the bottom of the screen. Tick the high-ticket items: Roof, HVAC, Kitchen, Baths, Foundation, Windows. Add a 15% contingency buffer and click <em>"Send total to Fix & Flip rehab"</em>.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Determine Wholesaler MAO (The Jerry Norton Rule)</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Enter your target assignment fee (e.g., $10,000). The tool subtracts both the rehab and your fee from 70% of ARV. This guarantees that your cash buyer can buy at contract price + your fee and still achieve their 70% flip margin.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>4</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Check the 6 Exit Strategies on the "Compare" Tab</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  If the seller’s minimum price is higher than your Cash MAO, switch to the <strong>Compare</strong> tab. Can you make the deal work via <strong>Novation</strong> (light cosmetic), <strong>Subject-To</strong> (low existing interest rate), or <strong>Seller Financing</strong> (0–3% interest over time)?
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>5</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Present with Anchor, Target, and MAO</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Never open with your MAO. Start at the <strong>Anchor</strong> (80% of MAO). When the seller counters, make small concessions up toward your <strong>Target</strong> (90% of MAO), reserving your MAO as your absolute walk-away limit.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Formulas & Rule of Thumb */}
        {activeSection === 'cheatsheet' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              Formulas & Rule of Thumb Cheat Sheet
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              Keep these standard industry benchmarks in mind during phone calls and negotiations:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#fff', border: '1px solid #dcd8ce', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#27500a', fontSize: '0.9rem' }}>Wholesale MAO Formula</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', margin: '8px 0', background: '#f5f8f3', padding: '6px', borderRadius: '4px' }}>
                  MAO = (ARV × 70%) - Rehab - Assignment Fee
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  In hot tier-1 metro markets (e.g., Dallas, Phoenix, Atlanta), flippers frequently pay 75% to 78% of ARV. In rural areas, drop to 65%.
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dcd8ce', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#185fa5', fontSize: '0.9rem' }}>Quick Rehab Per-SqFt Rules</strong>
                <ul style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>Light / Cosmetic:</strong> $15 – $25 / sq ft (paint, flooring, cleaning, fixtures)</li>
                  <li><strong>Medium / Standard:</strong> $30 – $45 / sq ft (kitchen, bath, HVAC, some drywall)</li>
                  <li><strong>Heavy / Full Gut:</strong> $55 – $80+ / sq ft (roof, foundation, full re-wire/plumbing)</li>
                </ul>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dcd8ce', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#8a4b08', fontSize: '0.9rem' }}>DSCR (Debt Service Coverage Ratio)</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', margin: '8px 0', background: '#fcf8f2', padding: '6px', borderRadius: '4px' }}>
                  DSCR = Net Operating Income (NOI) / Debt Service (P&I)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Lenders require a minimum DSCR of <strong>1.20 to 1.25</strong>. If your ratio is 1.0, you are breaking even before vacancy. Always test at 80–85% occupancy.
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dcd8ce', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#5f2750', fontSize: '0.9rem' }}>Seller Finance 75% Balloon Refinance Test</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', margin: '8px 0', background: '#fbf4f9', padding: '6px', borderRadius: '4px' }}>
                  Max Refi Loan = Future Value × 75%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  If the remaining balance at balloon year (e.g. Year 5) exceeds 75% of projected value, a conventional refi will not cover it, requiring you to bring cash out-of-pocket.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: 3-Option Seller Presentation */}
        {activeSection === 'scripts' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              The 3-Option Offer Protocol (Kitchen Table Closer)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              Top closers never present a single take-it-or-leave-it price. Giving the seller three options gives them psychological autonomy:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f5f8f3', border: '1.5px solid #b7ceb3', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#27500a', fontSize: '1rem' }}>Option 1: The Fast Cash As-Is Close</strong>
                  <span style={{ fontSize: '0.8rem', background: '#27500a', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>Wholesale / Cash</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>"Mr. Seller, if you need this closed in 10 to 14 days with zero repairs, zero commissions, and us paying all your typical closing fees, we can do <strong>${'[Anchor Price]'}</strong> cash."</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> Guaranteed speed, no inspections, as-is condition. · <strong>Cons:</strong> Lowest net price to seller.
                </div>
              </div>

              <div style={{ background: '#eef4fb', border: '1.5px solid #a3c4ea', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#185fa5', fontSize: '1rem' }}>Option 2: The Top Dollar Partnering Route</strong>
                  <span style={{ fontSize: '0.8rem', background: '#185fa5', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>Novation Agreement</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>"If your priority is walking away with the absolute maximum net proceeds, we can partner up. We will advance minor cosmetic clean-up money, list it to retail buyers on the MLS, and guarantee you a net floor of <strong>${'[Target Price + 15%]'}</strong> in 60–90 days."</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> Higher price for seller. · <strong>Cons:</strong> Takes 60 to 90 days, relies on retail mortgage buyers.
                </div>
              </div>

              <div style={{ background: '#fdf8ee', border: '1.5px solid #ecd19b', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#8a4b08', fontSize: '1rem' }}>Option 3: The Monthly Income Retirement Plan</strong>
                  <span style={{ fontSize: '0.8rem', background: '#8a4b08', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>Seller Financing / SubTo</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>"If you want full asking price, we can pay you your full <strong>${'[Full Asking Price]'}</strong>, provided you are open to receiving 10% down and letting us pay you $800 to $1,200 every month like a steady bond."</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> Highest headline price, seller avoids huge lump-sum capital gains taxes. · <strong>Cons:</strong> Paid over time rather than lump sum.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Pitfalls to Avoid */}
        {activeSection === 'pitfalls' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              Costly Real Estate Traps to Avoid
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              These 4 errors account for 90% of lost earnest money deposits and dead deals:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '4px solid #b3261e', background: '#fdf2f2', padding: '12px 14px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>1. The "Zero Interest Trap" in Seller Financing</strong>
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px', lineHeight: 1.5 }}>
                  When interest is 0%, monthly payments are so low that cash flow looks good even at a $350k price on a $150k house. <strong>Cash flow is not your ceiling—market comps are.</strong> Never pay above market value just because terms are cheap.
                </div>
              </div>

              <div style={{ borderLeft: '4px solid #b3261e', background: '#fdf2f2', padding: '12px 14px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>2. Forgetting the Wholesale Fee in the 70% Formula</strong>
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px', lineHeight: 1.5 }}>
                  If you contract a house at <code>(ARV × 70%) - Rehab</code> and try to add a $15k assignment fee on top, your buyer’s total purchase price is <code>(ARV × 70%) - Rehab + $15k</code>, which breaks their 70% rule! Your fee must always be subtracted from your offer to the seller.
                </div>
              </div>

              <div style={{ borderLeft: '4px solid #b3261e', background: '#fdf2f2', padding: '12px 14px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>3. Subject-To Due-on-Sale & Insurance Mishaps</strong>
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px', lineHeight: 1.5 }}>
                  Lenders can exercise the acceleration clause if title transfers. Always maintain the seller as an additional insured or name them on a hazard insurance trust policy. Keep 6 months of reserves ready in case a loan needs to be refinanced or paid off.
                </div>
              </div>

              <div style={{ borderLeft: '4px solid #b3261e', background: '#fdf2f2', padding: '12px 14px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>4. Confusing Contract Price with Seller Net Walkaway</strong>
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px', lineHeight: 1.5 }}>
                  A seller asking for $180k might actually owe $175k on their mortgage plus $7k in back property taxes. If you offer $170k, they have to bring $12k in cash to the closing table to sell to you! Always verify their payoff using the <strong>Seller Net Sheet</strong> tool before signing.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
