"use client";

import { Check, Luggage, Plane, RefreshCw, Sparkles, Clock } from "lucide-react";

import { clockTime, durationTh, thb } from "@/lib/format";
import { AIRPORTS, FARE_BRAND_LIST, FARE_BRANDS } from "@/lib/network";
import { buildQuote } from "@/lib/pricing";
import type { FareBrand, FlightOption, SearchResponse } from "@/lib/types";

interface Props {
  result: SearchResponse;
  selectedFlightId: string | null;
  selectedBrand: FareBrand | null;
  onSelect: (flight: FlightOption, brand: FareBrand) => void;
}

export function FlightList({ result, selectedFlightId, selectedBrand, onSelect }: Props) {
  const { flights, query } = result;

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">
          เที่ยวบิน {AIRPORTS[query.origin].cityTh} → {AIRPORTS[query.destination].cityTh}
        </h2>
        <p className="text-xs text-aa-muted">
          พบ {flights.length} เที่ยวบิน · ตอบกลับจากระบบสำรองที่นั่งใน {result.latencyMs} มิลลิวินาที
        </p>
      </header>

      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          pax={query.pax}
          selectedBrand={selectedFlightId === flight.id ? selectedBrand : null}
          onSelect={(brand) => onSelect(flight, brand)}
        />
      ))}
    </section>
  );
}

function FlightCard({
  flight,
  pax,
  selectedBrand,
  onSelect,
}: {
  flight: FlightOption;
  pax: number;
  selectedBrand: FareBrand | null;
  onSelect: (brand: FareBrand) => void;
}) {
  const isSelected = selectedBrand !== null;

  return (
    <article
      className={[
        "aa-card overflow-hidden transition",
        isSelected ? "border-aa-red ring-2 ring-aa-red/20" : "",
      ].join(" ")}
    >
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-aa-muted">
            <span className="rounded-md bg-aa-tint px-2 py-0.5 font-bold text-aa-crimson">
              {flight.flightNo}
            </span>
            <span>{flight.aircraft}</span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold tabular leading-none">
                {clockTime(flight.departAt)}
              </p>
              <p className="mt-1 text-xs font-semibold text-aa-muted">{flight.origin}</p>
            </div>

            <div className="flex flex-1 flex-col items-center">
              <p className="flex items-center gap-1 text-[11px] text-aa-muted">
                <Clock className="h-3 w-3" aria-hidden />
                {durationTh(flight.durationMin)}
              </p>
              <div className="relative my-1 h-px w-full bg-aa-border">
                <Plane
                  className="absolute -top-2 right-0 h-4 w-4 -rotate-45 text-aa-red"
                  aria-hidden
                />
              </div>
              <p className="text-[11px] text-aa-muted">บินตรง</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-extrabold tabular leading-none">
                {clockTime(flight.arriveAt)}
              </p>
              <p className="mt-1 text-xs font-semibold text-aa-muted">{flight.destination}</p>
            </div>
          </div>

          {flight.seatsLeft <= 12 && (
            <p className="mt-3 inline-flex rounded-md bg-aa-red/10 px-2 py-1 text-[11px] font-bold text-aa-crimson">
              เหลือ {flight.seatsLeft} ที่นั่งในราคานี้
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FARE_BRAND_LIST.map((brand) => {
            const quote = buildQuote({
              baseFare: flight.baseFare,
              brand: brand.id,
              pax,
              origin: flight.origin,
            });
            const active = selectedBrand === brand.id;

            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => onSelect(brand.id)}
                aria-pressed={active}
                className={[
                  "group flex h-full flex-col rounded-xl border p-4 text-left transition",
                  active
                    ? "border-aa-red bg-aa-tint shadow-aa-card"
                    : "border-aa-border bg-white hover:border-aa-red/60 hover:bg-aa-tint/60",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-aa-crimson">
                      {brand.id === "PREMIUM_FLEX" && (
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {brand.name}
                    </p>
                    <p className="text-[11px] text-aa-muted">{brand.nameTh}</p>
                  </div>
                  {active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aa-red text-white">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </div>

                <ul className="mt-3 flex-1 space-y-1 text-[11px] text-aa-muted">
                  <li className="flex items-center gap-1.5">
                    <Luggage className="h-3 w-3 shrink-0" aria-hidden />
                    สัมภาระ {brand.baggageKg} กก.
                  </li>
                  <li className="flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 shrink-0" aria-hidden />
                    {brand.changeable ? "เปลี่ยนเที่ยวบินได้" : "เปลี่ยนแปลงไม่ได้"}
                  </li>
                </ul>

                <div className="mt-3 border-t border-aa-border pt-3">
                  <p className="text-[10px] uppercase tracking-wide text-aa-muted">
                    รวม {pax} ท่าน (รวมภาษี)
                  </p>
                  <p className="text-xl font-extrabold tabular text-aa-ink">{thb(quote.total)}</p>
                  <p className="text-[10px] text-aa-muted">
                    {thb(quote.total / pax)} ต่อท่าน
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isSelected && selectedBrand && (
        <div className="border-t border-aa-border bg-aa-tint/60 px-5 py-3">
          <p className="text-[11px] font-semibold text-aa-crimson">
            สิทธิประโยชน์ที่รวมอยู่ใน {FARE_BRANDS[selectedBrand].name}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {FARE_BRANDS[selectedBrand].inclusions.map((item) => (
              <li key={item} className="flex items-center gap-1 text-[11px] text-aa-muted">
                <Check className="h-3 w-3 shrink-0 text-aa-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
