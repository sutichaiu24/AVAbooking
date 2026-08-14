"use client";

import { ArrowLeftRight, CalendarDays, Loader2, Search, Users } from "lucide-react";
import { useMemo } from "react";

import { addDays, bangkokToday } from "@/lib/format";
import { AIRPORTS, AIRPORT_LIST, ROUTES } from "@/lib/network";
import type { AirportCode, SearchQuery } from "@/lib/types";

interface Props {
  query: SearchQuery;
  onChange: (patch: Partial<SearchQuery>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function SearchPanel({ query, onChange, onSubmit, loading, error }: Props) {
  const today = useMemo(() => bangkokToday(), []);

  // Only offer destinations that the network actually serves from the origin.
  const destinations = useMemo(() => {
    const served = ROUTES.filter((route) => route.origin === query.origin).map(
      (route) => route.destination,
    );
    return AIRPORT_LIST.filter((airport) => served.includes(airport.code));
  }, [query.origin]);

  function swap() {
    onChange({ origin: query.destination, destination: query.origin });
  }

  function selectOrigin(origin: AirportCode) {
    const served = ROUTES.filter((route) => route.origin === origin).map((r) => r.destination);
    // Keep the destination if the new origin still serves it, otherwise fall
    // back to the first sector available.
    const destination = served.includes(query.destination) ? query.destination : served[0];
    onChange({ origin, destination });
  }

  return (
    <section className="aa-card p-5 sm:p-6">
      <h2 className="text-base font-bold">ค้นหาเที่ยวบินภายในประเทศ</h2>
      <p className="mt-1 text-xs text-aa-muted">
        เส้นทางบินตรงจากดอนเมือง (DMK) สู่จุดหมายปลายทางหลักในประเทศไทย
      </p>

      <form
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="aa-label" htmlFor="origin">
            ต้นทาง
          </label>
          <select
            id="origin"
            className="aa-field"
            value={query.origin}
            onChange={(event) => selectOrigin(event.target.value as AirportCode)}
          >
            {AIRPORT_LIST.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.cityTh} ({airport.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={swap}
            aria-label="สลับต้นทางและปลายทาง"
            className="rounded-xl border border-aa-border bg-white p-3 text-aa-crimson transition hover:bg-aa-tint"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div>
          <label className="aa-label" htmlFor="destination">
            ปลายทาง
          </label>
          <select
            id="destination"
            className="aa-field"
            value={query.destination}
            onChange={(event) => onChange({ destination: event.target.value as AirportCode })}
          >
            {destinations.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.cityTh} ({airport.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="aa-label" htmlFor="departDate">
            <CalendarDays className="mr-1 inline h-3 w-3" aria-hidden />
            วันเดินทาง
          </label>
          <input
            id="departDate"
            type="date"
            className="aa-field"
            min={today}
            max={addDays(today, 330)}
            value={query.departDate}
            onChange={(event) => onChange({ departDate: event.target.value })}
          />
        </div>

        <div className="lg:w-32">
          <label className="aa-label" htmlFor="pax">
            <Users className="mr-1 inline h-3 w-3" aria-hidden />
            ผู้โดยสาร
          </label>
          <select
            id="pax"
            className="aa-field"
            value={query.pax}
            onChange={(event) => onChange({ pax: Number(event.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} ท่าน
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-5">
          <button type="submit" className="aa-btn-primary w-full sm:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                กำลังค้นหาที่นั่งว่าง…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" aria-hidden />
                ค้นหาเที่ยวบิน
              </>
            )}
          </button>

          <p className="mt-3 text-[11px] text-aa-muted">
            เส้นทาง {AIRPORTS[query.origin].nameTh} → {AIRPORTS[query.destination].nameTh} · ราคาทั้งหมดแสดงเป็นเงินบาท
            รวมภาษีมูลค่าเพิ่มแล้ว
          </p>

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-aa-red/10 px-4 py-3 text-xs font-semibold text-aa-crimson">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
