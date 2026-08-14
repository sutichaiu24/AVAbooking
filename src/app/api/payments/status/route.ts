import { NextResponse } from "next/server";

import { readIntent, secondsRemaining } from "@/lib/intent-store";

export const dynamic = "force-dynamic";

/**
 * Polled by the checkout while a QR is on screen.
 *
 * Production would replace this with the acquirer's webhook plus a
 * server-sent-events channel; polling keeps the PoC dependency-free while
 * still driving the transition from real server-side state.
 */
export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "MISSING_REF" }, { status: 400 });
  }

  const intent = readIntent(ref);
  if (!intent) {
    return NextResponse.json({ error: "UNKNOWN_REF" }, { status: 404 });
  }

  return NextResponse.json({
    ref: intent.ref,
    status: intent.status,
    amount: intent.amount,
    currency: intent.currency,
    secondsRemaining: secondsRemaining(intent),
  });
}
