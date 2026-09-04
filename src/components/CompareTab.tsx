import React from 'react';
import { DSCRInputs, SFInputs, STInputs, FFInputs } from '../types';
import { atDSCR, atSF, atST, atFF, money } from '../utils/calc';

interface CompareTabProps {
  dscr: DSCRInputs;
  sf: SFInputs;
  st: STInputs;
  ff: FFInputs;
}

export const CompareTab: React.FC<CompareTabProps> = ({ dscr, sf, st, ff }) => {
  const ffr = atFF(ff.purchase, ff);
  const dr = atDSCR(dscr.purchase, dscr);
  const sr = atSF(sf.purchase, sf);
  const tr = atST(st);

  // 1. Cash Wholesale
  const wsOk = ff.fee > 0 && ffr.profit > ff.fee;

  // 2. Fix & Flip
  const ffCls = ffr.roi >= 20 ? 'green' : ffr.roi >= 12 ? 'yellow' : 'red';
  const ffVerdict = ffr.roi >= 20 ? 'Strong' : ffr.roi >= 12 ? 'Thin' : 'Not viable';

  // 3. Novation
  const novProfit = ff.arv - ff.purchase - ff.rehab - (ff.arv * (ff.realtor + ff.closing)) / 100 - ff.hold * ff.months;
  const novCls = novProfit > ff.fee * 2 ? 'green' : novProfit > ff.fee ? 'yellow' : 'red';
  const novVerdict = novProfit > ff.fee * 2 ? 'Worth it' : novProfit > ff.fee ? 'Marginal' : 'Not worth it';

  // 4. DSCR
  const dCls = dr.dscr >= 1.25 && dr.coc >= 20 ? 'green' : dr.dscr >= 1.0 ? 'yellow' : 'red';
  const dVerdict = dr.dscr >= 1.25 && dr.coc >= 20 ? 'Lender ready' : dr.dscr >= 1.0 ? 'Borderline' : 'Will not fund';

  // 5. Seller Finance
  const sCls = sr.cf > 200 && sr.refiOk ? 'green' : sr.cf >= 0 && sr.refiOk ? 'yellow' : 'red';
  const sVerdict = sr.cf > 200 && sr.refiOk ? 'Strong' : sr.cf >= 0 && sr.refiOk ? 'Thin' : 'Exit problem';

  // 6. Subject-To
  const tCls = tr.cf > 200 && tr.equity > 0 ? 'green' : tr.cf >= 0 && tr.equity > 0 ? 'yellow' : 'red';
  const tVerdict = tr.cf > 200 && tr.equity > 0 ? 'Strong' : tr.cf >= 0 && tr.equity > 0 ? 'Thin' : 'High risk';

  return (
    <div id="cmp-tab" className="tab-panel">
      <div className="calc-box" style={{ display: 'block' }}>
        <div className="tool-hint" style={{ marginTop: 0 }}>
          Every strategy below is running off the numbers you already entered on the other tabs. Change something there and this updates with it.
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
                <span className="l">Your cash in</span>
                <span className="v">{money(1000)} EMD</span>
              </div>
              <div className="cmp-r">
                <span className="l">Your profit</span>
                <span className="v">{money(ff.fee)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Time to exit</span>
                <span className="v">2-4 weeks</span>
              </div>
              <div className="cmp-r">
                <span className="l">Buyer all-in</span>
                <span className="v">{money(ff.purchase + ff.fee)}</span>
              </div>
            </div>
            <div className="cmp-risk">
              Fastest and lowest risk, smallest payday. The whole thing rests on the buyer actually closing — and on your spread surviving their inspection.
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
                <span className="l">Cash in</span>
                <span className="v">{money(ffr.invested)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Net profit</span>
                <span className="v">{money(ffr.profit)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">ROI</span>
                <span className="v">{ffr.roi.toFixed(1)}%</span>
              </div>
              <div className="cmp-r">
                <span className="l">Time to exit</span>
                <span className="v">{ff.months + 2} months</span>
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
                <span className="l">Cash in</span>
                <span className="v">{money(ff.rehab)} (rehab)</span>
              </div>
              <div className="cmp-r">
                <span className="l">Est. profit</span>
                <span className="v">{money(novProfit)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">vs. assigning</span>
                <span className="v">{money(novProfit - ff.fee)} more</span>
              </div>
              <div className="cmp-r">
                <span className="l">Time to exit</span>
                <span className="v">60-120 days</span>
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
            <div className="cmp-sub">Conventional investor loan, hold it and rent it.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Cash in</span>
                <span className="v">{money(dr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v">{money(dr.cf)}</span>
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
              DSCR under 1.25 and most lenders walk. That ratio is the whole conversation — fix it with price, not with optimistic rent.
            </div>
          </div>

          {/* Seller Finance */}
          <div className="cmp-card">
            <div className="cmp-head">
              <span className="cmp-name">Seller Finance</span>
              <span className={`cmp-pill ${sCls}`}>{sVerdict}</span>
            </div>
            <div className="cmp-sub">Seller carries the paper. Low cash in, balloon at the end.</div>
            <div className="cmp-rows">
              <div className="cmp-r">
                <span className="l">Cash in</span>
                <span className="v">{money(sr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v">{money(sr.cf)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Balloon due</span>
                <span className="v">{money(sr.bal)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Time to exit</span>
                <span className="v">{sf.balloon} years</span>
              </div>
            </div>
            <div className="cmp-risk">
              {sr.refiOk
                ? `A 75% refi covers the balloon at projected value. Know your exit before you sign, not in year ${sf.balloon}.`
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
                <span className="l">Cash in</span>
                <span className="v">{money(tr.cashIn)}</span>
              </div>
              <div className="cmp-r">
                <span className="l">Monthly cash flow</span>
                <span className="v">{money(tr.cf)}</span>
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
