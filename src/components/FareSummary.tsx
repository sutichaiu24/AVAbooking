"use client";

import { Landmark, ReceiptText, ShieldCheck } from "lucide-react";

import { clockTime, thaiDate, thb, thbPrecise } from "@/lib/format";
import { AIRPORTS, FARE_BRANDS, MERCHANT } from "@/lib/network";
import { CROSS_BORDER_FEE_RATE, FX_MARKUP_RATE } from "@/lib/pricing";
import type { FareQuote, FlightOption } from "@/lib/types";

/**
 * Itemised THB breakdown plus the local-settlement savings callout.
 * Sticks to the viewport on desktop so the total stays visible while the
 * passenger works through payment.
 */
export function FareSummary({ flight, quote }: { flight: FlightOption; quote: FareQuote }) {
  const brand = FARE_BRANDS[quote.brand];

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="aa-card overflow-hidden">
        <div className="bg-aa-hero px-5 py-4 text-white">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60">
            <ReceiptText className="h-3.5 w-3.5" aria-hidden />
            สรุปราคา
          </p>
          <p className="mt-2 text-sm font-bold">
            {AIRPORTS[flight.origin].cityTh} → {AIRPORTS[flight.destination].cityTh}
          </p>
          <p className="text-[11px] text-white/60">
            {flight.flightNo} · {thaiDate(flight.departAt)} · {clockTime(flight.departAt)}–
            {clockTime(flight.arriveAt)}
          </p>
          <p className="mt-2 inline-flex rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold">
            {brand.name} · {quote.pax} ท่าน
          </p>
        </div>

        <dl className="space-y-2.5 px-5 py-4 text-sm">
          <Line
            label={`ค่าโดยสาร (${thb(quote.baseFarePerPax)} × ${quote.pax})`}
            value={thb(quote.baseFareTotal)}
          />
          <Line label={`ค่าธรรมเนียมสนามบิน (PSC)`} value={thb(quote.airportTax)} />
          <Line label="ค่าธรรมเนียมการจอง" value={thb(quote.adminFee)} />
          <Line
            label={`ภาษีมูลค่าเพิ่ม ${(quote.vatRate * 100).toFixed(0)}%`}
            value={thbPrecise(quote.vat)}
          />

          <div className="flex items-baseline justify-between border-t border-aa-border pt-3">
            <dt className="text-sm font-bold">ยอดชำระทั้งสิ้น</dt>
            <dd className="text-2xl font-extrabold tabular text-aa-crimson">{thb(quote.total)}</dd>
          </div>
          <p className="text-[11px] text-aa-muted">
            เรียกเก็บเป็นสกุลเงินบาท (THB) โดย {MERCHANT.legalNameTh}
          </p>
        </dl>

        <SavingsCallout quote={quote} />
      </div>
    </aside>
  );
}

function SavingsCallout({ quote }: { quote: FareQuote }) {
  return (
    <div className="border-t border-aa-success/25 bg-aa-success/5 px-5 py-4">
      <p className="flex items-center gap-2 text-xs font-bold text-aa-success">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        คุณประหยัดได้ {thb(quote.savings.total)} จากการชำระในประเทศ
      </p>

      <dl className="mt-2.5 space-y-1.5 text-[11px]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-aa-muted">
            ค่าธรรมเนียมบัตรข้ามประเทศ {(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}%
          </dt>
          <dd className="tabular font-semibold text-aa-success">
            −{thb(quote.savings.crossBorderFee)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-aa-muted">
            ส่วนต่างอัตราแลกเปลี่ยน (FX/DCC) ~{(FX_MARKUP_RATE * 100).toFixed(1)}%
          </dt>
          <dd className="tabular font-semibold text-aa-success">−{thb(quote.savings.fxMarkup)}</dd>
        </div>
      </dl>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-snug text-aa-muted">
        <Landmark className="mt-px h-3 w-3 shrink-0" aria-hidden />
        ค่าธรรมเนียมทั้งสองรายการนี้ถูกเรียกเก็บโดยธนาคารผู้ออกบัตร ไม่ใช่สายการบิน
        และจะไม่เกิดขึ้นเมื่อร้านค้าผู้รับชำระจดทะเบียนในประเทศไทย
      </p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-aa-muted">{label}</dt>
      <dd className="tabular font-semibold">{value}</dd>
    </div>
  );
}
