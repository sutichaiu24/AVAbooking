import { getSector } from "./network";
import type { AirportCode, FlightOption, SearchQuery } from "./types";

/**
 * Deterministic mock inventory.
 *
 * A real deployment would proxy Navitaire's availability service here. For the
 * PoC the schedule is derived from a seeded PRNG so that the same query always
 * returns the same flights — which keeps server-rendered and client-rendered
 * markup identical and makes the demo reproducible.
 */

/** xorshift32 — small, fast, and stable across runtimes. */
function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const AIRCRAFT = ["Airbus A320-200", "Airbus A320neo", "Airbus A321neo"];

/** Departure slots, in minutes past midnight, spread across the operating day. */
const SLOTS = [6 * 60 + 15, 8 * 60 + 40, 10 * 60 + 55, 13 * 60 + 20, 16 * 60 + 5, 19 * 60 + 30];

function toLocalIso(date: string, minutesPastMidnight: number): string {
  const dayOffset = Math.floor(minutesPastMidnight / (24 * 60));
  const withinDay = minutesPastMidnight % (24 * 60);
  const h = Math.floor(withinDay / 60);
  const m = withinDay % 60;

  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayOffset);

  const stamp = d.toISOString().slice(0, 10);
  return `${stamp}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00+07:00`;
}

export function searchFlights(query: SearchQuery): FlightOption[] {
  const { origin, destination, departDate } = query;
  const sector = getSector(origin, destination);
  const random = seededRandom(hashString(`${origin}${destination}${departDate}`));

  const count = sector.frequency;

  return SLOTS.slice(0, count).map((slot, index) => {
    // Jitter the published slot by up to ±20 minutes so the schedule reads
    // like a real timetable rather than a fixed grid.
    const departMinutes = slot + Math.round((random() - 0.5) * 40);
    const durationMin = sector.blockMin + Math.round((random() - 0.5) * 10);

    // Early-morning and late-evening departures price below the midday peak.
    const peakFactor = index === 0 || index === count - 1 ? 0.86 : 1 + random() * 0.34;
    const baseFare = Math.round((sector.leadInFare * peakFactor) / 10) * 10;

    return {
      id: `FD${1000 + index * 7}-${departDate}-${origin}${destination}`,
      flightNo: `FD ${flightNumberFor(origin, destination, index)}`,
      origin,
      destination,
      departAt: toLocalIso(departDate, departMinutes),
      arriveAt: toLocalIso(departDate, departMinutes + durationMin),
      durationMin,
      aircraft: AIRCRAFT[Math.floor(random() * AIRCRAFT.length)],
      seatsLeft: 3 + Math.floor(random() * 26),
      baseFare,
    };
  });
}

/** Stable, plausible FD flight numbers keyed off the sector. */
function flightNumberFor(origin: AirportCode, destination: AirportCode, index: number): number {
  const bases: Record<string, number> = {
    "DMK-CNX": 3100,
    "CNX-DMK": 3101,
    "DMK-HKT": 3000,
    "HKT-DMK": 3001,
    "DMK-HDY": 3100,
    "HDY-DMK": 3101,
    "DMK-CEI": 3200,
    "CEI-DMK": 3201,
    "DMK-UTH": 3350,
    "UTH-DMK": 3351,
  };
  const base = bases[`${origin}-${destination}`] ?? 3400;
  return base + index * 2;
}
