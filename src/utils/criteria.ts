import { SFInputs, STInputs } from '../types';
import { atSF, atST } from './calc';

/**
 * HMHW "Creative Offer Oven" closer criteria.
 * All thresholds live here so they can be tuned in one place.
 */
export const OFFER_OVEN = {
  sf: {
    minCashFlow: 200,        // $/mo
    maxOffer: 500_000,       // $
    minCoC: 13,              // %
    maxDownPct: 15,          // % of price
    maxEntryPct: 15,         // % of price (buyer entry / assignment fee)
    maxRate: 4,              // %
    minBalloonYears: 5,
  },
  st: {
    minCashFlow: 150,        // $/mo (advisory only)
    smallLoanCutoff: 150_000,
    maxRateSmallLoan: 8,     // % when loan < cutoff
    maxRateLargeLoan: 5,     // % when loan >= cutoff
    maxEquityPct: 15,        // %
    minCoC: -10,             // %
    maxDownPct: 15,          // % of value (cash to seller)
    maxEntryPct: 15,         // % of value (buyer entry / assignment fee)
    minBalloonYears: 5,      // remaining loan term used as balloon proxy
  },
} as const;

export interface CloserCheck {
  id: string;
  label: string;
  pass: boolean;
  advisory?: boolean;
}

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : Infinity);

export function sfCloserChecks(v: SFInputs): CloserCheck[] {
  const c = OFFER_OVEN.sf;
  const r = atSF(v.purchase, v);
  return [
    { id: 'cf', label: `Cash flow ≥ $${c.minCashFlow}/mo`, pass: r.cf >= c.minCashFlow },
    { id: 'offer', label: `Offer ≤ $${c.maxOffer.toLocaleString('en-US')}`, pass: v.purchase <= c.maxOffer },
    { id: 'coc', label: `Cash-on-cash ≥ ${c.minCoC}%`, pass: r.coc >= c.minCoC },
    { id: 'down', label: `Down payment ≤ ${c.maxDownPct}% of price`, pass: v.down <= c.maxDownPct },
    { id: 'entry', label: `Buyer entry fee ≤ ${c.maxEntryPct}% of price`, pass: pct(v.fee, v.purchase) <= c.maxEntryPct },
    { id: 'rate', label: `Interest rate ≤ ${c.maxRate}%`, pass: v.rate <= c.maxRate },
    { id: 'balloon', label: `Balloon ≥ ${c.minBalloonYears} years`, pass: v.balloon >= c.minBalloonYears },
  ];
}

export function stMaxRate(loan: number): number {
  const c = OFFER_OVEN.st;
  return loan < c.smallLoanCutoff ? c.maxRateSmallLoan : c.maxRateLargeLoan;
}

export function stCloserChecks(v: STInputs): CloserCheck[] {
  const c = OFFER_OVEN.st;
  const r = atST(v);
  const maxRate = stMaxRate(v.mtg);
  return [
    { id: 'cf', label: `Cash flow ≥ $${c.minCashFlow}/mo (advisory — sub-to doesn't strictly need to cash flow)`, pass: r.cf >= c.minCashFlow, advisory: true },
    { id: 'rate', label: `Rate ≤ ${maxRate}% (loan ${v.mtg < c.smallLoanCutoff ? '<' : '≥'} $${c.smallLoanCutoff.toLocaleString('en-US')})`, pass: v.rate <= maxRate },
    { id: 'equity', label: `Equity ≤ ${c.maxEquityPct}%`, pass: r.equityPct <= c.maxEquityPct },
    { id: 'coc', label: `Cash-on-cash ≥ ${c.minCoC}%`, pass: r.cashIn === 0 ? true : r.coc >= c.minCoC },
    { id: 'down', label: `Down (cash to seller) ≤ ${c.maxDownPct}% of value`, pass: pct(v.cash, v.value) <= c.maxDownPct },
    { id: 'entry', label: `Buyer entry fee ≤ ${c.maxEntryPct}% of value`, pass: pct(v.fee, v.value) <= c.maxEntryPct },
    { id: 'balloon', label: `Balloon / remaining term ≥ ${c.minBalloonYears} years`, pass: v.months >= c.minBalloonYears * 12 },
  ];
}
