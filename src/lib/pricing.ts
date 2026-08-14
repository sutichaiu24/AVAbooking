import { AIRPORTS, FARE_BRANDS } from "./network";
import type { AirportCode, FareBrand, FareQuote, LocalSettlementSavings } from "./types";

/** Thai VAT rate applied to domestic air transport. */
export const VAT_RATE = 0.07;

/** Booking / convenience fee retained by the local entity, per passenger. */
export const ADMIN_FEE_PER_PAX = 60;

/**
 * Surcharge a Thai issuer adds when the acquiring merchant sits outside
 * Thailand. Eliminated entirely once settlement moves onshore.
 */
export const CROSS_BORDER_FEE_RATE = 0.01;

/**
 * Typical issuer FX / dynamic-currency-conversion markup applied when a
 * Thai cardholder is billed in a non-THB currency. Also eliminated onshore.
 */
export const FX_MARKUP_RATE = 0.025;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Builds the itemised THB quote shown to the passenger.
 *
 * Airport tax is the departure PSC, charged per passenger. VAT is levied on
 * the fare plus the admin fee; the PSC is collected on behalf of the airport
 * operator and is not part of the VAT-bearing base.
 */
export function buildQuote(params: {
  baseFare: number;
  brand: FareBrand;
  pax: number;
  origin: AirportCode;
}): FareQuote {
  const { baseFare, brand, pax, origin } = params;

  const baseFarePerPax = Math.round(baseFare * FARE_BRANDS[brand].multiplier);
  const baseFareTotal = baseFarePerPax * pax;
  const airportTax = AIRPORTS[origin].psc * pax;
  const adminFee = ADMIN_FEE_PER_PAX * pax;

  const netSubtotal = baseFareTotal + adminFee;
  const vat = round2(netSubtotal * VAT_RATE);
  const total = round2(netSubtotal + vat + airportTax);

  return {
    pax,
    brand,
    baseFarePerPax,
    baseFareTotal,
    airportTax,
    adminFee,
    netSubtotal,
    vatRate: VAT_RATE,
    vat,
    total,
    savings: computeSavings(total),
  };
}

/**
 * What the passenger keeps by transacting with the Thai merchant entity.
 * Both components are charged by the *issuer*, not the airline, so they never
 * appear on the fare breakdown — they surface later on the card statement.
 */
export function computeSavings(total: number): LocalSettlementSavings {
  const crossBorderFee = round2(total * CROSS_BORDER_FEE_RATE);
  const fxMarkup = round2(total * FX_MARKUP_RATE);
  return {
    crossBorderFee,
    fxMarkup,
    total: round2(crossBorderFee + fxMarkup),
  };
}
