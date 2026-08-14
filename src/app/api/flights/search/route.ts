import { NextResponse } from "next/server";

import { searchFlights } from "@/lib/inventory";
import { AIRPORTS } from "@/lib/network";
import type { AirportCode, SearchQuery, SearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * BFF availability endpoint.
 *
 * In production this proxies Navitaire's `GetAvailability` service and folds
 * the response into the local presentation model. Here it reads from the
 * deterministic mock inventory.
 */
export async function POST(request: Request) {
  let body: Partial<SearchQuery>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const query = body as SearchQuery;
  const startedAt = Date.now();

  // Mimic the round-trip latency of the upstream PSS call.
  await new Promise((resolve) => setTimeout(resolve, 480));

  const payload: SearchResponse = {
    query,
    currency: "THB",
    flights: searchFlights(query),
    latencyMs: Date.now() - startedAt,
  };

  return NextResponse.json(payload);
}

function validate(body: Partial<SearchQuery>): string | null {
  const codes = Object.keys(AIRPORTS) as AirportCode[];

  if (!body.origin || !codes.includes(body.origin)) return "INVALID_ORIGIN";
  if (!body.destination || !codes.includes(body.destination)) return "INVALID_DESTINATION";
  if (body.origin === body.destination) return "SAME_ORIGIN_DESTINATION";
  if (!body.departDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.departDate)) return "INVALID_DATE";
  if (!body.pax || body.pax < 1 || body.pax > 9) return "INVALID_PAX";

  return null;
}
