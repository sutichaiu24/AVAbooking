import { clockTime, thaiDate } from "./format";
import { AIRPORTS, FARE_BRANDS, MERCHANT } from "./network";
import type { CommitBookingResponse } from "./types";

/**
 * Minimal PDF writer for the e-ticket download.
 *
 * Rather than pull in a rendering library for one document, this emits a
 * hand-built single-page PDF using the base-14 Helvetica fonts, which every
 * reader has built in. Content is restricted to WinAnsi (Latin-1) characters —
 * embedding a Thai typeface would require a full font subsetter, so the
 * document itself is issued in English, as IATA e-tickets normally are.
 */

interface Op {
  ops: string[];
}

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;

export function buildETicketPdf(booking: CommitBookingResponse): Blob {
  const content = drawTicket(booking);
  const pdf = assemblePdf(content);
  return new Blob([pdf], { type: "application/pdf" });
}

/** Triggers a browser download of the generated e-ticket. */
export function downloadETicket(booking: CommitBookingResponse): void {
  const url = URL.createObjectURL(buildETicketPdf(booking));
  const link = document.createElement("a");
  link.href = url;
  link.download = `ThaiAirAsia-eTicket-${booking.pnr}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the download a tick to start before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function drawTicket(booking: CommitBookingResponse): string {
  const { flight, quote, settlement, tickets } = booking;
  const page: Op = { ops: [] };

  const origin = AIRPORTS[flight.origin];
  const destination = AIRPORTS[flight.destination];

  // Crimson header band.
  rect(page, 0, PAGE_HEIGHT - 118, PAGE_WIDTH, 118, [0.6, 0, 0]);
  text(page, MARGIN, PAGE_HEIGHT - 52, "THAI AIRASIA", 22, "F2", [1, 1, 1]);
  text(page, MARGIN, PAGE_HEIGHT - 70, "ELECTRONIC TICKET / ITINERARY RECEIPT", 9, "F1", [
    1, 1, 1,
  ]);
  text(page, MARGIN, PAGE_HEIGHT - 96, MERCHANT.legalName, 8, "F1", [1, 0.8, 0.8]);

  textRight(page, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 52, booking.pnr, 22, "F2", [1, 1, 1]);
  textRight(page, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 70, "BOOKING REFERENCE (PNR)", 8, "F1", [
    1, 0.85, 0.85,
  ]);
  textRight(
    page,
    PAGE_WIDTH - MARGIN,
    PAGE_HEIGHT - 96,
    `ISSUED ${booking.issuedAt.slice(0, 10)}`,
    8,
    "F1",
    [1, 0.8, 0.8],
  );

  let y = PAGE_HEIGHT - 156;

  // Itinerary block.
  sectionTitle(page, y, "ITINERARY");
  y -= 22;

  rect(page, MARGIN, y - 62, PAGE_WIDTH - MARGIN * 2, 74, [0.99, 0.96, 0.96]);

  text(page, MARGIN + 14, y - 2, `${flight.origin}`, 26, "F2", [0.11, 0.11, 0.11]);
  text(page, MARGIN + 14, y - 18, ascii(origin.city), 9, "F1", [0.4, 0.4, 0.4]);
  text(page, MARGIN + 14, y - 34, clockTime(flight.departAt), 13, "F2", [0.6, 0, 0]);
  text(page, MARGIN + 14, y - 48, latinDate(flight.departAt), 8, "F1", [0.4, 0.4, 0.4]);

  text(page, MARGIN + 168, y - 12, "------------>", 12, "F1", [0.8, 0.55, 0.55]);
  text(page, MARGIN + 172, y - 30, flight.flightNo, 11, "F2", [0.11, 0.11, 0.11]);
  text(page, MARGIN + 172, y - 44, ascii(flight.aircraft), 8, "F1", [0.4, 0.4, 0.4]);

  text(page, MARGIN + 320, y - 2, `${flight.destination}`, 26, "F2", [0.11, 0.11, 0.11]);
  text(page, MARGIN + 320, y - 18, ascii(destination.city), 9, "F1", [0.4, 0.4, 0.4]);
  text(page, MARGIN + 320, y - 34, clockTime(flight.arriveAt), 13, "F2", [0.6, 0, 0]);
  text(page, MARGIN + 320, y - 48, latinDate(flight.arriveAt), 8, "F1", [0.4, 0.4, 0.4]);

  y -= 92;

  // Passenger and ticket table.
  sectionTitle(page, y, "PASSENGERS");
  y -= 20;

  const columns = [MARGIN, MARGIN + 230, MARGIN + 340, MARGIN + 410];
  tableHeader(page, y, columns, ["PASSENGER NAME", "TICKET NUMBER", "SEAT", "BAGGAGE"]);
  y -= 15;

  for (const ticket of tickets) {
    text(page, columns[0], y, ascii(ticket.passengerName), 9, "F1", [0.11, 0.11, 0.11]);
    text(page, columns[1], y, ticket.ticketNumber, 9, "F1", [0.11, 0.11, 0.11]);
    text(page, columns[2], y, ticket.seat, 9, "F1", [0.11, 0.11, 0.11]);
    text(page, columns[3], y, `${ticket.baggageKg} KG`, 9, "F1", [0.11, 0.11, 0.11]);
    y -= 15;
  }

  y -= 12;
  text(
    page,
    MARGIN,
    y,
    `FARE FAMILY: ${FARE_BRANDS[quote.brand].name.toUpperCase()}  |  FARE BASIS: ${tickets[0]?.fareBasis ?? "-"}`,
    8,
    "F1",
    [0.4, 0.4, 0.4],
  );

  y -= 30;

  // Fare breakdown.
  sectionTitle(page, y, "FARE BREAKDOWN (THB)");
  y -= 20;

  const money = (n: number) => n.toFixed(2);
  const rows: Array<[string, string]> = [
    [`Air fare (${quote.pax} x ${money(quote.baseFarePerPax)})`, money(quote.baseFareTotal)],
    ["Airport passenger service charge", money(quote.airportTax)],
    ["Booking / convenience fee", money(quote.adminFee)],
    [`VAT ${(quote.vatRate * 100).toFixed(0)}%`, money(quote.vat)],
  ];

  for (const [label, value] of rows) {
    text(page, MARGIN, y, label, 9, "F1", [0.4, 0.4, 0.4]);
    textRight(page, PAGE_WIDTH - MARGIN, y, value, 9, "F1", [0.11, 0.11, 0.11]);
    y -= 15;
  }

  line(page, MARGIN, y + 5, PAGE_WIDTH - MARGIN, y + 5, [0.85, 0.76, 0.76]);
  y -= 8;
  text(page, MARGIN, y, "TOTAL PAID", 11, "F2", [0.11, 0.11, 0.11]);
  textRight(page, PAGE_WIDTH - MARGIN, y, `THB ${money(quote.total)}`, 13, "F2", [0.6, 0, 0]);

  y -= 34;

  // Local settlement block — the commercially important part.
  rect(page, MARGIN, y - 74, PAGE_WIDTH - MARGIN * 2, 84, [0.94, 0.98, 0.96]);
  text(page, MARGIN + 12, y - 4, "LOCAL SETTLEMENT CONFIRMATION", 9, "F2", [0.02, 0.59, 0.41]);

  const settlementRows: Array<[string, string]> = [
    ["Merchant of record", ascii(settlement.entity)],
    ["Merchant ID / acquirer", `${settlement.merchantId}  |  ${ascii(settlement.acquirer)}`],
    ["Billing currency", `${settlement.currency} (no currency conversion applied)`],
    ["Cross-border processing", "NONE - domestic acquiring"],
  ];

  let sy = y - 20;
  for (const [label, value] of settlementRows) {
    text(page, MARGIN + 12, sy, label, 8, "F1", [0.35, 0.45, 0.4]);
    text(page, MARGIN + 165, sy, value, 8, "F2", [0.11, 0.11, 0.11]);
    sy -= 13;
  }

  y -= 96;

  text(
    page,
    MARGIN,
    y,
    `Estimated issuer fees avoided on this booking: THB ${money(quote.savings.total)}`,
    8,
    "F2",
    [0.02, 0.59, 0.41],
  );

  // Footer.
  line(page, MARGIN, 74, PAGE_WIDTH - MARGIN, 74, [0.85, 0.76, 0.76]);
  text(page, MARGIN, 60, `${MERCHANT.legalName}  |  Tax ID ${MERCHANT.taxId}`, 7, "F1", [
    0.4, 0.4, 0.4,
  ]);
  text(
    page,
    MARGIN,
    48,
    "Please present a valid photo ID at check-in. Counters close 45 minutes before departure.",
    7,
    "F1",
    [0.4, 0.4, 0.4],
  );
  text(page, MARGIN, 36, "PROOF OF CONCEPT - NOT A VALID TRAVEL DOCUMENT", 7, "F2", [0.6, 0, 0]);

  return page.ops.join("\n");
}

/* ---------------------------------------------------------------- drawing */

function sectionTitle(page: Op, y: number, label: string) {
  text(page, MARGIN, y, label, 9, "F2", [0.6, 0, 0]);
  line(page, MARGIN, y - 6, PAGE_WIDTH - MARGIN, y - 6, [0.96, 0.76, 0.76]);
}

function tableHeader(page: Op, y: number, columns: number[], labels: string[]) {
  labels.forEach((label, index) => {
    text(page, columns[index], y, label, 7.5, "F2", [0.4, 0.4, 0.4]);
  });
  line(page, MARGIN, y - 5, PAGE_WIDTH - MARGIN, y - 5, [0.9, 0.85, 0.85]);
}

function text(
  page: Op,
  x: number,
  y: number,
  value: string,
  size: number,
  font: "F1" | "F2",
  rgb: [number, number, number],
) {
  page.ops.push(
    `BT /${font} ${size} Tf ${rgb.join(" ")} rg ${round(x)} ${round(y)} Td (${escapeText(value)}) Tj ET`,
  );
}

function textRight(
  page: Op,
  right: number,
  y: number,
  value: string,
  size: number,
  font: "F1" | "F2",
  rgb: [number, number, number],
) {
  // Helvetica averages ~0.5em per character; 0.55 for the bold face.
  const width = value.length * size * (font === "F2" ? 0.55 : 0.5);
  text(page, right - width, y, value, size, font, rgb);
}

function rect(
  page: Op,
  x: number,
  y: number,
  width: number,
  height: number,
  rgb: [number, number, number],
) {
  page.ops.push(`${rgb.join(" ")} rg ${round(x)} ${round(y)} ${round(width)} ${round(height)} re f`);
}

function line(
  page: Op,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rgb: [number, number, number],
) {
  page.ops.push(
    `${rgb.join(" ")} RG 0.6 w ${round(x1)} ${round(y1)} m ${round(x2)} ${round(y2)} l S`,
  );
}

const round = (n: number) => Math.round(n * 100) / 100;

/** PDF string literals escape backslash and both parentheses. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Drops anything outside Latin-1, which the base-14 fonts cannot render. */
function ascii(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").trim();
}

/** `14 AUG 2026` — the format IATA documents use. */
function latinDate(iso: string): string {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d.toString().padStart(2, "0")} ${months[m - 1]} ${y}`;
}

/* ---------------------------------------------------------------- writer */

/**
 * Serialises the object graph with a correct cross-reference table. All
 * content is ASCII, so string length equals byte offset.
 */
function assemblePdf(content: string): string {
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

/** Re-exported for the confirmation modal's on-screen summary line. */
export function itineraryLine(booking: CommitBookingResponse): string {
  const { flight } = booking;
  return `${AIRPORTS[flight.origin].cityTh} → ${AIRPORTS[flight.destination].cityTh} · ${thaiDate(
    flight.departAt,
  )}`;
}
