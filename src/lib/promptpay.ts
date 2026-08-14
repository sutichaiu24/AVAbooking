/**
 * PromptPay dynamic QR generation, following the EMVCo Merchant-Presented
 * QR specification as profiled by the Bank of Thailand.
 *
 * The payload is a flat sequence of `IILLVV…` triplets: a two-digit tag ID, a
 * two-digit length, then that many characters of value. Tag 29 nests the same
 * structure to carry the PromptPay account key, and tag 63 closes the payload
 * with a CRC-16/CCITT-FALSE checksum over everything that precedes it.
 */

const ID_PAYLOAD_FORMAT = "00";
const ID_POI_METHOD = "01";
const ID_MERCHANT_PROMPTPAY = "29";
const ID_CURRENCY = "53";
const ID_AMOUNT = "54";
const ID_COUNTRY = "58";
const ID_MERCHANT_NAME = "59";
const ID_MERCHANT_CITY = "60";
const ID_ADDITIONAL_DATA = "62";
const ID_CRC = "63";

const PROMPTPAY_AID = "A000000677010111";
const CURRENCY_THB = "764";
const COUNTRY_TH = "TH";

/** One-time (dynamic) QR — the amount is fixed and the code is single-use. */
const POI_DYNAMIC = "12";

/** Encodes a single `IILLVV` field. */
function field(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

/**
 * CRC-16/CCITT-FALSE: polynomial 0x1021, initial value 0xFFFF, no reflection,
 * no final XOR. Returned as four uppercase hex digits.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Strips formatting and classifies the PromptPay account key. */
function encodeTarget(target: string): string {
  const digits = target.replace(/\D/g, "");

  // 13 digits — corporate tax ID / national ID, carried under sub-tag 02.
  if (digits.length === 13) {
    return field("02", digits);
  }

  // 15 digits — e-wallet ID, sub-tag 03.
  if (digits.length === 15) {
    return field("03", digits);
  }

  // Otherwise a mobile number, normalised to E.164 without the '+', sub-tag 01.
  const msisdn = `0066${digits.replace(/^0/, "")}`.padStart(13, "0");
  return field("01", msisdn);
}

export interface PromptPayPayloadInput {
  /** Mobile number, 13-digit tax/national ID, or 15-digit e-wallet ID. */
  target: string;
  /** Amount in THB. Omit for a static, amount-less QR. */
  amount?: number;
  merchantName?: string;
  merchantCity?: string;
  /** Merchant reference echoed back by the acquirer on settlement. */
  reference?: string;
}

/**
 * Builds the full EMVCo payload string that a Thai banking app will parse
 * when the passenger scans the code.
 */
export function buildPromptPayPayload(input: PromptPayPayloadInput): string {
  const {
    target,
    amount,
    merchantName = "THAI AIRASIA",
    merchantCity = "BANGKOK",
    reference,
  } = input;

  const parts: string[] = [
    field(ID_PAYLOAD_FORMAT, "01"),
    field(ID_POI_METHOD, POI_DYNAMIC),
    field(ID_MERCHANT_PROMPTPAY, field("00", PROMPTPAY_AID) + encodeTarget(target)),
    field(ID_CURRENCY, CURRENCY_THB),
  ];

  if (typeof amount === "number") {
    parts.push(field(ID_AMOUNT, amount.toFixed(2)));
  }

  parts.push(
    field(ID_COUNTRY, COUNTRY_TH),
    // Merchant name and city must be printable ASCII, uppercased by convention.
    field(ID_MERCHANT_NAME, sanitize(merchantName, 25)),
    field(ID_MERCHANT_CITY, sanitize(merchantCity, 15)),
  );

  if (reference) {
    // Sub-tag 01 of the additional-data template is the bill/reference number.
    parts.push(field(ID_ADDITIONAL_DATA, field("01", sanitize(reference, 25))));
  }

  // The CRC is computed over the payload *including* the "6304" header.
  const withoutChecksum = `${parts.join("")}${ID_CRC}04`;
  return `${withoutChecksum}${crc16(withoutChecksum)}`;
}

/** Restricts a value to the printable ASCII the spec allows, then truncates. */
function sanitize(value: string, maxLength: number): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9 .\-]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Verifies a payload's trailing checksum — used by the route handler's tests. */
export function isValidPayload(payload: string): boolean {
  if (payload.length < 8) return false;
  const body = payload.slice(0, -4);
  const checksum = payload.slice(-4);
  return crc16(body) === checksum.toUpperCase();
}
