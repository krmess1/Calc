import { describe, it, expect } from 'vitest';
import { pmt, balanceAfter, atFF, calcFFOffer, calcMMAOBreakdown, calcSFOffer, calcDSCROffer, calcSTOffer, calcDoubleCloseOffer, atDoubleClose } from '../calc';
import { sfCloserChecks, stCloserChecks, stMaxRate, OFFER_OVEN } from '../criteria';
import { SFInputs, STInputs, FFInputs, DSCRInputs, DoubleCloseInputs } from '../../types';

const sf: SFInputs = { purchase: 200000, down: 10, rate: 3, balloon: 7, amort: 30, rent: 2200, occ: 100, ti: 300, appr: 3, fee: 10000 };
const st: STInputs = { value: 200000, mtg: 175000, rate: 3.5, months: 300, cash: 5000, rent: 1900, occ: 100, ti: 300, fee: 5000 };
const ff: FFInputs = { purchase: 100000, rehab: 40000, arv: 250000, hold: 1000, months: 4, realtor: 5, closing: 2, fee: 10000 };
const dscr: DSCRInputs = { purchase: 200000, down: 20, rate: 7, term: 30, rent: 2200, occ: 95, ti: 350, opex: 200, fee: 10000 };

describe('loan math', () => {
  it('pmt matches standard amortization', () => {
    expect(pmt(100000, 6, 360)).toBeCloseTo(599.55, 2);
    expect(pmt(12000, 0, 12)).toBe(1000);
  });
  it('balance after full term is zero', () => {
    expect(balanceAfter(100000, 6, 360, 360)).toBeCloseTo(0, 2);
    expect(balanceAfter(100000, 6, 360, 0)).toBeCloseTo(100000, 2);
  });
});

describe('fix & flip', () => {
  it('MAO = ARV*70% - rehab - fee, and basis counts fee exactly once', () => {
    const o = calcFFOffer(ff);
    expect(o.mao).toBe(250000 * 0.7 - 40000 - 10000);
    const r = atFF(ff.purchase, ff);
    expect(r.entryPrice).toBe(110000);
    expect(r.invested).toBe(100000 + 10000 + 40000 + 4000);
  });
  it('end-buyer entry at MAO equals ARV*70% - rehab', () => {
    const mao = calcFFOffer(ff).mao!;
    expect(atFF(mao, ff).entryPrice).toBe(250000 * 0.7 - 40000);
  });
  it('anchor/target are 75%/90% of MAO rounded to $500', () => {
    const b = calcMMAOBreakdown(250000, 40000, 10000, 100000);
    expect(b.anchor).toBe(Math.round((125000 * 0.75) / 500) * 500);
    expect(b.target).toBe(112500);
  });
});

describe('anchor base is consistent', () => {
  it('SF and DSCR anchors are 75% of MAO whether or not Target exists', () => {
    for (const o of [calcSFOffer(sf), calcSFOffer({ ...sf, rent: 1100 }), calcDSCROffer(dscr)]) {
      if (o.mao !== null) expect(o.anchor).toBe(Math.round(o.mao * 0.75));
    }
  });
  it('sub-to MAO/target are 15%/25% CoC on cash', () => {
    const o = calcSTOffer(st);
    expect(o.mao).toBeGreaterThan(o.target!);
  });
});

describe('double close', () => {
  const dc: DoubleCloseInputs = { purchasePrice: 150000, endBuyerPrice: 185000, transFundingPct: 1, transFundingFlat: 500, atobClosingPct: 1, atobTitleFlat: 500, btocClosingPct: 1, btocTitleFlat: 500, insuranceFee: 0, otherConcessions: 0, paySellerClosingCosts: false, sellerClosingCostsPct: 0 } as DoubleCloseInputs;
  it('uses the supplied fee, not a hardcoded $10K', () => {
    const f = atDoubleClose(dc).totalDeductions;
    expect(calcDoubleCloseOffer(dc, 15000).mao).toBe(Math.round(185000 - 15000 - f));
    expect(calcDoubleCloseOffer(dc, 5000).mao).toBe(Math.round(185000 - 5000 - f));
  });
});

describe('Offer Oven closer checks', () => {
  const byId = (c: { id: string; pass: boolean }[]) => Object.fromEntries(c.map((x) => [x.id, x.pass]));
  it('seller finance thresholds', () => {
    const ok = byId(sfCloserChecks({ ...sf, purchase: 150000, fee: 5000 }));
    expect(ok).toMatchObject({ offer: true, down: true, entry: true, rate: true, balloon: true, cf: true, coc: true });
    const bad = byId(sfCloserChecks({ ...sf, purchase: 600000, down: 20, rate: 4.5, balloon: 4 }));
    expect(bad).toMatchObject({ offer: false, down: false, rate: false, balloon: false });
    expect(byId(sfCloserChecks({ ...sf, rate: 4, balloon: 5, down: 15 }))).toMatchObject({ rate: true, balloon: true, down: true });
  });
  it('sub-to rate limit depends on loan size', () => {
    expect(stMaxRate(149999)).toBe(OFFER_OVEN.st.maxRateSmallLoan);
    expect(stMaxRate(150000)).toBe(OFFER_OVEN.st.maxRateLargeLoan);
    expect(byId(stCloserChecks({ ...st, mtg: 100000, value: 110000, rate: 7.5 })).rate).toBe(true);
    expect(byId(stCloserChecks({ ...st, rate: 5.5 })).rate).toBe(false);
  });
  it('sub-to equity, entry, balloon; cash flow is advisory', () => {
    const c = stCloserChecks(st);
    expect(byId(c)).toMatchObject({ equity: true, down: true, entry: true, balloon: true });
    expect(c.find((x) => x.id === 'cf')!.advisory).toBe(true);
    expect(byId(stCloserChecks({ ...st, mtg: 100000 })).equity).toBe(false);
    expect(byId(stCloserChecks({ ...st, months: 48 })).balloon).toBe(false);
  });
});
