import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { INTENT_TTL_MS, newReference, putIntent } from "@/lib/intent-store";
import { MERCHANT } from "@/lib/network";
import { buildPromptPayPayload } from "@/lib/promptpay";
import type { PaymentIntent } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Creates a dynamic PromptPay intent: a fixed-amount, single-use EMVCo payload
 * keyed to the Thai AirAsia merchant tax ID, rendered as a scannable PNG.
 */
export async function POST(request: Request) {
  let body: { amount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
  }

  const ref = newReference("FD");
  const now = Date.now();

  const qrPayload = buildPromptPayPayload({
    target: MERCHANT.taxId,
    amount,
    merchantName: "THAI AIRASIA",
    merchantCity: "BANGKOK",
    reference: ref,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    color: { dark: "#4A0000", light: "#FFFFFF" },
  });

  const intent: PaymentIntent = {
    ref,
    method: "promptpay",
    amount,
    currency: "THB",
    status: "PENDING",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INTENT_TTL_MS).toISOString(),
    qrPayload,
    qrDataUrl,
    merchant: MERCHANT,
  };

  putIntent(intent);

  return NextResponse.json(intent, { status: 201 });
}
