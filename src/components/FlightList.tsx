"use client";

import { Check } from "lucide-react";

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
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-aa-border pb-4">
        <h2 className="text-[28px] font-light tracking-tight">
          {AIRPORTS[query.origin].cityTh}
          <span className="mx-3 text-aa-muted">—</span>
          {AIRPORTS[query.destination].cityTh}
        </h2>
        <p className="text-[15px] font-light text-aa-muted">
          {flights.length} เที่ยวบิน · ตอบกลับใน {result.latencyMs} มิลลิวินาที
        </p>
      </div>

      <ul>
        {flights.map((flight) => (
          <FlightRow
            key={flight.id}
            flight={flight}
            pax={query.pax}
            selectedBrand={selectedFlightId === flight.id ? selectedBrand : null}
            onSelect={(brand) => onSelect(flight, brand)}
          />
        ))}
      </ul>
    </section>
  );
}

function FlightRow({
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
  return (
    <li className="border-b border-aa-border">
      <div className="grid items-center gap-x-10 gap-y-6 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Schedule */}
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-[15px] font-bold tracking-wider text-aa-red">
              {flight.flightNo}
            </span>
            <span className="text-[15px] font-light text-aa-muted">{flight.aircraft}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-5">
            <div>
              <p className="text-[32px] font-light tabular leading-none tracking-tight">
                {clockTime(flight.departAt)}
              </p>
              <p className="mt-2 text-[15px] font-medium tracking-wider text-aa-muted">
                {flight.origin}
              </p>
            </div>

            <div className="flex-1 pb-1">
              <p className="text-center text-[13px] font-light tracking-wide text-aa-muted">
                {durationTh(flight.durationMin)}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="h-px flex-1 bg-aa-rule" />
                <span className="h-1 w-1 rounded-full bg-aa-red" />
              </div>
              <p className="mt-1.5 text-center text-[13px] font-light text-aa-muted">บินตรง</p>
            </div>

            <div>
              <p className="text-[32px] font-light tabular leading-none tracking-tight">
                {clockTime(flight.arriveAt)}
              </p>
              <p className="mt-2 text-[15px] font-medium tracking-wider text-aa-muted">
                {flight.destination}
              </p>
            </div>
          </div>

          {flight.seatsLeft <= 12 && (
            <p className="mt-4 text-[13px] font-bold uppercase tracking-wider text-aa-red">
              เหลือ {flight.seatsLeft} ที่นั่ง
            </p>
          )}
        </div>

        {/* Fares */}
        <div className="grid gap-px bg-aa-border sm:grid-cols-2">
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
                  "group relative flex h-full flex-col justify-between gap-5 p-5 text-left transition-colors",
                  active ? "bg-aa-ink text-white" : "bg-aa-paper hover:bg-aa-tint",
                ].join(" ")}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={[
                        "text-[15px] font-bold uppercase tracking-wider",
                        active ? "text-white" : "text-aa-ink",
                      ].join(" ")}
                    >
                      {brand.name}
                    </p>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-aa-red" aria-hidden />}
                  </div>
                  <p
                    className={[
                      "mt-1.5 text-[15px] font-light",
                      active ? "text-white/55" : "text-aa-muted",
                    ].join(" ")}
                  >
                    สัมภาระ {brand.baggageKg} กก. ·{" "}
                    {brand.changeable ? "เปลี่ยนเที่ยวบินได้" : "เปลี่ยนแปลงไม่ได้"}
                  </p>
                </div>

                <div>
                  <p
                    className={[
                      "text-[12px] font-bold uppercase tracking-widest",
                      active ? "text-white/40" : "text-aa-muted",
                    ].join(" ")}
                  >
                    รวม {pax} ท่าน
                  </p>
                  <p className="mt-1 text-[34px] font-light tabular leading-none tracking-tight">
                    {thb(quote.total)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedBrand && (
        <div className="animate-aa-rise border-t border-aa-border bg-aa-tint px-5 py-4">
          <p className="aa-eyebrow">รวมอยู่ใน {FARE_BRANDS[selectedBrand].name}</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-7 gap-y-1.5">
            {FARE_BRANDS[selectedBrand].inclusions.map((item) => (
              <li key={item} className="text-[15px] font-light text-aa-graphite">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
