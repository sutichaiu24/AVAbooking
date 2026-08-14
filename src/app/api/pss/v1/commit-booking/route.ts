import { NextResponse } from "next/server";

import { readIntent } from "@/lib/intent-store";
import { searchFlights } from "@/lib/inventory";
import { FARE_BRANDS, MERCHANT } from "@/lib/network";
import type {
  CommitBookingRequest,
  CommitBookingResponse,
  ETicket,
  PssSignal,
} from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Commits the locally-paid booking back to HQ's Navitaire PSS.
 *
 * This is the hand-off that makes the whole model work: money settles in
 * Thailand, but the booking, inventory decrement and e-ticket issuance still
 * happen in the group reservation system, so nothing downstream changes.
 */
export async function POST(request: Request) {
  let body: Partial<CommitBookingRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { flightId, brand, passengers, quote, payment } = body;

  if (!flightId || !brand || !quote || !payment?.ref) {
    return NextResponse.json({ error: "INCOMPLETE_PAYLOAD" }, { status: 400 });
  }
  if (!passengers?.length) {
    return NextResponse.json({ error: "NO_PASSENGERS" }, { status: 400 });
  }

  // A booking is only committed once the local rail has actually settled.
  const intent = readIntent(payment.ref);
  if (!intent) {
    return NextResponse.json({ error: "UNKNOWN_PAYMENT_REF" }, { status: 404 });
  }
  if (intent.status !== "PAID") {
    return NextResponse.json(
      { error: "PAYMENT_NOT_SETTLED", status: intent.status },
      { status: 409 },
    );
  }

  const flight = resolveFlight(flightId);
  if (!flight) {
    return NextResponse.json({ error: "UNKNOWN_FLIGHT" }, { status: 404 });
  }

  const startedAt = Date.now();
  const signals = await runPssHandshake();

  const pnr = generatePnr();
  const tickets: ETicket[] = passengers.map((passenger, index) => ({
    passengerName: `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.toUpperCase(),
    ticketNumber: `${ticketStock()}-${(4_100_000 + index).toString()}`,
    seat: seatFor(index, brand === "PREMIUM_FLEX"),
    baggageKg: FARE_BRANDS[brand].baggageKg,
    fareBasis: brand === "PREMIUM_FLEX" ? "YFLEXTH" : "QVALTH",
  }));

  const response: CommitBookingResponse = {
    pnr,
    status: "CONFIRMED",
    bookingKey: `NAV-${pnr}-${Date.now().toString(36).toUpperCase()}`,
    issuedAt: new Date().toISOString(),
    tickets,
    flight,
    quote,
    settlement: {
      entity: MERCHANT.legalName,
      entityTh: MERCHANT.legalNameTh,
      currency: "THB",
      amount: quote.total,
      merchantId: MERCHANT.merchantId,
      acquirer: MERCHANT.acquirer,
      valueDate: new Date().toISOString().slice(0, 10),
      crossBorder: false,
    },
    pss: {
      endpoint: "/api/pss/v1/commit-booking",
      system: "Navitaire New Skies (mock)",
      correlationId: `COR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      latencyMs: Date.now() - startedAt,
      signals,
    },
  };

  return NextResponse.json(response, { status: 201 });
}

/**
 * Walks the four upstream calls a real commit would make, so the confirmation
 * modal can replay them as a live progress trace.
 */
async function runPssHandshake(): Promise<PssSignal[]> {
  const steps: Array<Omit<PssSignal, "ms">> = [
    {
      step: "session.open",
      label: "Authenticating with Navitaire session service",
      labelTh: "เชื่อมต่อระบบสำรองที่นั่งส่วนกลาง",
    },
    {
      step: "booking.sell",
      label: "Selling journey and decrementing inventory",
      labelTh: "จองที่นั่งและตัดจำนวนที่นั่งคงเหลือ",
    },
    {
      step: "payment.attach",
      label: "Attaching THB local settlement token",
      labelTh: "แนบโทเคนการชำระเงินสกุลบาทจากผู้รับชำระในประเทศ",
    },
    {
      step: "booking.commit",
      label: "Committing PNR and issuing e-tickets",
      labelTh: "ยืนยันรหัสการจองและออกบัตรโดยสารอิเล็กทรอนิกส์",
    },
  ];

  const signals: PssSignal[] = [];
  for (const step of steps) {
    const startedAt = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 220 + Math.random() * 260));
    signals.push({ ...step, ms: Date.now() - startedAt });
  }
  return signals;
}

/** Re-derives the flight from the deterministic inventory using its ID. */
function resolveFlight(flightId: string) {
  const match = /^FD\d+-(\d{4}-\d{2}-\d{2})-([A-Z]{3})([A-Z]{3})$/.exec(flightId);
  if (!match) return null;

  const [, departDate, origin, destination] = match;
  const flights = searchFlights({
    origin: origin as never,
    destination: destination as never,
    departDate,
    pax: 1,
  });
  return flights.find((flight) => flight.id === flightId) ?? null;
}

/** Six-character PNR in the airline's `FD-XXXXXX` presentation format. */
function generatePnr(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FD-${code}`;
}

/** IATA ticket stock: 377 is the AirAsia group's numeric airline code. */
function ticketStock(): string {
  return "377";
}

function seatFor(index: number, premium: boolean): string {
  const row = (premium ? 1 : 14) + Math.floor(index / 6);
  const letter = "ABCDEF"[index % 6];
  return `${row}${letter}`;
}
