import { DSCRInputs, SFInputs, STInputs, FFInputs, OfferRange } from '../types';

export function money(n: number): string {
  const rounded = Math.round(n);
  return (rounded < 0 ? '-$' : '$') + Math.abs(rounded).toLocaleString('en-US');
}

export function pmt(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function balanceAfter(principal: number, annualRatePct: number, amortMonths: number, monthsPaid: number): number {
  const r = annualRatePct / 100 / 12;
  const p = pmt(principal, annualRatePct, amortMonths);
  if (r === 0) return Math.max(principal - p * monthsPaid, 0);
  const bal = principal * Math.pow(1 + r, monthsPaid) - (p * (Math.pow(1 + r, monthsPaid) - 1)) / r;
  return Math.max(bal, 0);
}

const PRICE_LO = 1000;
const PRICE_HI = 4000000;

export function solveMax(test: (p: number) => boolean, lo = PRICE_LO, hi = PRICE_HI): number | null {
  if (!test(lo)) return null;
  if (test(hi)) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (test(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

// DSCR calculation
export function atDSCR(P: number, v: DSCRInputs) {
  const down = (P * v.down) / 100;
  const loan = P - down;
  const pay = pmt(loan, v.rate, v.term * 12);
  const effRent = (v.rent * v.occ) / 100;
  const noi = effRent - v.ti - v.opex;
  const cf = noi - pay;
  const cashIn = down + v.fee;
  return {
    down,
    loan,
    pay,
    effRent,
    noi,
    cf,
    cashIn,
    dscr: pay > 0 ? noi / pay : (noi > 0 ? 99 : 0),
    coc: cashIn > 0 ? ((cf * 12) / cashIn) * 100 : 0,
    capRate: P > 0 ? ((noi * 12) / P) * 100 : 0
  };
}

export function calcDSCROffer(v: DSCRInputs): OfferRange {
  const mao = solveMax((P) => atDSCR(P, v).dscr >= 1.25);
  const target = solveMax((P) => {
    const r = atDSCR(P, v);
    return r.dscr >= 1.25 && r.coc >= 20;
  });

  if (mao === null) {
    return {
      anchor: null,
      target: null,
      mao: null,
      note: `Rent minus expenses is negative at ${v.occ}% occupancy, so <b>no purchase price fixes this</b>. The rent number or the expense number has to change before price matters.`,
      status: 'bad'
    };
  }

  const anchor = target !== null && target > 0 ? target * 0.9 : mao * 0.85;
  const over = v.purchase - mao;

  if (over > 0) {
    return {
      anchor,
      target,
      mao,
      note: `You are <b>${money(over)} over</b> your max. Lenders underwrite to DSCR, and at ${money(v.purchase)} this loan does not clear 1.25. Come down to ${money(mao)} or the deal has no exit.`,
      status: 'warn'
    };
  } else if (mao > v.purchase * 1.15) {
    return {
      anchor,
      target,
      mao,
      note: `Careful with this one. The numbers clear well above your price, which means <b>cash flow is no longer your constraint — market value is</b>, and this calculator does not know what the house is worth. Pull comps and treat those as the real cap.`,
      status: 'warn'
    };
  }

  return {
    anchor,
    target,
    mao,
    note: `Open at <b>${money(anchor)}</b> and you have room to move. Buyer is all-in at ${money(mao + v.fee)} if you pay max and add your ${money(v.fee)} fee.`,
    status: 'good'
  };
}

// Seller Finance calculation
export function atSF(P: number, v: SFInputs) {
  const down = (P * v.down) / 100;
  const loan = P - down;
  const pay = pmt(loan, v.rate, v.amort * 12);
  const effRent = (v.rent * v.occ) / 100;
  const cf = effRent - pay - v.ti;
  const cashIn = down + v.fee;
  const bal = balanceAfter(loan, v.rate, v.amort * 12, v.balloon * 12);
  const fv = P * Math.pow(1 + v.appr / 100, v.balloon);
  const refiOk = bal <= fv * 0.75;
  const totalCF = cf * 12 * v.balloon;
  const totalInterest = pay * v.balloon * 12 - (loan - bal);

  return {
    down,
    loan,
    pay,
    effRent,
    cf,
    cashIn,
    bal,
    fv,
    equityAtBalloon: fv - bal,
    totalCF,
    totalInterest,
    coc: cashIn > 0 ? ((cf * 12) / cashIn) * 100 : 0,
    refiOk
  };
}

export function calcSFOffer(v: SFInputs): OfferRange {
  const probe = atSF(v.purchase > 0 ? v.purchase : 100000, v);
  if (!probe.refiOk) {
    return {
      anchor: null,
      target: null,
      mao: null,
      note: `The balloon does not refinance at these terms — and that is <b>not a price problem</b>. The payoff and future value both scale with price. Stretch the balloon past ${v.balloon} years, cut the rate, or raise the down payment.`,
      status: 'bad'
    };
  }

  const mao = solveMax((P) => atSF(P, v).cf >= 0);
  const target = solveMax((P) => {
    const r = atSF(P, v);
    return r.cf >= 200 && r.coc >= 20;
  });

  if (mao === null) {
    return {
      anchor: null,
      target: null,
      mao: null,
      note: `Even at a nominal price the payment plus taxes eats the rent. Pull the <b>interest rate</b> first — on a carry, sellers care more about the monthly check than the rate.`,
      status: 'bad'
    };
  }

  const anchor = target !== null && target > 0 ? target * 0.9 : mao * 0.85;
  const over = v.purchase - mao;

  if (over > 0) {
    return {
      anchor,
      target,
      mao,
      note: `At ${money(v.purchase)} you are feeding this deal every month. <b>${money(mao)}</b> is break-even at ${v.rate}%. Try asking for a lower rate — that moves the same number without costing the seller their headline price.`,
      status: 'warn'
    };
  } else if (mao > v.purchase * 1.15) {
    return {
      anchor,
      target,
      mao,
      note: `At ${v.rate}% over ${v.amort}-year amort the payment is tiny, so cash flow stays positive far above your price. <b>Cash flow is not your ceiling here. Market value is</b>, and this tool does not know the value. Pull comps and treat those as the real cap. Cheap terms are a reason to buy, never a reason to overpay.`,
      status: 'warn'
    };
  }

  return {
    anchor,
    target,
    mao,
    note: `Anchor at <b>${money(anchor)}</b>. The rate is a second lever: every point you pull off it raises what you can afford to pay.`,
    status: 'good'
  };
}

// Subject-To calculation
export function atST(v: STInputs) {
  const pay = pmt(v.mtg, v.rate, v.months);
  const effRent = (v.rent * v.occ) / 100;
  const cf = effRent - pay - v.ti;
  const equity = v.value - v.mtg;
  const equityPct = v.value > 0 ? (equity / v.value) * 100 : 0;
  const ltv = v.value > 0 ? (v.mtg / v.value) * 100 : 0;
  const cashIn = v.cash + v.fee;
  const coc = cashIn > 0 ? ((cf * 12) / cashIn) * 100 : 0;

  return {
    pay,
    effRent,
    cf,
    equity,
    equityPct,
    ltv,
    cashIn,
    coc
  };
}

export function calcSTOffer(v: STInputs): OfferRange {
  const r = atST(v);
  if (r.equity <= 0) {
    return {
      anchor: null,
      target: null,
      mao: null,
      note: `The loan is at or above the value, so there is <b>no equity to capture</b>. Cash flow alone is a thin reason to inherit someone else's debt.`,
      status: 'bad'
    };
  }

  if (r.cf <= 0) {
    return {
      anchor: null,
      target: 0,
      mao: 0,
      note: `Cash flow is negative before you hand over a dollar, so <b>any</b> cash to the seller makes it worse. Max is zero until rent or payment changes.`,
      status: 'bad'
    };
  }

  const mao = Math.max((r.cf * 12) / 0.15 - v.fee, 0);
  const target = Math.max((r.cf * 12) / 0.25 - v.fee, 0);
  const anchor = target > 0 ? target * 0.9 : mao * 0.85;
  const over = v.cash - mao;

  if (over > 0) {
    return {
      anchor,
      target,
      mao,
      note: `These are <b>cash to the seller</b>, not purchase price — the price is their loan balance. At ${money(v.cash)} you are ${money(over)} past a 15% return on your money.`,
      status: 'warn'
    };
  }

  return {
    anchor,
    target,
    mao,
    note: `These are <b>cash to the seller</b>, not purchase price. You are capturing ${money(r.equity)} of equity and a ${v.rate}% loan you could not get today. Keep cash small and the return takes care of itself.`,
    status: 'good'
  };
}

// Fix & Flip calculation (Jerry Norton Wholesaler MAO fix: deduct fee from seller offer)
export function atFF(P: number, v: FFInputs) {
  const holding = v.hold * v.months;
  const invested = P + v.rehab + holding;
  const realtor = (v.arv * v.realtor) / 100;
  const closing = (v.arv * v.closing) / 100;
  const sell = realtor + closing;
  const profit = v.arv - invested - sell;
  const roi = invested > 0 ? (profit / invested) * 100 : 0;
  const margin = v.arv > 0 ? (profit / v.arv) * 100 : 0;

  return {
    holding,
    invested,
    realtor,
    closing,
    sell,
    profit,
    roi,
    margin
  };
}

export function calcMMAOBreakdown(arv: number, rehab: number, fee: number, purchase: number) {
  const mao70 = arv * 0.70 - rehab - fee;
  const mao75 = arv * 0.75 - rehab - fee;
  const mao80 = arv * 0.80 - rehab - fee;
  const anchor = Math.round((mao70 * 0.80) / 500) * 500;
  const target = Math.round((mao70 * 0.90) / 500) * 500;
  const spread = mao70 - purchase; // positive means under MAO (safe wholesale cushion)

  return {
    mao70: Math.round(mao70),
    mao75: Math.round(mao75),
    mao80: Math.round(mao80),
    anchor,
    target,
    spread: Math.round(spread),
    isUnderMao: spread >= 0,
  };
}

export function calcFFOffer(v: FFInputs): OfferRange {
  // Wholesale MAO: Jerry Norton 70% rule minus rehab minus assignment fee!
  // MAO = (ARV x 70%) - Rehab - Fee
  const mao70 = v.arv * 0.70 - v.rehab - v.fee;
  const mao = Math.round(mao70);

  if (mao <= 0) {
    return {
      anchor: null,
      target: null,
      mao: null,
      note: `Rehab is <b>${money(v.rehab)}</b> against a ${money(v.arv)} ARV. At the 70% wholesale rule, the MMAO is $0 or negative — ARV is too low or rehab scope is too large.`,
      status: 'bad'
    };
  }

  // Anchor is aggressive opening offer: 80% of MAO
  const anchor = Math.round((mao * 0.80) / 500) * 500;
  // Target is realistic negotiation target: 90% of MAO
  const target = Math.round((mao * 0.90) / 500) * 500;

  const over = v.purchase - mao;

  if (over > 0) {
    return {
      anchor,
      target,
      mao,
      note: `You are <b>${money(over)} OVER</b> your 70% Wholesale MMAO (${money(mao)}). You must negotiate purchase price down to <b>${money(mao)}</b> to protect your ${money(v.fee)} assignment fee and buyer 30% gross spread.`,
      status: 'warn'
    };
  }

  return {
    anchor,
    target,
    mao,
    note: `You are <b>${money(Math.abs(over))} UNDER</b> your 70% Wholesale MMAO (${money(mao)}). Anchor opening offer at <b>${money(anchor)}</b>, work up toward Target (<b>${money(target)}</b>), and never cross MMAO (<b>${money(mao)}</b>).`,
    status: 'good'
  };
}
