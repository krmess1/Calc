import React, { useState } from 'react';

export const GuideTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'flow' | 'cheatsheet' | 'laws' | 'buyers' | 'scripts' | 'pitfalls'>('flow');
  const [stateSearch, setStateSearch] = useState('');

  const STATE_LAWS = [
    {
      state: 'Illinois',
      status: 'Restricted',
      law: '225 ILCS 454/1-10',
      summary: 'Requires a real estate broker license if you wholesale more than ONE (1) property assignment within 12 consecutive months.',
      solution: '100% Legal via Double Closing! When you buy on Contract A-B and resell on Contract B-C using 1-day transactional flash funding, you take actual title and are not "assigning" an equitable interest.',
    },
    {
      state: 'Oklahoma',
      status: 'Restricted',
      law: 'Senate Bill 927 (Predatory Real Estate Wholesaler Act)',
      summary: 'Prohibits publicly marketing equitable interest or assigning contracts without a real estate license.',
      solution: 'Use Double Closing or Novation agreements. Do not publicly market the equitable interest on MLS or social media without title.',
    },
    {
      state: 'Pennsylvania',
      status: 'Restricted (Philadelphia & Statewide)',
      law: 'Act 52 & Philly City Code',
      summary: 'Requires commercial wholesaler licensing in Philadelphia and strictly enforces anti-predatory marketing laws.',
      solution: 'Double close with transactional funding through an investor-friendly title company (e.g., Chicago Title or First American).',
    },
    {
      state: 'South Carolina',
      status: 'Restricted',
      law: 'SC Real Estate License Law Updates',
      summary: 'Requires licensed representation or actual ownership to publicly advertise residential real property for sale.',
      solution: 'Double closing eliminates assignment disputes entirely. You become the buyer on record before selling.',
    },
    {
      state: 'Texas',
      status: 'Disclosure Required',
      law: 'Tex. Prop. Code § 5.086',
      summary: 'Wholesaling is legal, but you MUST disclose in writing to both seller and buyer that you hold only equitable title, not legal title.',
      solution: 'Include standard Texas Wholesaling Equitable Disclosure addendum, or double close if assignment spread is >$15,000.',
    },
    {
      state: 'Florida',
      status: 'Open / Standard',
      law: 'FL Stat. § 475.43',
      summary: 'Standard contract assignments are legal with standard "and/or assigns" language. You cannot market the real property itself—you can only market the contract.',
      solution: 'Open wholesaling. For $25k-$50k spreads, double close to keep your fee private.',
    },
    {
      state: 'Ohio',
      status: 'Open / Standard',
      law: 'Ohio Division of Real Estate',
      summary: 'Assignments are legal. Marketing contracts must clearly state you are selling your contractual interest.',
      solution: 'Standard assignment or double close with transactional funding.',
    },
    {
      state: 'Michigan',
      status: 'Open / Standard',
      law: 'MI Occupational Code',
      summary: 'High-volume wholesale hub (Detroit, Flint, Lansing). Standard assignment agreements are widely accepted by title companies.',
      solution: 'Standard wholesale assignment or dispo partnership with Richard Taylor / Hold My Hand Wholesale.',
    },
    {
      state: 'Hawaii',
      status: 'Open / High Dollar',
      law: 'Hawaii Revised Statutes Chapter 467',
      summary: 'Legal to assign contracts. Because property prices are high ($800k - $2M+), wholesale fees are often $30,000 to $75,000+.',
      solution: 'ALWAYS Double Close on Hawaii luxury deals! Sellers and buyers will balk if they see a $50k assignment fee on a standard settlement statement.',
    },
    {
      state: 'California',
      status: 'Open / High Dollar',
      law: 'CA Business and Professions Code',
      summary: 'Legal to assign purchase agreements. High median home values mean spreads routinely exceed $25,000.',
      solution: 'Double close with 1-day transactional funding. Title companies routinely facilitate back-to-back escrow.',
    },
    {
      state: 'Georgia & North Carolina',
      status: 'Open / Attorney State',
      law: 'Closing Attorney Escrow',
      summary: 'Real estate transactions must close with a licensed closing attorney. Assignments are 100% legal with investor-friendly closing attorneys.',
      solution: 'Use established investor-friendly closing attorneys who understand assignments and transactional funding.',
    },
  ];

  const filteredStates = STATE_LAWS.filter((s) =>
    s.state.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.law.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.status.toLowerCase().includes(stateSearch.toLowerCase())
  );

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
              color: activeSection === 'flow' ? '#185fa5' : '#555',
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
              color: activeSection === 'cheatsheet' ? '#185fa5' : '#555',
            }}
            onClick={() => setActiveSection('cheatsheet')}
          >
            ⚡ Formulas &amp; Rule of Thumb
          </button>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSection === 'laws' ? '1.5px solid #0284c7' : '1px solid #bae6fd',
              background: activeSection === 'laws' ? '#e0f2fe' : '#f0f9ff',
              color: activeSection === 'laws' ? '#0369a1' : '#0284c7',
            }}
            onClick={() => setActiveSection('laws')}
          >
            ⚖️ 50-State Laws &amp; Double Close Matrix
          </button>
          <button
            type="button"
            className="guide-pill-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSection === 'buyers' ? '1.5px solid #16a34a' : '1px solid #bbf7d0',
              background: activeSection === 'buyers' ? '#ecfdf5' : '#f0fdf4',
              color: activeSection === 'buyers' ? '#15803d' : '#16a34a',
            }}
            onClick={() => setActiveSection('buyers')}
          >
            💰 $5k to $50k Paydays &amp; Free Skip Tracing
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
              color: activeSection === 'scripts' ? '#185fa5' : '#555',
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
              color: activeSection === 'pitfalls' ? '#185fa5' : '#555',
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
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Rehab Estimation by Bucket</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Don’t measure square inches over the phone. Bucket the property into:
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li><strong>Cosmetic ($15–$25/sqft):</strong> Paint, carpet, hardware, fixtures.</li>
                    <li><strong>Standard ($35–$45/sqft):</strong> Kitchen update, 2 baths, flooring, minor mechanicals.</li>
                    <li><strong>Full Gut ($55–$75+/sqft):</strong> Roof, HVAC, plumbing, structural repairs, full remodel.</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Run 70% Fix &amp; Flip MMAO Baseline</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Formula: <code>(ARV × 70%) − Rehab − Wholesale Fee</code>. This establishes your cash-offer ceiling. If the seller’s asking price is below this number, lock it up on a cash purchase agreement immediately!
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>4</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Triage to Creative (If Cash Ceiling Fails)</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  If the seller rejects your 70% cash number because they need full retail:
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li><strong>Do they have low-rate debt (&lt;5%)?</strong> Run <strong>Subject-To</strong> to capture their interest rate.</li>
                    <li><strong>Do they own it free and clear?</strong> Run <strong>Seller Financing</strong> at 0%–4% interest to hit positive cash flow.</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#185fa5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>5</span>
                  <strong style={{ fontSize: '0.95rem', color: '#2c2c2a' }}>Present Multi-Offer &amp; Close</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                  Never present a single take-it-or-leave-it price. Present 3 choices (Cash Discount, Seller Finance at Full Price, or Subject-To hybrid). Giving options shifts the seller’s psychology from <em>&quot;Should I work with you?&quot;</em> to <em>&quot;Which of your offers works best for me?&quot;</em>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Formulas & Rule of Thumb */}
        {activeSection === 'cheatsheet' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              ⚡ Underwriting Cheat Sheet &amp; Rapid Workflow
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              Key underwriting math, 30-second Zillow triage workflow, and creative buyer evaluation criteria:
            </p>

            {/* 30-Second Rapid Zillow Triage Workflow Card */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '16px 18px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <strong style={{ fontSize: '1rem', color: '#166534' }}>
                  The 30-Second Zillow Rapid Triage Workflow
                </strong>
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  3 Core Inputs Only
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.55, marginBottom: '12px' }}>
                You do not need 50 variables to know if a deal works. In 30 seconds on Zillow, grab only these 3 numbers:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.85rem' }}>1. List Price (Asking)</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                    What the seller or agent is asking on Zillow. Enter this into <strong>List / Asking Price</strong>.
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.85rem' }}>2. Monthly Rent</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                    Look at the Zillow <strong>Rent Zestimate</strong> or Rentometer median. Enter this into <strong>Monthly Rent</strong>.
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.85rem' }}>3. Monthly Taxes + Insurance</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                    Scroll down Zillow to <em>&quot;Monthly cost&quot;</em>. Add property taxes + insurance (e.g. $220/mo).
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                <strong style={{ color: '#14532d', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                  ⚡ Dynamic Auto-Generate (ON / OFF) &amp; Drop-In Offer Button
                </strong>
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  Use the <strong>Auto-Generate [ON / OFF]</strong> toggle to choose how you want offers calculated:
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>
                      <strong>When ON (Dynamic Real-Time Sync):</strong> As you type the List Price, Rent, Taxes, Insurance, Rehab, or Fees, your purchase offer dynamically recalculates live! No button click needed.
                    </li>
                    <li>
                      <strong>When OFF (Manual Control):</strong> If you want to lock in your own custom negotiated price, simply toggle OFF (or start typing a price). Then use the <strong>⚡ Drop In Smart Offer</strong> button whenever you want to instantly drop in the formula-recommended target.
                    </li>
                    <li>
                      <strong>Dual Underwriting Engine:</strong> Runs both the <strong>Richard Taylor DSCR Formula</strong> (≥1.25 DSCR &amp; ~20% Cash-on-Cash) and the <strong>Jerry Norton 70% Fix &amp; Flip Ceiling</strong> simultaneously, automatically choosing the safer, lower entry price!
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>Do Fix &amp; Flips Still Need Comps?</strong><br />
                <em>Yes!</em> For the 30-second initial screen, the app temporarily uses List Price to instantly triage. Once a seller shows motivation or asks for an offer, you <strong>must verify 3 recently sold, remodeled comps within 0.5–1 mile</strong> (last 90–180 days) to lock in the true ARV and walk through the Rehab Scope Checklist.
              </div>
            </div>

            {/* Global Rule: Why Entry Price is Highlighted First on All Deal Types */}
            <div
              style={{
                background: '#fefce8',
                border: '1.5px solid #facc15',
                borderRadius: '10px',
                padding: '16px 18px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                <strong style={{ fontSize: '1rem', color: '#854d0e' }}>
                  The Golden Underwriting Rule: Entry Price First, Asset Price Second
                </strong>
                <span
                  style={{
                    background: '#fef08a',
                    color: '#713f12',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #fde047',
                  }}
                >
                  All 5 Deal Types
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#713f12', lineHeight: 1.55, marginBottom: '10px' }}>
                Across every deal strategy, serious real estate investors never look at the headline asset price in isolation. They evaluate <strong>Entry Price (Cash to Close)</strong> first:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#166534', display: 'block', marginBottom: '3px' }}>1. DSCR Rentals:</strong>
                  <span style={{ color: '#334155' }}>
                    <strong>Entry Price:</strong> Down payment + wholesale fee. Lenders leverage 80% of the asset; buyers only care how much cash flow they get for their actual entry capital (~20% CoC).<br />
                    <strong style={{ color: '#b45309' }}>Condition Rule:</strong> Standard DSCR loans require <strong>rent-ready / turnkey condition</strong> ($0–$10k light cosmetic). DSCR lenders will not approve properties needing heavy rehab. For heavy fixer-uppers, wholesale via the <strong>Fix &amp; Flip tab</strong> (70% rule) to a cash buyer to keep deals simple!
                  </span>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '3px' }}>2. Seller Finance:</strong>
                  <span style={{ color: '#334155' }}>
                    <strong>Entry Price:</strong> Down payment + wholesale fee. The seller acts as the bank, so total purchase price can be 100% of retail as long as monthly cash flow is positive and risk is capped by the 2-month walkaway clause.
                  </span>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#0f766e', display: 'block', marginBottom: '3px' }}>3. Subject-To:</strong>
                  <span style={{ color: '#334155' }}>
                    <strong>Entry Price:</strong> Cash to seller + wholesale fee. Minimal out-of-pocket cash captures an expensive asset with instant day-1 equity and a locked-in low interest rate mortgage.
                  </span>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#b45309', display: 'block', marginBottom: '3px' }}>4. Fix &amp; Flip:</strong>
                  <span style={{ color: '#334155' }}>
                    <strong>Entry Price:</strong> Purchase contract + wholesale fee. Flippers check this contract acquisition cost first to make sure it respects the 70% rule before committing construction and carry capital.
                  </span>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '6px', padding: '10px' }}>
                  <strong style={{ color: '#7c3aed', display: 'block', marginBottom: '3px' }}>5. Double Close:</strong>
                  <span style={{ color: '#334155' }}>
                    <strong>Entry Price:</strong> Contract #1 (A-B) purchase price wired by transactional flash funding on closing morning before reselling to Cash Buyer C in the afternoon.
                  </span>
                </div>
              </div>
            </div>

            {/* Creative Financing & Seller Finance Buyer Mindset Card */}
            <div
              style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                borderRadius: '10px',
                padding: '16px 18px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🤝</span>
                <strong style={{ fontSize: '1rem', color: '#1e40af' }}>
                  Seller Finance &amp; Creative Buyers: Entry Price vs. Cash Flow
                </strong>
                <span
                  style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Nationwide Buyer Psychology
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.55, marginBottom: '10px' }}>
                Why creative finance buyers will look at deals in <strong>any zip code or market nationwide</strong>:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px' }}>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    1. Entry Price / Cash to Close (What Buyer Actually Pays)
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                    Creative buyers do <strong>NOT</strong> bring the full purchase price to closing. The seller acts as the bank! The buyer only pays:
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', margin: '6px 0', fontFamily: 'monospace', fontSize: '0.8rem', color: '#1e40af' }}>
                      Cash to Close = Down Payment to Seller + Wholesaler Assignment Fee
                    </div>
                    They evaluate: <em>&quot;How much cash out-of-pocket do I need to acquire this cash flowing deed?&quot;</em>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px' }}>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    2. Monthly Cash Flow &amp; Cash-on-Cash Yield
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                    Because creative buyers put down only 5% to 15%, their Cash-on-Cash Return is often <strong>20% to 40%+</strong>!
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', margin: '6px 0', fontFamily: 'monospace', fontSize: '0.8rem', color: '#1e40af' }}>
                      CoC % = (Monthly Net Cash Flow × 12) ÷ (Down + Fee)
                    </div>
                    As long as the note rate is low (0%–4%) and monthly cash flow is strong, the total retail price matters much less to them.
                  </div>
                </div>
              </div>

              {/* The Miss 2 Months Exit Strategy */}
              <div style={{ background: '#ffffff', border: '1.5px solid #60a5fa', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem' }}>🛡️</span>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>
                    The &quot;Miss 2 Months&quot; Walkaway Exit Strategy
                  </strong>
                </div>
                <div style={{ fontSize: '0.83rem', color: '#334155', lineHeight: 1.5 }}>
                  In professional seller finance agreements, creative buyers include a <strong>performance / deed-in-lieu forfeiture clause</strong>. If the tenant defaults, local market shifts, or performance drops:
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>
                      <strong>The Exit:</strong> If the buyer misses 2 consecutive monthly payments, the title/deed automatically reverts back to the original seller.
                    </li>
                    <li>
                      <strong>Zero Personal Liability:</strong> The seller keeps all payments made to date plus the original down payment, but the buyer has <strong>no personal foreclosure judgment or deficiency balance</strong>.
                    </li>
                    <li>
                      <strong>Why Buyers Buy Anywhere:</strong> Because the buyer’s maximum financial risk is strictly capped at their upfront entry cash (Down + Fee), they can aggressively buy profitable cash flow across any state or city without fear of long-term debt default!
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#185fa5', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                  🏢 DSCR (Debt Service Coverage Ratio)
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
                  <code>DSCR = Effective Rent ÷ Monthly Debt (PITI)</code>
                  <br />
                  <strong>Lender Thresholds:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.8rem', color: '#666' }}>
                    <li><strong>&lt; 1.00:</strong> Negative cash flow (Decline).</li>
                    <li><strong>1.00–1.19:</strong> Break-even / tight (Higher rate or larger down required).</li>
                    <li><strong>≥ 1.25:</strong> Golden approval ratio for all institutional lenders.</li>
                    <li><strong>Property Condition:</strong> Must be rent-ready (C1–C4 condition rating). DSCR loans do not fund heavy rehabs, structural issues, or uninhabitable homes.</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#185fa5', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                  🤝 Seller Financing Balloon Safety
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
                  <code>Max Loan at Balloon = ARV × (1 + Appr%)^Years × 75%</code>
                  <br />
                  <strong>Rule of Thumb:</strong> Never agree to a balloon under 5 years unless your entry price is &lt;65% of value. At year 5, a conventional 75% LTV refinance must fully pay off the remaining note.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#185fa5', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                  📑 Subject-To Safety Buffer
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
                  <code>Cash-to-Seller Limit = Value − Existing Loan − $15,000 Safety Buffer</code>
                  <br />
                  <strong>Rule of Thumb:</strong> If an existing mortgage has an interest rate &gt;6%, Subject-To generally doesn’t make sense. Sub-To shines when the existing note is 2.5%–4.5%.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#185fa5', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                  🔨 Fix &amp; Flip Profit Margin
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
                  <code>Net Profit = Resale − Purchase − Rehab − Holding − Closing (9%)</code>
                  <br />
                  <strong>Rule of Thumb:</strong> Cash flippers require at least $25,000 to $40,000 net profit and &gt;15% ROI to justify the project risk.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: 50-State Real Estate Wholesaling Laws & Double Close Matrix */}
        {activeSection === 'laws' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0369a1', margin: 0 }}>
                  ⚖️ 50-State Real Estate Wholesaling &amp; Double Close Guide
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  How to legally wholesale real estate nationwide with <strong>NO license required</strong> using back-to-back Double Closing!
                </div>
              </div>

              <input
                type="text"
                placeholder="🔍 Filter by State (e.g. Illinois, Florida, Hawaii)..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '6px',
                  width: '260px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Core Legal Principles */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px solid #7dd3fc',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '16px',
                lineHeight: 1.55,
                fontSize: '0.88rem',
                color: '#0c4a6e',
              }}
            >
              <strong>🛡️ The Wholesaling Golden Legal Rule:</strong>
              <div style={{ marginTop: '4px' }}>
                1. <strong>Selling a Contract vs. Selling Real Estate:</strong> Unlicensed real estate wholesaling is strictly legal because you are NOT brokering or selling real estate for someone else—you are selling <em>your own equitable interest</em> in a purchase agreement you personally entered into as the buyer.<br />
                2. <strong>Why Double Closing is 100% Legal in All 50 States:</strong> When states pass restrictive laws (like Illinois, Oklahoma, or Pennsylvania) targeting assignment marketing, <strong>Double Closing completely bypasses those restrictions</strong>. On Contract A-B, you purchase the property and take legal title. On Contract B-C, you sell property you own to the end buyer. You never &quot;assign&quot; anything!<br />
                3. <strong>Transactional Funding:</strong> 1-day flash lenders fund 100% of your Contract A-B purchase for 1% to 1.5% fee ($500-$1,500). When Contract B-C wires in minutes later, the flash lender is repaid and your net profit is wired directly to you.
              </div>
            </div>

            {/* State Matrix Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredStates.map((s) => (
                <div
                  key={s.state}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{s.state}</strong>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: s.status.includes('Restricted') ? '#fee2e2' : s.status.includes('High Dollar') ? '#fef3c7' : '#ecfdf5',
                          color: s.status.includes('Restricted') ? '#b91c1c' : s.status.includes('High Dollar') ? '#b45309' : '#047857',
                        }}
                      >
                        {s.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      {s.law}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '4px' }}>
                    <strong>Statute Summary:</strong> {s.summary}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#0369a1', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #0284c7' }}>
                    <strong>Best Strategy:</strong> {s.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: $5k to $50k Paydays & Free Skip Tracing Playbook */}
        {activeSection === 'buyers' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#15803d', marginBottom: '6px' }}>
              💰 $5k to $50k+ Big Payday Wholesaling &amp; Free Skip Tracing
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              How pro wholesalers make consistent $5k-$10k bread-and-butter checks in the Midwest with Richard Taylor, and unlock huge $25k to $50k+ assignment paydays in high-dollar coastal markets like Hawaii, California, and Florida:
            </p>

            {/* Payday Tier Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#166534', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
                  🍞 Midwest Volume Deals ($5k to $10k Checks)
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                  <strong>Markets:</strong> Detroit, Cleveland, Memphis, Indianapolis, Kansas City.<br />
                  <strong>Strategy:</strong> Working with Richard Taylor and Hold My Hand Wholesale dispo buyers. These buyers want turnkey cash flow:<br />
                  • <strong>DSCR ≥ 1.25</strong> (Rent covers PITI by at least 25%).<br />
                  • <strong>~20% Cash-on-Cash Return</strong>.<br />
                  • Low entry prices ($60k–$160k). Easy to contract, fast title turnarounds, volume assignments.
                </div>
              </div>

              <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: '8px', padding: '14px' }}>
                <strong style={{ color: '#854d0e', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
                  🌴 Coastal &amp; Sunbelt Jumbo Spreads ($25k to $50k+ Checks)
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                  <strong>Markets:</strong> Hawaii (Oahu, Maui), Southern California, South Florida, Scottsdale.<br />
                  <strong>The Math:</strong> On an $800,000 property, negotiating just a 10% discount is an <strong>$80,000 spread!</strong><br />
                  • Cash buyers in Hawaii or SoCal regularly pay $35,000 to $50,000 assignment fees because their flip profits exceed $120,000.<br />
                  • <strong>Always Double Close:</strong> On $25k-$50k fees, use double closing so the seller never gets angry seeing a $50k check on their settlement statement.
                </div>
              </div>
            </div>

            {/* Free Skip Tracing & Finding Cash Buyers */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '16px', lineHeight: 1.55 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: '#0f172a' }}>
                🔍 How to Find Real Cash Buyers for FREE (No Paid Software Required)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem', color: '#334155' }}>
                <div>
                  <strong style={{ color: '#0369a1' }}>Step 1: County Property Appraiser / Recorder of Deeds (Free Public Data)</strong>
                  <div style={{ marginTop: '2px' }}>
                    Go to the online public records of your target county (e.g. Honolulu County, Wayne County MI, Maricopa County AZ). Search recently recorded Deeds in the last 90 days. Filter for properties where <strong>NO Mortgage / Deed of Trust</strong> was recorded. If there is no mortgage, it was bought with 100% CASH!
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0369a1' }}>Step 2: Spot the Entity &amp; Repeat Buyer</strong>
                  <div style={{ marginTop: '2px' }}>
                    Look for purchases under LLCs, Trusts, or Holding companies (e.g. <em>Aloha Homes LLC</em>, <em>Midwest Cash Holdings LLC</em>). Click the LLC name to see how many properties they have bought in the last 12 months. An LLC with 3+ purchases is an active, hungry cash buyer!
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0369a1' }}>Step 3: Free Secretary of State Entity Search</strong>
                  <div style={{ marginTop: '2px' }}>
                    Go to the state’s Secretary of State business search (e.g., Hawaii DCCA, Florida Sunbiz, Michigan LARA). Search the LLC name to find the Managing Member’s full legal name and mailing address.
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0369a1' }}>Step 4: 100% Free Skip Tracing Engines</strong>
                  <div style={{ marginTop: '2px' }}>
                    Plug the managing member&apos;s name and city into free public lookups:
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      <li><code>TruePeopleSearch.com</code>: Pulls cell phone numbers, current carrier, and associated emails.</li>
                      <li><code>FastPeopleSearch.com</code>: Free reverse phone &amp; address lookup.</li>
                      <li><code>CyberBackgroundChecks.com</code>: Detailed property ownership and relative records.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#0369a1' }}>Step 5: The Reverse Wholesaling Script</strong>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', borderLeft: '3px solid #16a34a', marginTop: '4px', fontStyle: 'italic' }}>
                    &quot;Hey [First Name], I saw your LLC closed on [Address] recently for cash. I run acquisitions locally—I’m locking up two more off-market properties this week. What’s your exact buy box (zip codes, price ceiling, minimum discount) so I can bring you the next one before anyone else sees it?&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: 3-Option Seller Presentation */}
        {activeSection === 'scripts' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#185fa5', marginBottom: '8px' }}>
              The 3-Option Seller Presentation Script
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              When presenting your offer to a motivated seller, use this exact script to position yourself as an advisor rather than an adversary:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#2c2c2a', marginBottom: '4px' }}>
                  Option A: The Guaranteed Cash As-Is Close
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>&quot;If you need speed and certainty, we can close in 14 days, pay 100% cash, cover all your closing costs, and buy it completely as-is. Because we take on all the repair and market risks, our cash number is <strong>${'{Anchor Price}'}</strong>.&quot;</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> No repairs, no agent commissions, guaranteed 14-day wire. · <strong>Cons:</strong> Lowest headline price.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#2c2c2a', marginBottom: '4px' }}>
                  Option B: The Debt Relief / Equity Partnership (Subject-To)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>&quot;If you have an existing low-interest mortgage, we can give you <strong>${'{Cash to Seller}'}</strong> in moving money at the closing table, and take over your exact monthly payments on day 1 so your credit receives on-time payment history.&quot;</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> Immediate mortgage relief, preserves credit, cash in pocket. · <strong>Cons:</strong> Existing loan remains in seller&apos;s name until refinanced.
                </div>
              </div>

              <div style={{ background: '#faf9f5', border: '1px solid #e5e0d4', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#2c2c2a', marginBottom: '4px' }}>
                  Option C: The Top-Dollar Wealth Builder (Seller Financing)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, margin: '6px 0' }}>
                  <em>&quot;If you want full asking price, we can pay you your full <strong>${'{Full Asking Price}'}</strong>, provided you are open to receiving 10% down and letting us pay you $800 to $1,200 every month like a steady bond.&quot;</em>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <strong>Pros:</strong> Highest headline price, seller avoids huge lump-sum capital gains taxes. · <strong>Cons:</strong> Paid over time rather than lump sum.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Pitfalls to Avoid */}
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
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>1. The &quot;Zero Interest Trap&quot; in Seller Financing</strong>
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
                <strong style={{ color: '#b3261e', fontSize: '0.9rem' }}>3. Subject-To Due-on-Sale &amp; Insurance Mishaps</strong>
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
