import React, { useState } from 'react';
import { UniversalProperty, StrategyTab, OfferRange } from '../types';
import { money } from '../utils/calc';

interface OfferDispatchWidgetProps {
  strategy: StrategyTab;
  property: UniversalProperty;
  offerRange: OfferRange;
  metrics: {
    entryPrice: number;
    monthlyCashFlow?: number;
    totalBasis?: number;
    profit?: number;
    roi?: number;
    dscrRatio?: number;
    coc?: number;
    equity?: number;
  };
}

export const OfferDispatchWidget: React.FC<OfferDispatchWidgetProps> = ({
  strategy,
  property,
  offerRange,
  metrics,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<'text' | 'email' | 'call'>('text');
  const [targetPrice, setTargetPrice] = useState<number>(
    property.purchasePrice || offerRange.target || offerRange.anchor || property.listPrice || 0
  );
  const [optionConsideration, setOptionConsideration] = useState<number>(100);
  const [sellerName, setSellerName] = useState<string>('Listing Agent / Seller');

  // Keep targetPrice updated if property.purchasePrice changes and user hasn't explicitly customized
  React.useEffect(() => {
    if (property.purchasePrice > 0) {
      setTargetPrice(property.purchasePrice);
    }
  }, [property.purchasePrice]);

  const address = property.address || 'the property';
  const isOhio = address.toUpperCase().includes(' OH') || address.toUpperCase().includes('OHIO');

  // Strategy names & key terms
  const strategyTitles: Record<StrategyTab, string> = {
    dscr: 'Cash / Turnkey Rental Offer',
    sf: 'Seller Financing / Owner Terms Offer',
    st: 'Subject-To Existing Mortgage Takeover Offer',
    ff: 'Cash As-Is / Fast Close Fix & Flip Offer',
    dc: 'Double Close Wholesale Offer',
    cmp: 'Multi-Option Comparison Offer',
    guide: 'Offer Script',
  };

  const title = strategyTitles[strategy] || 'Property Offer';

  // Compose dynamic texts based on strategy
  const generateSMS = (): string => {
    if (strategy === 'ff') {
      return `Hi ${sellerName}, re: ${address}. We can offer ${money(targetPrice)} as-is cash, zero contingencies, buyer covers normal closing costs with $1,000 EMD deposited at title. Can close in 14-21 days or whenever seller prefers. Would that price work for the seller to get this wrapped up quickly?`;
    }
    if (strategy === 'sf') {
      const downPmt = money(Math.round(targetPrice * (property.sfDown / 100)));
      const monthlyPmt = money(Math.round(metrics.monthlyCashFlow ? property.rent * 0.8 - metrics.monthlyCashFlow : (targetPrice * 0.9) / (property.sfAmort * 12)));
      return `Hi ${sellerName}, re: ${address}. If the seller wants top-dollar closer to list, we can offer ${money(targetPrice)} with ${downPmt} down (${property.sfDown}%), monthly payments of ~${monthlyPmt}/mo at ${property.sfRate}% interest, and a ${property.sfBalloon}-year balloon. Is the seller open to receiving guaranteed monthly cash flow?`;
    }
    if (strategy === 'st') {
      return `Hi ${sellerName}, re: ${address}. We can offer $10-$100 option consideration, take over the existing ${property.stRate}% mortgage payments of record, and provide ${money(property.stCashToSeller)} cash at closing for moving expenses. Zero bank delays, deed transfers at closing, and payments made directly to the loan servicer. Would the seller consider taking over payments?`;
    }
    // DSCR / Default
    return `Hi ${sellerName}, re: ${address}. Reviewing the listing for our rental fund. We can offer ${money(targetPrice)} with 21-day close, $1,000 EMD, and standard inspection period. Strong proof of funds ready. Let me know if that clears the bar to submit a formal contract today!`;
  };

  const generateEmail = (): { subject: string; body: string } => {
    const subject = `Offer Submission: ${address} - ${money(targetPrice)} (${title})`;
    let details = '';

    if (strategy === 'ff') {
      details = `
- Purchase Price: ${money(targetPrice)} (As-Is, Cash / Hard Money)
- Earnest Money Deposit: $1,000 held by investor-friendly title/escrow
- Inspection Period: 7-10 days
- Closing Timeline: 14 to 21 business days (Seller's choice of closing date)
- Closing Costs: Buyer pays typical buyer closing fees
- Property Condition: 100% As-Is, zero repair requests or post-inspection credits requested
${isOhio ? '- Ohio Compliance: Equitable interest disclosure included / standard transactional title settlement.' : ''}
`;
    } else if (strategy === 'sf') {
      const downPmt = money(Math.round(targetPrice * (property.sfDown / 100)));
      details = `
- Total Purchase Price: ${money(targetPrice)} (Near or at Asking Price)
- Upfront Down Payment: ${downPmt} (${property.sfDown}% down to seller)
- Interest Rate: ${property.sfRate}% Fixed
- Monthly Principal & Interest: Paid on the 1st of each month via 3rd-party loan servicer
- Loan Term / Balloon: ${property.sfBalloon} Years (${property.sfAmort}-year amortization)
- Buyer Default Protection: Standard Deed-in-Lieu / Performance clause protecting seller equity
${isOhio ? '- Ohio Note: Land Installment Contract (R.C. 5313) or Note & Mortgage depending on seller preference.' : ''}
`;
    } else if (strategy === 'st') {
      details = `
- Total Transaction Value: ${money(property.propertyValue || targetPrice)}
- Cash to Seller at Closing: ${money(property.stCashToSeller)} (for moving / transition funds)
- Option Consideration: $10 - $100 option consideration
- Existing Mortgage Taken Over: ${money(property.stMortgageBalance)} at ${property.stRate}%
- Monthly Debt Servicing: Buyer assumes all monthly payments, taxes, hazard insurance, and HOA
- Loan Servicing: Serviced through professional 3rd party loan servicing (e.g. Weststar / NoteServicing)
${isOhio ? '- Ohio Note: Recorded standard Special Warranty Deed with written mortgage disclosure.' : ''}
`;
    } else {
      // DSCR / Rental
      details = `
- Purchase Price: ${money(targetPrice)}
- Financing: Conventional / DSCR Investor Loan (Pre-Approved with 20% down)
- Earnest Money: $2,500 held in escrow
- Inspection Period: 10 calendar days
- Closing Timeline: 21 to 28 days
`;
    }

    const body = `Dear ${sellerName},

Please present this purchase offer for ${address} to the seller:

SUMMARY OF KEY OFFER TERMS:
${details}
WHY THIS OFFER WORKS FOR THE SELLER:
- Rapid certainty of close with experienced real estate investors
- Clean terms with no unnecessary lender red tape
- Flexible closing date tailored to seller's relocation schedule

Please let us know if the seller accepts or if you would like us to draft the standard state contract agreement immediately.

Best regards,
Acquisitions Team
Direct Contact: (Ready to sign today)`;

    return { subject, body };
  };

  const emailData = generateEmail();
  const smsText = generateSMS();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleOpenGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(url, '_blank');
  };

  const handleOpenMailto = () => {
    const url = `mailto:?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = url;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '10px',
        padding: '16px',
        marginTop: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📤</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              1-Click Offer Dispatch &amp; Agent Script Widget
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Instant SMS, Email, or verbal call scripts tailored to {strategy.toUpperCase()} strategy for {address}
            </div>
          </div>
        </div>

        {/* Script Format Picker */}
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
          <button
            type="button"
            onClick={() => setSelectedScript('text')}
            style={{
              background: selectedScript === 'text' ? '#ffffff' : 'transparent',
              color: selectedScript === 'text' ? '#0f172a' : '#64748b',
              border: selectedScript === 'text' ? '1px solid #cbd5e1' : 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedScript === 'text' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            📱 SMS / Text
          </button>
          <button
            type="button"
            onClick={() => setSelectedScript('email')}
            style={{
              background: selectedScript === 'email' ? '#ffffff' : 'transparent',
              color: selectedScript === 'email' ? '#0f172a' : '#64748b',
              border: selectedScript === 'email' ? '1px solid #cbd5e1' : 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedScript === 'email' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            ✉️ Formal Email
          </button>
          <button
            type="button"
            onClick={() => setSelectedScript('call')}
            style={{
              background: selectedScript === 'call' ? '#ffffff' : 'transparent',
              color: selectedScript === 'call' ? '#0f172a' : '#64748b',
              border: selectedScript === 'call' ? '1px solid #cbd5e1' : 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedScript === 'call' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            📞 Phone Script
          </button>
        </div>
      </div>

      {/* Offer Pricing Quick Tweaker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Offer Price to Send:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>$</span>
            <input
              type="number"
              value={targetPrice || ''}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              step={1000}
              style={{
                width: '100%',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Agent / Seller Name:</div>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            placeholder="Agent / Owner name"
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              marginTop: '2px',
            }}
          />
        </div>

        {strategy === 'st' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Option Consideration:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>$</span>
              <input
                type="number"
                value={optionConsideration}
                onChange={(e) => setOptionConsideration(parseFloat(e.target.value) || 0)}
                placeholder="10-100"
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>
              Virtually $0 out-of-pocket option!
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Strategy Context:</div>
          <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, marginTop: '5px' }}>
            {strategy.toUpperCase()} · Entry: <strong>{money(metrics.entryPrice)}</strong>
            {metrics.monthlyCashFlow !== undefined && ` · ${money(metrics.monthlyCashFlow)}/mo CF`}
            {metrics.profit !== undefined && ` · ${money(metrics.profit)} Net Flip`}
          </div>
        </div>
      </div>

      {/* State Specific Alert for Ohio or other states */}
      {isOhio && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11px',
            color: '#92400e',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚖️</span>
          <span>
            <strong>Ohio Strategy Rule Active:</strong> In Ohio, creative financing (R.C. 5313 Land Installment Contracts or Subject-To Deeds) requires specific written disclosures. If wholesaling wholesale cash deals with &gt;$10k assignment fee, consider a <strong>Double Close</strong> to keep your fee confidential from listing agents.
          </span>
        </div>
      )}

      {/* Script Content Viewer */}
      {selectedScript === 'text' && (
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
            📱 Fast Agent Text / SMS Script:
          </div>
          <textarea
            readOnly
            value={smsText}
            rows={4}
            style={{
              width: '100%',
              fontSize: '12px',
              fontFamily: 'sans-serif',
              lineHeight: 1.45,
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#1e293b',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleCopy(smsText, 'sms')}
              style={{
                background: copiedType === 'sms' ? '#16a34a' : '#185fa5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedType === 'sms' ? '✓ Copied Text!' : '📋 Copy Text Script'}
            </button>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Paste directly into iMessage, WhatsApp, or OpenPhone to text the listing agent!
            </span>
          </div>
        </div>
      )}

      {selectedScript === 'email' && (
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
            Subject: <strong>{emailData.subject}</strong>
          </div>
          <textarea
            readOnly
            value={emailData.body}
            rows={8}
            style={{
              width: '100%',
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: 1.4,
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#1e293b',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleCopy(`${emailData.subject}\n\n${emailData.body}`, 'email')}
              style={{
                background: copiedType === 'email' ? '#16a34a' : '#185fa5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedType === 'email' ? '✓ Copied Email!' : '📋 Copy Full Email'}
            </button>

            <button
              type="button"
              onClick={handleOpenGmail}
              style={{
                background: '#ea4335',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Open prepared email in Gmail compose window"
            >
              ✉️ Open in Gmail
            </button>

            <button
              type="button"
              onClick={handleOpenMailto}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Default Mail App
            </button>
          </div>
        </div>
      )}

      {selectedScript === 'call' && (
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
            <strong>📞 Live Agent Phone Pitch:</strong>
            <p style={{ margin: '6px 0' }}>
              <em>&quot;Hey {sellerName}, this is acquisitions calling on {address}. I've got my underwriting team looking at this right now. If we can write an offer at <strong>{money(targetPrice)}</strong> as-is with no inspection renegotiations and a 14-day close, does that solve the seller's timeline, or do you have other offers on the table?&quot;</em>
            </p>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569' }}>
              <strong>If they push back on price:</strong> Pivot immediately to creative terms: <em>&quot;If the seller needs closer to asking price, would they be open to holding a short-term note with interest or letting us take over payments? That way they get their number and monthly income.&quot;</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
