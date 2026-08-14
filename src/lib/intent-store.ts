import type { PaymentIntent, PaymentIntentStatus } from "./types";

/**
 * In-memory payment-intent store.
 *
 * Stands in for the acquirer's intent ledger. Because it lives in module scope
 * it is per-process and non-durable — fine for a PoC, and it means the QR
 * status endpoint can model a genuine server-side state transition rather than
 * faking the confirmation in the browser.
 */

const store = new Map<string, PaymentIntent>();

/**
 * How long after creation the mock acquirer reports the funds as received.
 * Real PromptPay settlement notifications land within a few seconds of the
 * payer confirming in their banking app.
 */
const SETTLEMENT_DELAY_MS = 9_000;

/** Dynamic PromptPay QR codes are valid for five minutes. */
export const INTENT_TTL_MS = 5 * 60 * 1000;

export function putIntent(intent: PaymentIntent): void {
  store.set(intent.ref, intent);
  scheduleEviction(intent.ref);
}

/**
 * Reads an intent and advances its status based on elapsed time:
 * PENDING → PAID once the mock acquirer callback would have fired,
 * PENDING → EXPIRED once the five-minute window closes.
 */
export function readIntent(ref: string): PaymentIntent | undefined {
  const intent = store.get(ref);
  if (!intent) return undefined;
  if (intent.status !== "PENDING") return intent;

  const now = Date.now();
  const createdAt = Date.parse(intent.createdAt);
  const expiresAt = Date.parse(intent.expiresAt);

  let status: PaymentIntentStatus = "PENDING";
  if (now - createdAt >= SETTLEMENT_DELAY_MS) {
    status = "PAID";
  } else if (now >= expiresAt) {
    status = "EXPIRED";
  }

  if (status !== intent.status) {
    const updated = { ...intent, status };
    store.set(ref, updated);
    return updated;
  }
  return intent;
}

/** Forces an intent to PAID — used by the non-QR rails once they authorise. */
export function markPaid(ref: string): PaymentIntent | undefined {
  const intent = store.get(ref);
  if (!intent) return undefined;
  const updated: PaymentIntent = { ...intent, status: "PAID" };
  store.set(ref, updated);
  return updated;
}

/** Seconds remaining before the QR expires, floored at zero. */
export function secondsRemaining(intent: PaymentIntent): number {
  return Math.max(0, Math.floor((Date.parse(intent.expiresAt) - Date.now()) / 1000));
}

function scheduleEviction(ref: string): void {
  const timer = setTimeout(() => store.delete(ref), INTENT_TTL_MS * 2);
  // Never hold the process open for a mock ledger entry.
  if (typeof timer.unref === "function") timer.unref();
}

/** `FDQR8K2M4X` — human-readable reference printed under the QR. */
export function newReference(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}${suffix}`;
}
