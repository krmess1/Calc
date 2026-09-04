export type StrategyTab = 'dscr' | 'sf' | 'st' | 'ff' | 'cmp' | 'guide';

export interface DSCRInputs {
  purchase: number;
  down: number;
  rate: number;
  term: number;
  rent: number;
  occ: number;
  ti: number;
  opex: number;
  fee: number;
}

export interface SFInputs {
  purchase: number;
  down: number;
  rate: number;
  balloon: number;
  amort: number;
  rent: number;
  occ: number;
  ti: number;
  appr: number;
  fee: number;
}

export interface STInputs {
  value: number;
  mtg: number;
  rate: number;
  months: number;
  cash: number;
  rent: number;
  occ: number;
  ti: number;
  fee: number;
}

export interface FFInputs {
  purchase: number;
  rehab: number;
  arv: number;
  hold: number;
  months: number;
  realtor: number;
  closing: number;
  fee: number;
}

export interface OfferRange {
  anchor: number | null;
  target: number | null;
  mao: number | null;
  note: string;
  status: 'good' | 'warn' | 'bad';
}

export interface NetSheetInputs {
  payoff: number;
  liens: number;
  closeP: number;
  credits: number;
}

export interface MMAOBreakdown {
  mao70: number;
  mao75: number;
  mao80: number;
  anchor: number;
  target: number;
  spread: number;
  isUnderMao: boolean;
}

export interface UniversalProperty {
  address: string;
  // Universally Synced Core Property Numbers
  listPrice: number; // Seller Asking / Zillow List Price
  purchasePrice: number; // Our Wholesale Contract Offer
  propertyValue: number; // ARV / As-Is Market Value (defaults to list price or comp value)
  rent: number;
  occupancy: number;
  taxesAndInsurance: number;
  assignmentFee: number;
  rehab: number;

  // Seller Intel & Confirmation Flags (Tracks what we still need to ask on the call)
  stMortgageEntered: boolean;
  rehabEntered: boolean;

  // DSCR Specific
  dscrDown: number;
  dscrRate: number;
  dscrTerm: number;
  dscrOpex: number;

  // Seller Finance Specific
  sfDown: number;
  sfRate: number;
  sfBalloon: number;
  sfAmort: number;
  sfAppr: number;

  // Subject-To Specific
  stMortgageBalance: number;
  stRate: number;
  stMonthsRemaining: number;
  stCashToSeller: number;

  // Fix & Flip Specific
  ffHoldMonthly: number;
  ffMonths: number;
  ffRealtorPct: number;
  ffClosingPct: number;

  // Seller Net Sheet Specific
  netPayoff: number;
  netLiens: number;
  netClosePct: number;
  netCredits: number;
}
