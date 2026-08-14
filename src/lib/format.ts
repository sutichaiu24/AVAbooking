/**
 * Formatting helpers. All timestamps in this PoC are handled as *local Bangkok
 * wall-clock* strings so that server-rendered and client-rendered output agree
 * regardless of the runtime's own timezone.
 */

const bahtFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const bahtPreciseFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `฿1,234` — the default presentation for fares and totals. */
export function thb(amount: number): string {
  return `฿${bahtFormatter.format(Math.round(amount))}`;
}

/** `฿1,234.56` — used where satang matter, e.g. the VAT line. */
export function thbPrecise(amount: number): string {
  return `฿${bahtPreciseFormatter.format(amount)}`;
}

/** Extracts `HH:MM` from an ISO string without applying a timezone shift. */
export function clockTime(iso: string): string {
  return iso.slice(11, 16);
}

/** `1 ชม. 20 น.` */
export function durationTh(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} น.`;
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} น.`;
}

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** `14 ส.ค. 2569` — Thai abbreviated month with Buddhist-era year. */
export function thaiDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return `${d} ${TH_MONTHS[m - 1]} ${y + 543}`;
}

/** `mm:ss` countdown rendering. */
export function mmss(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Today's date in Bangkok as `YYYY-MM-DD`. */
export function bangkokToday(): string {
  const now = new Date();
  const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return bangkok.toISOString().slice(0, 10);
}

/** Adds whole days to a `YYYY-MM-DD` string. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
