import React, { useEffect, useState, useRef } from 'react';
import { UniversalProperty, MMAOBreakdown, StrategyTab } from '../types';
import { money } from '../utils/calc';
import { InfoTip } from './InfoTip';

interface SinglePropertyHeaderProps {
  property: UniversalProperty;
  mmao: MMAOBreakdown;
  activeTab?: StrategyTab;
  onSelectTab?: (tab: StrategyTab) => void;
  onUpdate: (field: keyof UniversalProperty, value: any) => void;
  onResetProperty: () => void;
  onClearToZero: () => void;
  onOpenPipeline?: () => void;
  pipelineCount?: number;
  onQuickSaveDeal?: () => void;
}

export const SinglePropertyHeader: React.FC<SinglePropertyHeaderProps> = ({
  property,
  mmao,
  activeTab,
  onSelectTab,
  onUpdate,
  onResetProperty,
  onClearToZero,
  onOpenPipeline,
  pipelineCount = 0,
  onQuickSaveDeal,
}) => {
  const isOverMMAO = property.purchasePrice > mmao.mao70;
  const listPrice = property.listPrice || property.propertyValue || 0;
  const discountFromList = listPrice - property.purchasePrice;
  const discountPct = listPrice > 0 ? (discountFromList / listPrice) * 100 : 0;

  const hasSubToLoan = property.stMortgageBalance > 0;
  const hasRehab = property.rehab > 0;

  // Realism & Viability Checks for Offer Price
  const isPurchaseOverARV = property.propertyValue > 0 && property.purchasePrice > property.propertyValue;
  const isPurchaseOver85ARV = property.propertyValue > 0 && !isPurchaseOverARV && property.purchasePrice > property.propertyValue * 0.85;
  const isZeroOffer = property.purchasePrice === 0;

  // Smart Entry Offer Calculation:
  // 1. DSCR Turnkey Formula (Richard Taylor 1.25 DSCR & ~20% Cash-on-Cash):
  // DSCR loans require rent-ready / turnkey condition (lenders do NOT fund heavy rehabs!).
  // Effective rent = rent * 0.80 (80% occupancy)
  // NOI available for debt service = effRent - taxesAndInsurance - $100 reserves
  // For DSCR = 1.25, max mortgage P&I = NOI / 1.25
  // Standard DSCR loan (7.5% 30yr fixed, loan factor ~ 0.006992).
  // At 80% LTV (20% down): Purchase Price = (Max P&I / 0.006992) / 0.80
  const effRent = property.rent * 0.80;
  const netForDebt = Math.max(0, effRent - property.taxesAndInsurance - 100);
  const maxMonthlyDebt = netForDebt > 0 ? netForDebt / 1.25 : 0;
  const dscrSupportedPrice = maxMonthlyDebt > 0 ? Math.round((maxMonthlyDebt / 0.006992) / 0.80 / 500) * 500 : 0;

  // 2. Fix & Flip 70% MMAO Formula (Jerry Norton rule):
  // (ARV × 70%) − Rehab − Wholesale Assignment Fee
  const flip70Price = mmao.mao70 > 0 ? mmao.mao70 : listPrice > 0 ? Math.round((listPrice * 0.70 - property.rehab - property.assignmentFee) / 500) * 500 : 0;

  let smartOffer = 0;
  let smartReason = '';

  if (activeTab === 'dscr') {
    // DSCR Mode: Clean, rent-ready underwriting. Rehab is NOT deducted because DSCR loans require rent-ready condition!
    if (dscrSupportedPrice > 0) {
      smartOffer = dscrSupportedPrice;
      smartReason = `DSCR Rental Target (Turnkey): Rent ${money(property.rent)}/mo covers PITI at ≥1.25 DSCR & ~20% Cash-on-Cash`;
    } else if (listPrice > 0) {
      smartOffer = Math.round((listPrice * 0.75) / 1000) * 1000;
      smartReason = `Standard 25% discount anchor on asking price ${money(listPrice)}`;
    }
  } else if (activeTab === 'ff') {
    // Fix & Flip Mode: 70% rule explicitly deducting rehab & fee
    if (flip70Price > 0) {
      smartOffer = flip70Price;
      smartReason = `70% Flip MMAO: (ARV ${money(property.propertyValue || listPrice)} × 70%) − ${money(property.rehab)} Rehab − ${money(property.assignmentFee || 5000)} Fee`;
    } else if (listPrice > 0) {
      smartOffer = Math.round((listPrice * 0.70) / 1000) * 1000;
      smartReason = `70% Wholesale Anchor on asking price ${money(listPrice)}`;
    }
  } else {
    // Universal / Compare / Other tabs:
    if (property.rehab > 15000 && flip70Price > 0) {
      // Property needs heavy rehab -> cash flip is the safe ceiling
      smartOffer = flip70Price;
      smartReason = `Heavy Rehab (${money(property.rehab)}): Fix & Flip 70% MMAO ceiling (${money(flip70Price)})`;
    } else if (dscrSupportedPrice > 0 && flip70Price > 0) {
      smartOffer = Math.min(dscrSupportedPrice, flip70Price);
      smartReason = `Clears both DSCR Turnkey (${money(dscrSupportedPrice)}) and 70% Flip (${money(flip70Price)})`;
    } else if (dscrSupportedPrice > 0) {
      smartOffer = dscrSupportedPrice;
      smartReason = `Hits DSCR ≥1.25 & ~20% Cash-on-Cash based on Rent ${money(property.rent)}/mo`;
    } else if (flip70Price > 0) {
      smartOffer = flip70Price;
      smartReason = `Based on 70% Wholesaling rule: (ARV × 70%) − Rehab − Fee`;
    } else if (listPrice > 0) {
      smartOffer = Math.round((listPrice * 0.75) / 1000) * 1000;
      smartReason = `Standard 25% discount anchor on asking price ${money(listPrice)}`;
    }
  }

  // Dynamic Auto-Generate Offer toggle state (persisted in localStorage, defaults to ON)
  const [isAutoOfferOn, setIsAutoOfferOn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('deal_calc_auto_offer');
      if (stored !== null) {
        return stored === 'true';
      }
      return true; // Default ON for seamless dynamic calculations
    } catch {
      return true;
    }
  });

  const [autoOfferToast, setAutoOfferToast] = useState('');

  // Keep onUpdate ref stabilized to avoid effect churn
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  // REAL-TIME DYNAMIC SYNC EFFECT:
  // When Auto-Generate is ON, automatically update Purchase Offer in real time
  // as list price, rent, taxes, insurance, rehab, or fees change!
  useEffect(() => {
    if (isAutoOfferOn && smartOffer > 0 && property.purchasePrice !== smartOffer) {
      onUpdateRef.current('purchasePrice', smartOffer);
    }
  }, [isAutoOfferOn, smartOffer, property.purchasePrice]);

  const handleToggleAutoOffer = () => {
    const next = !isAutoOfferOn;
    setIsAutoOfferOn(next);
    try {
      localStorage.setItem('deal_calc_auto_offer', next ? 'true' : 'false');
    } catch {}

    if (next && smartOffer > 0) {
      onUpdateRef.current('purchasePrice', smartOffer);
      setAutoOfferToast(`⚡ Auto-Generate ON: Offer dynamically updated to ${money(smartOffer)}`);
      setTimeout(() => setAutoOfferToast(''), 3000);
    } else if (!next) {
      setAutoOfferToast('🔒 Auto-Generate OFF: Your offer price is locked for custom editing. Click Drop-In anytime.');
      setTimeout(() => setAutoOfferToast(''), 3500);
    }
  };

  // Quick feedback toast state for save to pipeline
  const [saveToast, setSaveToast] = useState('');

  const handleQuickSave = () => {
    if (onQuickSaveDeal) {
      onQuickSaveDeal();
      setSaveToast('✓ Deal saved to your Pipeline!');
      setTimeout(() => setSaveToast(''), 3500);
    }
  };

  const handleApplySmartOffer = () => {
    if (smartOffer > 0) {
      onUpdate('purchasePrice', smartOffer);
      setAutoOfferToast(`✓ Dropped in target offer of ${money(smartOffer)}`);
      setTimeout(() => setAutoOfferToast(''), 3000);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #dcd8ce',
        borderRadius: '10px',
        padding: '16px 18px',
        marginBottom: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top row: Address & universal badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f0eee6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
          <span style={{ fontSize: '18px' }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Universal Property Deal
            </div>
            <input
              type="text"
              value={property.address}
              onChange={(e) => onUpdate('address', e.target.value)}
              placeholder="e.g. 124 Maple Avenue, Tampa, FL"
              style={{
                width: '100%',
                fontSize: '15px',
                fontWeight: 700,
                color: '#222',
                border: 'none',
                borderBottom: '1.5px solid #e0ded6',
                borderRadius: '0',
                padding: '2px 0',
                background: 'transparent',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '4px 10px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Universal Sync Active
            <InfoTip
              title="Universal Live Sync"
              eli12="You never have to type the same number twice! Any change to purchase price, rent, taxes, rehab, or fees anywhere in the app updates this entire property universally."
              size="sm"
            />
          </span>

          {/* Pipeline Button */}
          {onOpenPipeline && (
            <button
              type="button"
              onClick={onOpenPipeline}
              style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                color: '#1d4ed8',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Open your saved deals pipeline"
            >
              <span>📁 My Pipeline</span>
              <span
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                {pipelineCount}
              </span>
            </button>
          )}

          {/* Quick Save Deal Button */}
          {onQuickSaveDeal && (
            <button
              type="button"
              onClick={handleQuickSave}
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Quickly save current property numbers into your pipeline"
            >
              💾 Save Deal
            </button>
          )}

          {/* Load Sample Deal */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={onResetProperty}
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#4b5563',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Load Sample Deal
            </button>
            <InfoTip
              title="Load Sample Demo Property"
              eli12="Restores the pre-loaded $260k sample deal with standard rehab, rent, and loan numbers so you can practice testing formulas."
              size="sm"
            />
          </div>

          <button
            type="button"
            onClick={onClearToZero}
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Clear all inputs to 0 to underwrite a brand new property from scratch"
          >
            Clear to Zero (Blank Deal)
          </button>
        </div>
      </div>

      {saveToast && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{saveToast} Click &quot;📁 My Pipeline&quot; above to view or reload anytime.</span>
          <button
            type="button"
            onClick={() => setSaveToast('')}
            style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {autoOfferToast && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{autoOfferToast}</span>
          <button
            type="button"
            onClick={() => setAutoOfferToast('')}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FRONT FACE: Zillow 30-Second Data & Smart Entry Underwriter */}
      <div
        style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Zillow 30-Second Quick Underwriter
            </span>
            <InfoTip
              title="Zillow 30-Second Underwriter"
              eli12="Enter the 3 numbers you find on any Zillow listing in 30 seconds: List Price, Rent Zestimate, and Monthly Taxes & Insurance. The app calculates your winning opening purchase offer!"
              ruleOfThumb="All professional wholesalers filter deals in under 60 seconds using this exact triad."
              size="sm"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Dynamic Auto-Generate ON / OFF Toggle Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isAutoOfferOn ? '#f0fdf4' : '#f1f5f9',
                border: `1.5px solid ${isAutoOfferOn ? '#86efac' : '#cbd5e1'}`,
                borderRadius: '20px',
                padding: '2px 8px 2px 5px',
                boxShadow: isAutoOfferOn ? '0 1px 3px rgba(22,163,74,0.15)' : 'none',
              }}
            >
              <button
                type="button"
                id="toggle-auto-generate-offer"
                onClick={handleToggleAutoOffer}
                style={{
                  width: '36px',
                  height: '18px',
                  borderRadius: '9px',
                  background: isAutoOfferOn ? '#16a34a' : '#94a3b8',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={`Click to turn Auto-Generate Offer ${isAutoOfferOn ? 'OFF' : 'ON'}`}
              >
                <span
                  style={{
                    display: 'block',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: isAutoOfferOn ? 'translateX(19px)' : 'translateX(3px)',
                    transition: 'transform 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
              <span
                onClick={handleToggleAutoOffer}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isAutoOfferOn ? '#15803d' : '#475569',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Auto-Generate:</span>
                <span
                  style={{
                    background: isAutoOfferOn ? '#16a34a' : '#64748b',
                    color: '#ffffff',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                  }}
                >
                  {isAutoOfferOn ? 'ON (LIVE)' : 'OFF'}
                </span>
              </span>
              <InfoTip
                title="Dynamic Auto-Generate Offer (ON/OFF)"
                eli12="When ON, your Purchase Offer dynamically updates in real-time as you enter List Price, Rent, Taxes, Insurance, Rehab, and Fees. When OFF, your offer price is locked for manual custom numbers, and you can click the Drop-In button anytime!"
                size="sm"
              />
            </div>

            {/* Generate & Drop-In Button (Always accessible, especially when OFF) */}
            {smartOffer > 0 && (
              <button
                type="button"
                id="dropin-smart-offer-btn"
                onClick={handleApplySmartOffer}
                style={{
                  background: isAutoOfferOn ? '#ecfdf5' : '#16a34a',
                  color: isAutoOfferOn ? '#15803d' : '#ffffff',
                  border: isAutoOfferOn ? '1px solid #86efac' : 'none',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: isAutoOfferOn ? 'none' : '0 1px 3px rgba(22,163,74,0.3)',
                }}
                title={smartReason}
              >
                <span>{isAutoOfferOn ? '⚡ Live Synced:' : '⚡ Drop In Smart Offer:'}</span>
                <strong>{money(smartOffer)}</strong>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Fast Inputs from Zillow */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          {/* 1. List Price */}
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>1. Zillow List Price</span>
              <InfoTip
                title="Seller List Price (Asking Price)"
                eli12="What the seller or agent listed the property for on Zillow/MLS."
                size="sm"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>$</span>
              <input
                type="number"
                value={property.listPrice || ''}
                placeholder="0"
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdate('listPrice', val);
                  if (property.propertyValue === 0 || property.propertyValue === property.listPrice) {
                    onUpdate('propertyValue', val);
                  }
                  // If purchase price was 0 and auto-sync is off, suggest 75% anchor
                  if (!isAutoOfferOn && property.purchasePrice === 0 && val > 0) {
                    onUpdate('purchasePrice', Math.round((val * 0.75) / 1000) * 1000);
                  }
                }}
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1e293b',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* 2. Rent */}
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>2. Rent Zestimate</span>
              <InfoTip
                title="Gross Monthly Rent"
                eli12="Check Zillow's 'Rent Zestimate' or Rentometer to find what tenants pay per month in this neighborhood."
                size="sm"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>$</span>
              <input
                type="number"
                value={property.rent || ''}
                placeholder="0"
                step={50}
                onChange={(e) => onUpdate('rent', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1e293b',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>/mo</span>
            </div>
          </div>

          {/* 3. Taxes & Insurance */}
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>3. Taxes &amp; Ins /mo</span>
              <InfoTip
                title="Monthly Taxes & Insurance"
                eli12="Scroll to 'Monthly Cost' or 'Property Taxes' on Zillow. Add estimated monthly hazard insurance ($75-$150/mo)."
                size="sm"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>$</span>
              <input
                type="number"
                value={property.taxesAndInsurance || ''}
                placeholder="0"
                step={25}
                onChange={(e) => onUpdate('taxesAndInsurance', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1e293b',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>/mo</span>
            </div>
          </div>

          {/* 4. Rehab Scope */}
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>4. Rehab Estimate</span>
              <span
                style={{
                  fontSize: '9px',
                  background: activeTab === 'dscr' ? '#fef3c7' : '#f1f5f9',
                  color: activeTab === 'dscr' ? '#92400e' : '#475569',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: `1px solid ${activeTab === 'dscr' ? '#fde68a' : '#cbd5e1'}`,
                  fontWeight: 700,
                }}
              >
                {activeTab === 'dscr' ? 'Flip Only' : 'Fix & Flip'}
              </span>
              <InfoTip
                title="Rehab Estimate (Fix & Flip Only)"
                eli12="Rehab is ONLY deducted in the Fix & Flip 70% Wholesale MMAO formula: (ARV × 70%) − Rehab − Fee. DSCR rental loans are for rent-ready / turnkey properties and will NOT qualify if the home needs heavy work."
                ruleOfThumb="Keep it simple: If the property needs heavy rehab ($35k+), wholesale it to a cash flipper on the Fix & Flip tab. Standard DSCR loans require rent-ready condition ($0 to $10k cosmetic)."
                size="sm"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>$</span>
              <input
                type="number"
                value={property.rehab || ''}
                placeholder="0"
                step={1000}
                onChange={(e) => onUpdate('rehab', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1e293b',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                }}
              />
            </div>
            {/* Context status helper under input */}
            <div style={{ fontSize: '10px', marginTop: '2px', color: activeTab === 'dscr' ? (property.rehab > 15000 ? '#b45309' : '#15803d') : '#64748b' }}>
              {activeTab === 'dscr'
                ? property.rehab > 15000
                  ? '⚠️ Flip only (DSCR requires rent-ready)'
                  : '✓ DSCR is Turnkey ($0-$10k)'
                : 'Deducted in 70% Flip rule'}
            </div>
          </div>
        </div>

        {/* Hand-Holding Explanation Hint */}
        {smartReason && (
          <div
            style={{
              fontSize: '11.5px',
              color: '#1e40af',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span>
              💡 <strong>Hand-Holding Guide:</strong> {smartReason}. Target purchase price: <strong>{money(smartOffer)}</strong>. Start your opening anchor lower and negotiate up!
            </span>
            {property.purchasePrice !== smartOffer && (
              <button
                type="button"
                onClick={handleApplySmartOffer}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Apply {money(smartOffer)}
              </button>
            )}
          </div>
        )}

        {/* DSCR Condition Alert: When on DSCR tab and heavy rehab is entered */}
        {activeTab === 'dscr' && property.rehab > 15000 && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '11.5px',
              color: '#92400e',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span>
              ⚠️ <strong>DSCR Condition Check:</strong> Current rehab is {money(property.rehab)}. Standard DSCR lenders require <strong>rent-ready / turnkey</strong> condition and do not approve heavy rehabs. Keep it simple: For heavy fixers, sell to a cash flipper on the Fix &amp; Flip tab!
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => onUpdate('rehab', 0)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #d97706',
                  color: '#92400e',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Set rehab to $0 for turnkey DSCR rental"
              >
                🏠 Set Rehab to $0 (Turnkey)
              </button>
              {onSelectTab && (
                <button
                  type="button"
                  onClick={() => onSelectTab('ff')}
                  style={{
                    background: '#b45309',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Switch to Fix & Flip tab where rehab scope is deducted"
                >
                  🔨 Go to Fix &amp; Flip Tab
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary Contract Offer vs List Price Bar */}
      <div
        style={{
          background: isPurchaseOverARV ? '#fef2f2' : isPurchaseOver85ARV ? '#fffbeb' : '#f8fafc',
          border: isPurchaseOverARV ? '1.5px solid #ef4444' : isPurchaseOver85ARV ? '1.5px solid #f59e0b' : '1.5px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Our Contract Offer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: isPurchaseOverARV ? '#b91c1c' : isPurchaseOver85ARV ? '#92400e' : '#1e40af', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Our Contract Offer Price</span>
                <InfoTip
                  title="Our Contract Offer Price"
                  eli12="The actual price you write on your purchase contract with the seller. This is what you agree to pay at closing. Must stay under 70% MMAO so you can wholesale it!"
                  ruleOfThumb="Aim for 15%-30% below asking price."
                  size="sm"
                />
              </div>
              {isPurchaseOverARV && (
                <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  🛑 &gt;100% of ARV
                </span>
              )}
              {!isPurchaseOverARV && isPurchaseOver85ARV && (
                <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  ⚠️ Thin Spread (&gt;85% ARV)
                </span>
              )}
              {isZeroOffer && (
                <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                  $0 / Not entered
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: isPurchaseOverARV ? '#b91c1c' : isPurchaseOver85ARV ? '#92400e' : '#1e40af', fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  value={property.purchasePrice || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (isAutoOfferOn) {
                      setIsAutoOfferOn(false);
                      try {
                        localStorage.setItem('deal_calc_auto_offer', 'false');
                      } catch {}
                      setAutoOfferToast('🔒 Auto-Generate paused to preserve your manual offer price. Click Drop-In anytime.');
                      setTimeout(() => setAutoOfferToast(''), 4000);
                    }
                    onUpdate('purchasePrice', val);
                  }}
                  style={{
                    width: '130px',
                    fontWeight: 800,
                    fontSize: '17px',
                    color: isPurchaseOverARV ? '#b91c1c' : isPurchaseOver85ARV ? '#92400e' : '#1e40af',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: isPurchaseOverARV ? '2px solid #ef4444' : isPurchaseOver85ARV ? '2px solid #f59e0b' : '2px solid #3b82f6',
                    background: isPurchaseOverARV ? '#fef2f2' : isPurchaseOver85ARV ? '#fffbeb' : '#eff6ff',
                  }}
                />
              </div>

              {/* Status Indicator & Drop-in Shortcut */}
              {isAutoOfferOn ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ecfdf5',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '10.5px',
                    color: '#15803d',
                    fontWeight: 700,
                  }}
                  title="Auto-Generate is ON: Offer dynamically updates in real-time as inputs change."
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                  <span>Auto-Sync ON</span>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {smartOffer > 0 && property.purchasePrice !== smartOffer && (
                    <button
                      type="button"
                      onClick={handleApplySmartOffer}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title={`Click to drop in smart target offer of ${money(smartOffer)}`}
                    >
                      <span>⚡ Drop In {money(smartOffer)}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleAutoOffer}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      borderRadius: '4px',
                      padding: '3px 7px',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Turn live dynamic Auto-Generate back ON"
                  >
                    Auto-Sync OFF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Discount / Spread vs Seller List Price */}
          {listPrice > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  background: discountFromList >= 0 ? '#ecfdf5' : '#fef2f2',
                  color: discountFromList >= 0 ? '#065f46' : '#991b1b',
                  border: discountFromList >= 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
                }}
              >
                {discountFromList >= 0
                  ? `-$${Math.abs(discountFromList).toLocaleString()} (${discountPct.toFixed(1)}% below Asking)`
                  : `+$${Math.abs(discountFromList).toLocaleString()} (${Math.abs(discountPct).toFixed(1)}% over Asking)`}
              </div>
              <InfoTip
                title="Discount Below Asking Price"
                eli12="Shows how much money you are negotiating off the seller's asking price. Flippers and wholesalers look for at least 15% to 30% discounts to cover repairs and profit."
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Quick Offer Shortcuts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={() => onUpdate('purchasePrice', mmao.mao70)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#166534',
              }}
            >
              Snap to 70% MAO ({money(mmao.mao70)})
            </button>
            <InfoTip
              title="Snap to 70% MAO"
              eli12="One-click shortcut! Sets your offer exactly to Jerry Norton's 70% Wholesaler MMAO ceiling. The highest offer that guarantees cash buyer interest!"
              size="sm"
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={() => onUpdate('purchasePrice', Math.round((listPrice * 0.8) / 1000) * 1000)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Offer 80% ({money(listPrice * 0.8)})
            </button>
            <InfoTip
              title="Offer 80% of List Price"
              eli12="A classic standard opening bid: 20% below the seller's asking price. Great starting anchor point when making cold offers."
              size="sm"
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={() => onUpdate('purchasePrice', listPrice)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Match List ({money(listPrice)})
            </button>
            <InfoTip
              title="Match List Price"
              eli12="Sets your offer directly to what the seller is asking. Good for checking if creative financing (Sub-To or Seller Finance) works at full retail price."
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Strategy Status Triage Flags */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {/* DSCR Status */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>🏢 DSCR Rental: </span>
            <span style={{ color: '#1e40af', fontWeight: 600 }}>Rent {money(property.rent)}/mo</span>
          </div>
          <InfoTip
            title="DSCR Rental Strategy"
            eli12="Debt Service Coverage Ratio: A mortgage loan based on how much rent the property makes, not your personal job or W-2 income! Lenders require DSCR ≥ 1.20 - 1.25."
            ruleOfThumb="Rule of Thumb: Gross Rent should be at least 1.25x the monthly mortgage (PITI)."
            size="sm"
          />
        </div>

        {/* Sub-To Status */}
        <div
          style={{
            background: hasSubToLoan ? '#f0fdf4' : '#fffbeb',
            border: hasSubToLoan ? '1px solid #bbf7d0' : '1px solid #fde68a',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>📑 Sub-To: </span>
            {hasSubToLoan ? (
              <span style={{ color: '#166534', fontWeight: 600 }}>🟢 Loan {money(property.stMortgageBalance)} @ {property.stRate}%</span>
            ) : (
              <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Awaiting Seller Mortgage Info</span>
            )}
          </div>
          <InfoTip
            title="What does 'Sub-To Loan Confirmed' mean?"
            eli12={
              hasSubToLoan
                ? `We have the seller's existing mortgage details entered (${money(property.stMortgageBalance)} balance @ ${property.stRate}%). This means the math is 100% verified — we know your exact monthly mortgage payment without having to guess!`
                : 'Subject-To means taking over the seller\'s existing mortgage. Because Zillow does NOT show private loan balances or interest rates, you must ask the seller: "Do you have an existing mortgage on the property, and what is your approximate balance and monthly payment?"'
            }
            ruleOfThumb="Sub-To works best when the seller has an existing 3% to 4.5% interest rate from 2020-2022."
            size="sm"
          />
        </div>

        {/* Flip Status */}
        <div
          style={{
            background: hasRehab ? '#f0fdf4' : '#fffbeb',
            border: hasRehab ? '1px solid #bbf7d0' : '1px solid #fde68a',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>🔨 Fix &amp; Flip: </span>
            {hasRehab ? (
              <span style={{ color: '#166534', fontWeight: 600 }}>🟢 Rehab {money(property.rehab)}</span>
            ) : (
              <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Awaiting Rehab Scope</span>
            )}
          </div>
          <InfoTip
            title="Fix &amp; Flip Strategy"
            eli12="Buy a distressed house at a deep discount (70% MMAO), hire contractors to renovate it in 3-6 months, and sell it on the MLS to an everyday family for top dollar."
            ruleOfThumb="Flippers want at least $25k to $40k net profit and a 20%+ ROI to justify the construction risk."
            size="sm"
          />
        </div>
      </div>

      {/* Global Property Vitals Strip: Universally live across all strategies */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '10px 12px',
          border: '1px solid #f3f4f6',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Contract Offer</span>
            <InfoTip
              title="Offer Purchase Price"
              eli12="Your agreed contract price with the seller. Universally synced across every tool, tab, and calculation in this app."
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.purchasePrice)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>ARV / Market Value</span>
            <InfoTip
              title="ARV / Market Value"
              eli12="After Repair Value: What the house is worth once completely remodeled to look like brand new (HGTV condition). Found by looking at the highest sold comps within 0.5 miles."
              ruleOfThumb="Be conservative! Don't use the highest outlier comp if the street has lower averages."
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.propertyValue)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Market Rent</span>
            <InfoTip
              title="Market Rent"
              eli12="Estimated monthly rental income from a tenant. Check Zillow Rent Zestimate, Rentometer, or actual current tenant leases."
              ruleOfThumb="Rule of thumb: Monthly rent should ideally approach 1% of property price for solid cash flow."
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.rent)}/mo
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Taxes &amp; Ins</span>
            <InfoTip
              title="Taxes &amp; Insurance"
              eli12="Monthly property taxes and homeowner hazard insurance. This is mandatory overhead that is deducted from rental income or paid while flipping."
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.taxesAndInsurance)}/mo
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Rehab Scope</span>
            <InfoTip
              title="Rehab Scope"
              eli12="Estimated repair and renovation costs. Deducted dollar-for-dollar from your offer price in the 70% MMAO formula! Click the Rehab Checklist tool below to itemize line-by-line."
              ruleOfThumb="Paint & Carpet: $15k-$20k. Kitchen & Baths: $30k-$45k. Full gut/roof/HVAC: $60k-$90k."
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.rehab)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Wholesale Fee</span>
            <InfoTip
              title="Wholesale Assignment Fee"
              eli12="YOUR paycheck! This is the cash you make when you assign the purchase contract to a cash buyer. You get this wire on closing day from the title company."
              ruleOfThumb="Standard fees are $5,000 to $15,000. Big spreads can be $25k to $50k+!"
              size="sm"
            />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {money(property.assignmentFee)}
          </div>
        </div>

        <div
          style={{
            background: isOverMMAO ? '#fef2f2' : '#f0fdf4',
            border: isOverMMAO ? '1px solid #fecaca' : '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '4px 8px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: isOverMMAO ? '#991b1b' : '#166534',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Live 70% MMAO</span>
            <InfoTip
              title="Live 70% MMAO"
              eli12="Maximum Allowable Offer: The Jerry Norton Wholesaling Golden Rule! The absolute highest price you can pay so you get your fee AND your buyer makes a profit."
              formula="(ARV × 70%) − Rehab − Wholesale Fee"
              ruleOfThumb="If your offer is above this number, cash buyers won't buy it. If it's below, it's wholesale safe!"
              size="sm"
            />
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: isOverMMAO ? '#b91c1c' : '#15803d',
            }}
          >
            {money(mmao.mao70)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
        Changing purchase price, taxes, rent, or rehab on <i>any tab or tool below</i> updates this property universally. Click any circular <strong>i</strong> icon for plain-English definitions and formulas.
      </div>
    </div>
  );
};
