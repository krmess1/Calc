import React from 'react';
import { MMAOBreakdown } from '../types';
import { money } from '../utils/calc';
import { InfoTip } from './InfoTip';

interface LiveMMAOBarProps {
  arv: number;
  rehab: number;
  fee: number;
  purchase: number;
  breakdown: MMAOBreakdown;
  onSetPurchaseToMMAO?: (targetMao: number) => void;
}

export const LiveMMAOBar: React.FC<LiveMMAOBarProps> = ({
  arv,
  rehab,
  fee,
  purchase,
  breakdown,
  onSetPurchaseToMMAO,
}) => {
  const arv70 = Math.round(arv * 0.7);
  const isOver = purchase > breakdown.mao70;
  const diff = Math.abs(purchase - breakdown.mao70);

  return (
    <div
      style={{
        background: '#ffffff',
        border: isOver ? '1.5px solid #b3261e' : '1.5px solid #27500a',
        borderRadius: '10px',
        padding: '16px',
        margin: '16px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header & Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#111827',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              LIVE WHOLESALE MMAO
              <InfoTip
                title="Live 70% Wholesale MMAO"
                eli12="The Jerry Norton Wholesaling Golden Rule! This is the absolute MAXIMUM contract price you can offer the seller so you can still pocket your assignment fee AND sell the contract to a cash buyer flipper who makes a profit."
                formula="(ARV × 70%) − Rehab Scope − Wholesale Assignment Fee = Max Allowable Offer"
                ruleOfThumb="If your offer is above this number, cash buyers won't buy your contract. If it's below, you have guaranteed profit!"
                example={`ARV ${money(arv)} × 0.70 (${money(arv70)}) − Rehab ${money(rehab)} − Fee ${money(fee)} = ${money(breakdown.mao70)} MMAO.`}
                size="sm"
              />
            </span>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>
              Jerry Norton 70% Wholesaler Formula
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>(ARV × 70%) − Rehab Budget − Wholesale Assignment Fee = Max Allowable Offer</span>
            <InfoTip
              title="How the 70% Wholesaling Formula Works"
              eli12="Flippers require a 30% margin on the ARV (After Repair Value) to cover 15% net profit, 10% hard money loan fees/interest, and 5% closing costs. That's why we take 70% of ARV, subtract the repair costs, and subtract your wholesale fee."
              formula="MMAO = (ARV × 0.70) − Rehab − Assignment Fee"
              ruleOfThumb="Every dollar you negotiate below this number goes straight into your pocket or makes your deal sell 10x faster!"
              size="sm"
            />
          </div>
        </div>

        <div
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            background: isOver ? '#fee2e2' : '#dcfce7',
            color: isOver ? '#991b1b' : '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOver ? '#dc2626' : '#16a34a',
            }}
          />
          <span>
            {isOver
              ? `${money(diff)} OVER MMAO (Too High)`
              : `${money(diff)} UNDER MMAO (Wholesale Safe)`}
          </span>
          <InfoTip
            title={isOver ? "Over MMAO: Deal Alert" : "Under MMAO: Wholesale Safe"}
            eli12={
              isOver
                ? `You are currently ${money(diff)} above the Jerry Norton 70% MMAO ceiling. Cash buyers will not buy this deal at this price because there isn't enough profit left for them after repairs. You must negotiate down or get creative financing!`
                : `Awesome! Your offer price is ${money(diff)} below the hard ceiling. A cash buyer will love this deal, and your full ${money(fee)} wholesale fee is 100% protected!`
            }
            ruleOfThumb={isOver ? "Never sign a contract above MMAO without an inspection contingency." : "Ready to pitch to cash buyers."}
            size="sm"
          />
        </div>
      </div>

      {/* Live Equation breakdown */}
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: '#374151' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>{money(arv)}</span> ARV × 70% ={' '}
            <strong style={{ color: '#059669' }}>{money(arv70)}</strong>
          </span>
          <span style={{ color: '#9ca3af' }}>−</span>
          <span style={{ color: '#dc2626' }}>{money(rehab)} Rehab</span>
          <span style={{ color: '#9ca3af' }}>−</span>
          <span style={{ color: '#2563eb' }}>{money(fee)} Your Fee</span>
          <span style={{ color: '#9ca3af' }}>=</span>
          <span
            style={{
              background: '#ede9fe',
              color: '#5b21b6',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 800,
            }}
          >
            {money(breakdown.mao70)} 70% MMAO
          </span>
        </div>
        <InfoTip
          title="Live Formula Calculation"
          eli12="Shows exact live numbers subtracted in real-time. Notice how changes to your ARV, repairs, or assignment fee update this instantly!"
          formula={`(${money(arv)} × 0.70) − ${money(rehab)} − ${money(fee)} = ${money(breakdown.mao70)}`}
          ruleOfThumb="Double check your ARV with recent 90-day sold comps so your 70% starting number is accurate."
          size="sm"
        />
      </div>

      {/* 4 Actionable Offer Tiers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        {/* Anchor Offer */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Anchor (80%)</span>
            <InfoTip
              title="Anchor Offer (80% of MMAO)"
              eli12="Your lowball opening bid! Start here in negotiations so you have room to give in a little and make the seller feel like they won. If the seller accepts right away, you pocket a massive windfall bonus!"
              formula="MMAO × 0.80"
              ruleOfThumb="Always make an anchor offer first. Never start at your maximum offer!"
              example={`If MMAO is ${money(breakdown.mao70)}, start at ${money(breakdown.anchor)}.`}
              size="sm"
            />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
            {money(breakdown.anchor)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Aggressive opening bid</div>
        </div>

        {/* Target Offer */}
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Target (90%)</span>
            <InfoTip
              title="Target Offer (90% of MMAO)"
              eli12="The realistic sweet spot! Where 80% of profitable deals end up closing after some back-and-forth negotiation. This gives you your full desired fee while giving the flipper great margin."
              formula="MMAO × 0.90"
              ruleOfThumb="If the seller hesitates on your Anchor offer, walk up gradually to this Target number."
              example={`Target price is ${money(breakdown.target)}.`}
              size="sm"
            />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>
            {money(breakdown.target)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Realistic sweet spot</div>
        </div>

        {/* 70% MMAO */}
        <div
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>70% MMAO</span>
            <InfoTip
              title="70% MMAO (Hard Stop Ceiling)"
              eli12="The absolute line in the sand. Do NOT pay more than this on standard flips! If the seller refuses to go below this number, walk away or pitch creative financing (Seller Finance / Sub-To) instead."
              formula="(ARV × 0.70) − Rehab − Assignment Fee"
              ruleOfThumb="Discipline is what makes millionaires in wholesaling. Never violate your MMAO!"
              example={`Hard ceiling is ${money(breakdown.mao70)}.`}
              size="sm"
            />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#581c87', margin: '4px 0' }}>
            {money(breakdown.mao70)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Hard ceiling — do not cross</div>
        </div>

        {/* 75% MAO Tier */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>75% MAO Tier</span>
            <InfoTip
              title="75% MAO Tier (Light / Cosmetic Flip)"
              eli12="Use this higher offer tier ONLY if the property just needs light cosmetic touchups (new carpet, fresh paint, minor fixtures under $20k). Cash buyers will accept a 75% rule because the construction risk and timeline are so small."
              formula="(ARV × 0.75) − Rehab − Assignment Fee"
              ruleOfThumb="NEVER use 75% on heavy rehabs (roof, foundation, full guts). Only for clean cosmetic flips."
              example={`Cosmetic tier max is ${money(breakdown.mao75)}.`}
              size="sm"
            />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#78350f', margin: '4px 0' }}>
            {money(breakdown.mao75)}
          </div>
          <div style={{ fontSize: '10px', color: '#4b5563' }}>Light cosmetic / fast flip</div>
        </div>
      </div>

      {/* Action / Context Note */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          color: '#4b5563',
          paddingTop: '6px',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div>
          Current Contract Price:{' '}
          <strong style={{ color: '#111827' }}>{money(purchase)}</strong>
          {isOver ? (
            <span style={{ color: '#b3261e', marginLeft: '6px' }}>
              (Must negotiate down {money(diff)} to lock fee)
            </span>
          ) : (
            <span style={{ color: '#27500a', marginLeft: '6px' }}>
              ({money(diff)} wholesale cushion available)
            </span>
          )}
        </div>

        {isOver && onSetPurchaseToMMAO && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onSetPurchaseToMMAO(breakdown.mao70)}
              style={{
                background: '#b3261e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Snap Purchase Price to MMAO ({money(breakdown.mao70)})
            </button>
            <InfoTip
              title="Snap Purchase Price to MMAO"
              eli12="One-click fix! Sets your offer price directly to the Jerry Norton 70% MMAO so your numbers immediately become viable for a cash buyer."
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
