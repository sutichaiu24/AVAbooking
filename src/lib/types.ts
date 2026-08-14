/**
 * Shared domain types for the Thai AirAsia local booking layer.
 * Kept framework-agnostic so both the BFF route handlers and the React
 * client components can import from a single source of truth.
 */

export type AirportCode = "DMK" | "CNX" | "HKT" | "HDY" | "CEI" | "UTH";

export interface Airport {
  code: AirportCode;
  city: string;
  cityTh: string;
  name: string;
  nameTh: string;
  /** Passenger Service Charge (PSC) collected on domestic departure, THB. */
  psc: number;
}

/** Branded fare families offered on Thai domestic sectors. */
export type FareBrand = "VALUE" | "PREMIUM_FLEX";

export interface FareBrandSpec {
  id: FareBrand;
  name: string;
  nameTh: string;
  tagline: string;
  /** Multiplier applied to the sector's published base fare. */
  multiplier: number;
  inclusions: string[];
  baggageKg: number;
  changeable: boolean;
  refundable: boolean;
}

export interface FlightOption {
  id: string;
  flightNo: string;
  origin: AirportCode;
  destination: AirportCode;
  /** ISO-8601 local departure timestamp (Asia/Bangkok, UTC+7). */
  departAt: string;
  arriveAt: string;
  durationMin: number;
  aircraft: string;
  seatsLeft: number;
  /** Published one-way base fare per adult, THB, before tax and VAT. */
  baseFare: number;
}

export interface SearchQuery {
  origin: AirportCode;
  destination: AirportCode;
  departDate: string; // YYYY-MM-DD
  pax: number;
}

export interface SearchResponse {
  query: SearchQuery;
  currency: "THB";
  flights: FlightOption[];
  /** Milliseconds the mock Navitaire availability call took. */
  latencyMs: number;
}

/** Fully expanded, itemised THB quote — every figure the passenger sees. */
export interface FareQuote {
  pax: number;
  brand: FareBrand;
  baseFarePerPax: number;
  baseFareTotal: number;
  airportTax: number;
  adminFee: number;
  /** Sum of the VAT-bearing components. */
  netSubtotal: number;
  vatRate: number;
  vat: number;
  total: number;
  savings: LocalSettlementSavings;
}

/**
 * What the passenger avoids by being billed by the Thai merchant entity
 * instead of the cross-border acquiring entity.
 */
export interface LocalSettlementSavings {
  /** 1% cross-border interchange surcharge levied by Thai issuers. */
  crossBorderFee: number;
  /** Typical issuer FX / DCC markup on a non-THB settlement. */
  fxMarkup: number;
  total: number;
}

export type PaymentMethodId =
  | "promptpay"
  | "mobile_banking"
  | "local_card"
  | "ewallet";

export interface PaymentMethodSpec {
  id: PaymentMethodId;
  name: string;
  nameTh: string;
  blurb: string;
  /** Merchant discount rate charged by the local acquirer, %. */
  mdr: number;
  settlementDays: string;
  recommended?: boolean;
}

export interface PaymentProviderSpec {
  id: string;
  name: string;
  nameTh: string;
  /** Short bank/wallet mark rendered as an avatar. */
  mark: string;
  /** Tailwind class describing the provider's brand colour. */
  swatch: string;
  deepLink?: string;
}

export interface Passenger {
  title: "MR" | "MS" | "MRS";
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  /** Thai national ID / passport — carried for DCA manifest compliance. */
  nationalId: string;
}

export type PaymentIntentStatus = "PENDING" | "PAID" | "EXPIRED";

export interface PaymentIntent {
  ref: string;
  method: PaymentMethodId;
  amount: number;
  currency: "THB";
  status: PaymentIntentStatus;
  createdAt: string;
  expiresAt: string;
  /** Raw EMVCo payload, present for PromptPay intents only. */
  qrPayload?: string;
  /** PNG data URL of the payload above. */
  qrDataUrl?: string;
  merchant: MerchantIdentity;
}

export interface MerchantIdentity {
  legalName: string;
  legalNameTh: string;
  /** Mock 13-digit Thai corporate tax ID used as the PromptPay merchant key. */
  taxId: string;
  merchantId: string;
  acquirer: string;
  settlementBank: string;
  settlementCurrency: "THB";
}

export interface CommitBookingRequest {
  flightId: string;
  brand: FareBrand;
  passengers: Passenger[];
  quote: FareQuote;
  payment: {
    ref: string;
    method: PaymentMethodId;
    provider?: string;
    amount: number;
  };
}

export interface CommitBookingResponse {
  pnr: string;
  status: "CONFIRMED";
  bookingKey: string;
  issuedAt: string;
  tickets: ETicket[];
  flight: FlightOption;
  quote: FareQuote;
  settlement: {
    entity: string;
    entityTh: string;
    currency: "THB";
    amount: number;
    merchantId: string;
    acquirer: string;
    valueDate: string;
    crossBorder: false;
  };
  pss: {
    endpoint: string;
    system: string;
    correlationId: string;
    latencyMs: number;
    signals: PssSignal[];
  };
}

export interface ETicket {
  passengerName: string;
  ticketNumber: string;
  seat: string;
  baggageKg: number;
  fareBasis: string;
}

export interface PssSignal {
  step: string;
  label: string;
  labelTh: string;
  ms: number;
}
