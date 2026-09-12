import React, { useState } from 'react';

interface IdiotProofGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdiotProofGuideModal: React.FC<IdiotProofGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mmao' | 'steps' | 'terms' | 'rules'>('mmao');

  if (!isOpen) return null;

  return (
    <div
      className="modal-back"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10005,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="modal"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: '#111827',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#facc15' }}>
                Flipping &amp; Wholesaling 101: Explain Like I'm 12!
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              The idiot-proof guide to making offers, understanding MMAO, and never losing money.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Nav Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('mmao')}
            style={{
              flex: 1,
              padding: '12px 14px',
              border: 'none',
              background: activeTab === 'mmao' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'mmao' ? '3px solid #185fa5' : '3px solid transparent',
              color: activeTab === 'mmao' ? '#185fa5' : '#4b5563',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🎯 What is Live 70% MMAO?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            style={{
              flex: 1,
              padding: '12px 14px',
              border: 'none',
              background: activeTab === 'steps' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'steps' ? '3px solid #185fa5' : '3px solid transparent',
              color: activeTab === 'steps' ? '#185fa5' : '#4b5563',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🚀 How Wholesaling Works
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '12px 14px',
              border: 'none',
              background: activeTab === 'terms' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'terms' ? '3px solid #185fa5' : '3px solid transparent',
              color: activeTab === 'terms' ? '#185fa5' : '#4b5563',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📖 Cheat Sheet of Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            style={{
              flex: 1,
              padding: '12px 14px',
              border: 'none',
              background: activeTab === 'rules' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'rules' ? '3px solid #185fa5' : '3px solid transparent',
              color: activeTab === 'rules' ? '#185fa5' : '#4b5563',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Golden Rules of Negotiating
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, fontSize: '13px', lineHeight: 1.6, color: '#374151' }}>
          {activeTab === 'mmao' && (
            <div>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e3a8a', marginBottom: '4px' }}>
                  What is MMAO? (Maximum Allowable Offer)
                </div>
                <p style={{ margin: 0, color: '#1e40af' }}>
                  Think of MMAO as a <strong>safety fence</strong>. It is the absolute highest dollar amount you are allowed to offer the seller. If you offer $1 more than this number, you will lose money or your cash buyer will laugh at your deal and walk away!
                </p>
              </div>

              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: '#111827' }}>
                Why the "70% Rule"? (Jerry Norton Wholesaler Formula)
              </div>
              <p style={{ marginBottom: '12px' }}>
                Cash buyers (the people who actually buy your contract to fix the house) need to make a living! When they buy a fixer-upper, they have huge expenses:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#dc2626' }}>15% Profit</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>The flipper's reward for risking their money and managing contractors for 6 months.</div>
                </div>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#d97706' }}>10% Hard Money Loan</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Interest and points paid to private lenders while the house is being rebuilt.</div>
                </div>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#4b5563' }}>5% Closing &amp; Agent Fees</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Commissions to Realtors, title insurance, and transfer taxes.</div>
                </div>
              </div>

              <div style={{ background: '#111827', color: '#fff', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ color: '#facc15', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                  The 4-Step Arithmetic Formula:
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.7 }}>
                  1. <span style={{ color: '#67e8f9' }}>ARV</span> (What it's worth pretty) = $300,000<br />
                  2. Multiply by <strong>70% (0.70)</strong> = <span style={{ color: '#a7f3d0' }}>$210,000</span><br />
                  3. Minus <span style={{ color: '#fca5a5' }}>Rehab Cost</span> (e.g. $40,000) = $170,000<br />
                  4. Minus <span style={{ color: '#fde047' }}>Your Wholesale Fee</span> (e.g. $10,000) = <strong style={{ color: '#4ade80' }}>$160,000 MMAO</strong>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px' }}>
                🎉 Bottom Line: If you get the seller to sign at $160,000, you sell that contract to a flipper for $170,000. You walk away with a $10,000 wire on closing day without ever lifting a hammer!
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
                How Wholesaling Works in 4 Steps:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#185fa5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>Find a Distressed or Motivated Seller</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>A tired landlord, an inherited house, or an owner who needs to sell fast and doesn't want to fix it up.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#185fa5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>Calculate Your MMAO &amp; Get Under Contract</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>Use this calculator to find your 70% MMAO. Make an offer under MMAO. Sign a standard Purchase &amp; Sale Agreement with the seller.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#185fa5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>Assign the Contract to a Cash Buyer</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>Send the deal to local flippers and landlords. They sign a 1-page "Assignment of Contract" and pay your assignment fee.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>4</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#15803d' }}>Close at the Title Company &amp; Get Paid!</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>The title company coordinates escrow. The buyer wires the funds, the seller gets their payoff, and you receive your wholesale assignment fee!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
                Plain-English Cheat Sheet of Real Estate Buzzwords:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>ARV (After Repair Value): </span>
                  What the house is worth once completely remodeled to look like new. Look at the 3 highest sales of similar renovated homes within 0.5 miles on Zillow/Redfin.
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Rehab Budget: </span>
                  Money needed for paint, flooring, roof, kitchen, and bathrooms. If you don't know, use our 1-click Rehab Checklist!
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>DSCR (Debt Service Coverage Ratio): </span>
                  A loan where the bank doesn't look at your personal tax returns or job. They only look at whether the rent covers the monthly mortgage payment. (1.25x = Rent is 25% higher than the mortgage).
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Seller Finance: </span>
                  The seller acts as your bank! Instead of borrowing from Wells Fargo, you make monthly payments directly to the owner. Great when interest rates are high.
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Subject-To (Sub-To): </span>
                  You buy the house and keep the seller's current mortgage in place. You take deed ownership and simply make their low-interest monthly payments.
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Holding Costs: </span>
                  Money leaking out of the investor's pocket every month while fixing the house: mortgage interest, property taxes, insurance, electric, and water bills.
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, color: '#1e3a8a' }}>Balloon Payment: </span>
                  The deadline date when the remaining loan balance is due in full. (e.g. a 5-year balloon means you must refinance or sell within 5 years).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
                How to Negotiate Like a Pro:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                    1. The 3-Tier Offer Strategy
                  </div>
                  <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '12px', color: '#14532d' }}>
                    <li><strong>Anchor (80% of MMAO):</strong> Start here! Lowball opening bid. If they accept immediately, you make huge bonus money.</li>
                    <li><strong>Target (90% of MMAO):</strong> Where you actually aim to settle. Gives you your full fee and leaves plenty of meat on the bone.</li>
                    <li><strong>MMAO (100% of MMAO):</strong> Hard ceiling! Never cross this line on a standard flip.</li>
                  </ul>
                </div>

                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '4px' }}>
                    2. The Cardinal Sin: Never Pay More Than MMAO
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                    Beginner wholesalers often fall in love with a deal and offer above MMAO just to get a contract signed. Cash buyers will reject it, and you'll have to cancel the contract and look unprofessional.
                  </div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
                    3. Focus on Walk-Away Cash (Seller Net Sheet)
                  </div>
                  <div style={{ fontSize: '12px', color: '#78350f' }}>
                    Sellers don't care about the purchase price number — they care about what they pocket in their bank account! Use the <strong>Seller Net Sheet tool</strong> to show them: "After paying off your loan and liens, you walk away with $X cash in 14 days with zero Realtor commissions."
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            💡 Tip: Hover over any input, formula badge, or metric across the app for instant hints!
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#185fa5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Got It, Let's Flip!
          </button>
        </div>
      </div>
    </div>
  );
};
