import { NextResponse } from "next/server";

import { INTENT_TTL_MS, newReference, putIntent, markPaid } from "@/lib/intent-store";
import { MERCHANT } from "@/lib/network";
import { findMethod, findProvider } from "@/lib/payments";
import type { PaymentIntent, PaymentMethodId } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Authorises the non-QR rails — mobile-banking deep links, domestic card
 * processing under the local merchant ID, and e-wallet balances.
 *
 * All three resolve synchronously here. A real integration would return a
 * redirect URL (banking apps, wallet apps) or a 3-D Secure challenge (cards)
 * and settle asynchronously.
 */
export async function POST(request: Request) {
  let body: { method?: PaymentMethodId; provider?: string; amount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const method = body.method;
  if (!method || !findMethod(method)) {
    return NextResponse.json({ error: "UNSUPPORTED_METHOD" }, { status: 400 });
  }
  if (method === "promptpay") {
    return NextResponse.json({ error: "USE_PROMPTPAY_INTENT" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "INVALID_AMOUNT" }, { status: 400 });
  }

  if ((method === "mobile_banking" || method === "ewallet") && !findProvider(body.provider ?? "")) {
    return NextResponse.json({ error: "UNKNOWN_PROVIDER" }, { status: 400 });
  }

  // Stand in for the acquirer authorisation round-trip.
  await new Promise((resolve) => setTimeout(resolve, 1_400));

  const ref = newReference("FD");
  const now = Date.now();

  const intent: PaymentIntent = {
    ref,
    method,
    amount,
    currency: "THB",
    status: "PENDING",
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INTENT_TTL_MS).toISOString(),
    merchant: MERCHANT,
  };

  putIntent(intent);
  const authorised = markPaid(ref) ?? intent;

  return NextResponse.json(
    {
      ...authorised,
      provider: body.provider ?? null,
      authCode: newReference("A"),
      /** Domestic acquiring — the flag the finance team cares about. */
      crossBorder: false,
    },
    { status: 201 },
  );
}
