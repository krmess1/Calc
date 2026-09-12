import React, { useState, useEffect } from 'react';
import { DSCRInputs, SFInputs, STInputs, FFInputs, StrategyTab, OfferRange } from '../types';
import { atDSCR, atSF, atST, atFF, money } from '../utils/calc';
import { getAccessToken, googleSignIn } from '../lib/googleAuth';
import { uploadDealTearSheetToDrive } from '../lib/driveService';

export interface SavedDeal {
  id: string;
  address: string;
  seller?: string;
  date: string;
  strategy: StrategyTab;
  price: number;
  highlight: string;
  notes?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  activeTab: StrategyTab;
  defaultAddress?: string;
  dscr: DSCRInputs;
  sf: SFInputs;
  st: STInputs;
  ff: FFInputs;
  offers: {
    dscr: OfferRange;
    sf: OfferRange;
    st: OfferRange;
    ff: OfferRange;
  };
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  activeTab,
  defaultAddress,
  dscr,
  sf,
  st,
  ff,
  offers,
  onClose,
}) => {
  const [address, setAddress] = useState(defaultAddress || '');
  const [strategy, setStrategy] = useState<string>(activeTab === 'cmp' || activeTab === 'guide' ? 'dscr' : activeTab);

  useEffect(() => {
    if (isOpen && defaultAddress) {
      setAddress(defaultAddress);
    }
  }, [isOpen, defaultAddress]);
  const [seller, setSeller] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSuccessLink, setDriveSuccessLink] = useState<string | null>(null);

  // Load saved deals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deal_calculator_saved_deals');
      if (stored) {
        setSavedDeals(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStrategyBlock = (t: string) => {
    const b: { title: string; rows: [string, string][]; offer: [string, string][] } = {
      title: '',
      rows: [],
      offer: [],
    };
    if (t === 'dscr') {
      const r = atDSCR(dscr.purchase, dscr);
      b.title = 'DSCR Rental Hold';
      b.rows = [
        ['Buyer entry cash (Cash to close)', money(r.cashIn)],
        ['Total purchase basis', money(dscr.purchase + dscr.fee)],
        ['Contract purchase price', money(dscr.purchase)],
        ['Wholesale assignment fee', money(dscr.fee)],
        ['Down payment (' + dscr.down + '%)', money((dscr.purchase * dscr.down) / 100)],
        ['Rate / term', dscr.rate + '% / ' + dscr.term + ' yr'],
        ['Gross rent', money(dscr.rent) + '/mo'],
        ['Occupancy used', dscr.occ + '% (effective ' + money(r.effRent) + ')'],
        ['Taxes + insurance', money(dscr.ti) + '/mo'],
        ['Other expenses', money(dscr.opex) + '/mo'],
        ['Monthly payment', money(r.pay)],
        ['Monthly cash flow', money(r.cf)],
        ['DSCR', r.dscr.toFixed(2)],
        ['Cash-on-cash', r.coc.toFixed(1) + '%'],
      ];
      if (offers.dscr.anchor) b.offer.push(['Anchor offer', money(offers.dscr.anchor)]);
      if (offers.dscr.target) b.offer.push(['Target offer', money(offers.dscr.target)]);
      if (offers.dscr.mao) b.offer.push(['Max Allowable Offer (DSCR 1.25)', money(offers.dscr.mao)]);
    } else if (t === 'sf') {
      const r2 = atSF(sf.purchase, sf);
      b.title = 'Seller Finance';
      b.rows = [
        ['Buyer entry cash (Cash to close)', money(r2.cashIn)],
        ['Total purchase basis', money(sf.purchase + sf.fee)],
        ['Contract purchase price', money(sf.purchase)],
        ['Wholesale assignment fee', money(sf.fee)],
        ['Down payment (' + sf.down + '%)', money((sf.purchase * sf.down) / 100)],
        ['Seller carries', money(sf.purchase - (sf.purchase * sf.down) / 100)],
        ['Interest rate', sf.rate + '%'],
        ['Balloon / amortization', sf.balloon + ' yr / ' + sf.amort + ' yr'],
        ['Gross rent', money(sf.rent) + '/mo'],
        ['Occupancy used', sf.occ + '%'],
        ['Monthly payment', money(r2.pay)],
        ['Monthly net cash flow', money(r2.cf)],
        ['Cash-on-cash return', r2.coc.toFixed(1) + '%'],
        ['Buyer exit protection', 'Miss 2 months deed-in-lieu walkaway clause'],
        ['Balloon balance', money(r2.bal)],
        ['Projected value at balloon', money(r2.fv)],
        ['75% refi covers balloon', r2.refiOk ? 'Yes' : 'No'],
      ];
      if (offers.sf.anchor) b.offer.push(['Anchor offer', money(offers.sf.anchor)]);
      if (offers.sf.target) b.offer.push(['Target offer', money(offers.sf.target)]);
      if (offers.sf.mao) b.offer.push(['Max cash flow offer', money(offers.sf.mao)]);
    } else if (t === 'st') {
      const r3 = atST(st);
      b.title = 'Subject-To';
      b.rows = [
        ['Buyer entry cash (Cash to close)', money(r3.cashIn)],
        ['Total property value', money(st.value)],
        ['Cash to seller', money(st.cash)],
        ['Wholesale assignment fee', money(st.fee)],
        ['Existing loan assumed', money(st.mtg)],
        ['Equity captured', money(r3.equity)],
        ['Their interest rate', st.rate + '%'],
        ['Months remaining', `${st.months}`],
        ['Gross rent', money(st.rent) + '/mo'],
        ['Occupancy used', st.occ + '%'],
        ['Payment', money(r3.pay) + '/mo'],
        ['Monthly cash flow', money(r3.cf)],
        ['Cash-on-cash', r3.coc.toFixed(1) + '%'],
      ];
      if (offers.st.anchor) b.offer.push(['Anchor cash to seller', money(offers.st.anchor)]);
      if (offers.st.target) b.offer.push(['Target cash to seller', money(offers.st.target)]);
      if (offers.st.mao) b.offer.push(['Max cash to seller', money(offers.st.mao)]);
    } else {
      const r4 = atFF(ff.purchase, ff);
      b.title = 'Fix & Flip';
      b.rows = [
        ['Buyer entry price (To close deal)', money(ff.purchase + ff.fee)],
        ['Total all-in project basis', money(r4.invested)],
        ['After repair value (ARV)', money(ff.arv)],
        ['Purchase contract price', money(ff.purchase)],
        ['Wholesale assignment fee', money(ff.fee)],
        ['Rehab budget', money(ff.rehab)],
        ['Holding (' + ff.months + ' mo @ ' + money(ff.hold) + ')', money(r4.holding)],
        ['Realtor (' + ff.realtor + '%)', money(r4.realtor)],
        ['Closing (' + ff.closing + '%)', money(r4.closing)],
        ['Net profit', money(r4.profit)],
        ['ROI on cash', r4.roi.toFixed(1) + '%'],
        ['Margin on ARV', r4.margin.toFixed(1) + '%'],
        ['Wholesale 70% MAO', money(ff.arv * 0.7 - ff.rehab - ff.fee)],
      ];
      if (offers.ff.anchor) b.offer.push(['Anchor offer (80% MAO)', money(offers.ff.anchor)]);
      if (offers.ff.target) b.offer.push(['Target offer (90% MAO)', money(offers.ff.target)]);
      if (offers.ff.mao) b.offer.push(['Wholesaler MAO (70% - Rehab - Fee)', money(offers.ff.mao)]);
    }
    return b;
  };

  const handlePrint = () => {
    if (!address.trim()) {
      setError('Please enter the property address or deal name.');
      return;
    }
    setError('');

    const originalTitle = document.title;
    const sanitizedAddress = address.trim().replace(/[^a-zA-Z0-9\s-]/g, '');
    document.title = `${sanitizedAddress} - Deal Analysis Tear Sheet`;

    const list = strategy === 'all' ? ['dscr', 'sf', 'st', 'ff'] : [strategy];
    const d = new Date();
    const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let h = '';
    h += `<div class="p-header">`;
    h += `<div class="p-title">${address}</div>`;
    h += `<div class="p-meta">Deal Underwriting Tear Sheet · ${dateStr}${seller ? ' · Seller: ' + seller : ''} · Prepared for Review</div>`;
    h += `</div>`;

    for (let i = 0; i < list.length; i++) {
      const b = getStrategyBlock(list[i]);
      h += `<div class="p-section-title">${b.title}</div>`;

      if (b.offer.length > 0) {
        h += `<div class="p-offer-box">`;
        for (let j = 0; j < b.offer.length; j++) {
          h += `<div class="p-offer-item">`;
          h += `<div class="p-offer-lbl">${b.offer[j][0]}</div>`;
          h += `<div class="p-offer-val">${b.offer[j][1]}</div>`;
          h += `</div>`;
        }
        h += `</div>`;
      }

      h += `<div class="p-grid">`;
      for (let k = 0; k < b.rows.length; k++) {
        h += `<div class="p-row">`;
        h += `<span class="p-lbl">${b.rows[k][0]}</span>`;
        h += `<span class="p-val">${b.rows[k][1]}</span>`;
        h += `</div>`;
      }
      h += `</div>`;
    }

    if (notes.trim()) {
      h += `<div class="p-notes"><div class="p-notes-lbl">Underwriter Notes & Dispo Strategy</div>${notes.replace(/\n/g, '<br>')}</div>`;
    }

    h += `<div class="p-foot">Newcombe Enterprises · Underwriting Summary for Private Placement & Dispo · Figures are estimates based on user assumptions and do not constitute an appraisal or financing guarantee.</div>`;

    const printSheet = document.getElementById('print-sheet');
    if (printSheet) {
      printSheet.innerHTML = h;
    }

    onClose();
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  };

  const buildTextSummary = () => {
    const list = strategy === 'all' ? ['dscr', 'sf', 'st', 'ff'] : [strategy];
    const d = new Date();
    const L: string[] = [];
    L.push(`=========================================`);
    L.push(`DEAL ANALYSIS: ${address.toUpperCase()}`);
    L.push(`Date: ${d.toLocaleDateString('en-US')}${seller ? ' | Seller: ' + seller : ''}`);
    L.push(`=========================================`);
    L.push('');

    for (let i = 0; i < list.length; i++) {
      const b = getStrategyBlock(list[i]);
      L.push(`[ ${b.title.toUpperCase()} ]`);
      if (b.offer.length > 0) {
        L.push('-- OFFER GUIDELINES --');
        for (let j = 0; j < b.offer.length; j++) {
          L.push(`  ${b.offer[j][0]}: ${b.offer[j][1]}`);
        }
      }
      L.push('-- UNDERWRITING NUMBERS --');
      for (let k = 0; k < b.rows.length; k++) {
        L.push(`  ${b.rows[k][0]}: ${b.rows[k][1]}`);
      }
      L.push('');
    }

    if (notes.trim()) {
      L.push('=== UNDERWRITER NOTES ===');
      L.push(notes);
      L.push('');
    }

    L.push('Newcombe Enterprises - Underwriting tear sheet. All numbers subject to walk-through and title verification.');

    return L.join('\n');
  };

  const handleCopy = () => {
    if (!address.trim()) {
      setError('Please enter the property address or deal name first.');
      return;
    }
    setError('');
    const txt = buildTextSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => {
        setCopyFeedback('Copied deal summary to clipboard!');
        setTimeout(() => setCopyFeedback(''), 3000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyFeedback('Copied deal summary to clipboard!');
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  const handleSaveToDrive = async () => {
    if (!address.trim()) {
      setError('Please enter the property address or deal name first.');
      return;
    }
    setError('');
    setDriveSuccessLink(null);

    try {
      setSavingToDrive(true);
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Google Drive authorization required.');
      }

      const txt = buildTextSummary();
      const sanitizedAddress = address.trim().replace(/[^a-zA-Z0-9\s-]/g, '');
      const fileName = `${sanitizedAddress} - Deal Tear Sheet`;
      const uploaded = await uploadDealTearSheetToDrive(fileName, txt);

      setCopyFeedback(`✓ Uploaded "${uploaded.name}" to Google Drive!`);
      if (uploaded.webViewLink) {
        setDriveSuccessLink(uploaded.webViewLink);
      }
      setTimeout(() => setCopyFeedback(''), 4000);
    } catch (err: any) {
      console.error('Drive upload error:', err);
      setError(err.message || 'Failed to upload tear sheet to Google Drive.');
    } finally {
      setSavingToDrive(false);
    }
  };

  const handleSaveToPipeline = () => {
    if (!address.trim()) {
      setError('Enter property address to save to your pipeline.');
      return;
    }
    setError('');

    let highlight = '';
    let price = 0;
    if (strategy === 'ff') {
      highlight = `Flip Profit: ${money(atFF(ff.purchase, ff).profit)} (ROI ${atFF(ff.purchase, ff).roi.toFixed(0)}%)`;
      price = ff.purchase;
    } else if (strategy === 'sf') {
      highlight = `CF: ${money(atSF(sf.purchase, sf).cf)}/mo (Down: ${money(atSF(sf.purchase, sf).down)})`;
      price = sf.purchase;
    } else if (strategy === 'st') {
      highlight = `Equity: ${money(atST(st).equity)} (CF: ${money(atST(st).cf)}/mo)`;
      price = st.value;
    } else {
      highlight = `DSCR: ${atDSCR(dscr.purchase, dscr).dscr.toFixed(2)} (CF: ${money(atDSCR(dscr.purchase, dscr).cf)}/mo)`;
      price = dscr.purchase;
    }

    const newDeal: SavedDeal = {
      id: Date.now().toString(),
      address: address.trim(),
      seller: seller.trim() || undefined,
      date: new Date().toLocaleDateString('en-US'),
      strategy: (strategy === 'all' ? 'dscr' : strategy) as StrategyTab,
      price,
      highlight,
      notes: notes.trim() || undefined,
    };

    const updated = [newDeal, ...savedDeals.filter(d => d.address.toLowerCase() !== address.trim().toLowerCase())];
    setSavedDeals(updated);
    try {
      localStorage.setItem('deal_calculator_saved_deals', JSON.stringify(updated));
      setCopyFeedback('✓ Deal saved to your local pipeline!');
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch {
      // ignore
    }
  };

  const handleDeleteSavedDeal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDeals.filter(d => d.id !== id);
    setSavedDeals(updated);
    localStorage.setItem('deal_calculator_saved_deals', JSON.stringify(updated));
  };

  return (
    <div className="modal-back show" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#185fa5' }}>Share Deal Summary</h2>
          <button
            type="button"
            onClick={() => setShowSavedList(!showSavedList)}
            style={{
              background: '#eef4fb',
              color: '#185fa5',
              border: '1px solid #c2dcf6',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showSavedList ? 'Back to Editor' : `📁 Pipeline (${savedDeals.length})`}
          </button>
        </div>

        {showSavedList ? (
          <div>
            <p className="sub" style={{ marginBottom: '12px' }}>
              Your saved deals stored locally in your browser:
            </p>
            {savedDeals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#888', fontStyle: 'italic', background: '#faf9f5', borderRadius: '8px' }}>
                No saved deals in your pipeline yet. Enter a property address and click "Save to Pipeline" below.
              </div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedDeals.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setAddress(d.address);
                      if (d.seller) setSeller(d.seller);
                      if (d.notes) setNotes(d.notes);
                      setStrategy(d.strategy);
                      setShowSavedList(false);
                    }}
                    style={{
                      background: '#fff',
                      border: '1px solid #dcd8ce',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#2c2c2a', fontSize: '0.9rem' }}>{d.address}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                        {d.date} · <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#185fa5' }}>{d.strategy}</span> · {d.highlight}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedDeal(d.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#b3261e',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px',
                      }}
                      title="Delete from pipeline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-ghost" onClick={() => setShowSavedList(false)}>
                Back to Form
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="sub">
              Enter the property address to name your exported PDF tear sheet and copyable text summary.
            </p>

            <label className="fl" htmlFor="sh-address">
              Property Address / Deal Name <span style={{ color: '#b3261e' }}>*</span>
            </label>
            <input
              type="text"
              id="sh-address"
              placeholder="e.g. 1420 W Cheryl Dr, Phoenix AZ 85021"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="off"
            />

            <label className="fl" htmlFor="sh-strategy">
              Strategy to include
            </label>
            <select
              id="sh-strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
            >
              <option value="dscr">DSCR Rental Hold</option>
              <option value="sf">Seller Finance</option>
              <option value="st">Subject-To</option>
              <option value="ff">Fix &amp; Flip / Wholesale</option>
              <option value="all">All 4 Strategies Side-by-Side</option>
            </select>

            <label className="fl" htmlFor="sh-seller">
              Seller Name (optional)
            </label>
            <input
              type="text"
              id="sh-seller"
              placeholder="e.g. John Doe / Lead ID #402"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              autoComplete="off"
            />

            <label className="fl" htmlFor="sh-notes">
              Dispo &amp; Underwriting Notes (optional)
            </label>
            <textarea
              id="sh-notes"
              placeholder="Zillow comps, seller motivation, roof age, lockbox access, dispo plan for Richard / buyers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: '65px' }}
            />

            {error && <div className="modal-err" style={{ color: '#b3261e', marginBottom: '8px' }}>{error}</div>}
            {copyFeedback && (
              <div className="modal-err" style={{ color: '#27500a', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{copyFeedback}</span>
                {driveSuccessLink && (
                  <a
                    href={driveSuccessLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#185fa5', textDecoration: 'underline', fontSize: '0.8rem' }}
                  >
                    View in Drive ↗
                  </a>
                )}
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="btn-primary" onClick={handlePrint}>
                📄 Save PDF Tear Sheet
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleSaveToDrive}
                disabled={savingToDrive}
                style={{
                  background: '#f8fafd',
                  color: '#185fa5',
                  borderColor: '#c2dcf6',
                  fontWeight: 600,
                }}
              >
                {savingToDrive ? '⏳ Uploading...' : '📁 Save to Google Drive'}
              </button>
              <button type="button" className="btn-ghost" onClick={handleCopy}>
                📋 Copy Text
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleSaveToPipeline}
                style={{ background: '#f5f8f3', color: '#27500a', borderColor: '#b7ceb3' }}
              >
                💾 Pipeline
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
