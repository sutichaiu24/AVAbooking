"use client";

import { clockTime, thaiDate, thb, thbPrecise } from "@/lib/format";
import { AIRPORTS, FARE_BRANDS, MERCHANT } from "@/lib/network";
import { CROSS_BORDER_FEE_RATE, FX_MARKUP_RATE } from "@/lib/pricing";
import type { FareQuote, FlightOption } from "@/lib/types";

/**
 * Itemised THB breakdown plus the local-settlement savings callout. Sticks to
 * the viewport on desktop so the total stays visible through payment.
 */
export function FareSummary({ flight, quote }: { flight: FlightOption; quote: FareQuote }) {
  const brand = FARE_BRANDS[quote.brand];

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="border-t-2 border-aa-ink pt-5">
        <p className="aa-eyebrow">สรุปราคา</p>

        <p className="mt-4 text-[17px] font-light tracking-tight">
          {AIRPORTS[flight.origin].cityTh}
          <span className="mx-2.5 text-aa-muted">—</span>
          {AIRPORTS[flight.destination].cityTh}
        </p>
        <p className="mt-1.5 text-[11px] font-light text-aa-muted">
          {flight.flightNo} · {thaiDate(flight.departAt)} · {clockTime(flight.departAt)}–
          {clockTime(flight.arriveAt)}
        </p>
        <p className="mt-3 text-[11px] font-medium text-aa-ink">
          {brand.name} · {quote.pax} ท่าน
        </p>

        <dl className="mt-6 divide-y divide-aa-border border-t border-aa-border text-[13px]">
          <Line
            label={`ค่าโดยสาร (${thb(quote.baseFarePerPax)} × ${quote.pax})`}
            value={thb(quote.baseFareTotal)}
          />
          <Line label="ค่าธรรมเนียมสนามบิน (PSC)" value={thb(quote.airportTax)} />
          <Line label="ค่าธรรมเนียมการจอง" value={thb(quote.adminFee)} />
          <Line
            label={`ภาษีมูลค่าเพิ่ม ${(quote.vatRate * 100).toFixed(0)}%`}
            value={thbPrecise(quote.vat)}
          />
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-aa-ink pt-4">
          <dt className="text-[12px] font-bold uppercase tracking-wider">ยอดชำระทั้งสิ้น</dt>
          <dd className="text-[26px] font-light tabular leading-none tracking-tight">
            {thb(quote.total)}
          </dd>
        </div>
        <p className="mt-3 text-[10px] font-light leading-relaxed text-aa-muted">
          เรียกเก็บเป็นสกุลเงินบาท (THB) โดย {MERCHANT.legalNameTh}
        </p>

        <SavingsCallout quote={quote} />
      </div>
    </aside>
  );
}

function SavingsCallout({ quote }: { quote: FareQuote }) {
  return (
    <div className="mt-8 border-l-2 border-aa-success pl-4">
      <p className="text-[12px] font-bold text-aa-success">
        ประหยัดได้ {thb(quote.savings.total)}
      </p>
      <p className="mt-0.5 text-[10px] font-light text-aa-muted">จากการชำระในประเทศ</p>

      <dl className="mt-3 space-y-1.5 text-[11px] font-light">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-aa-muted">
            ค่าธรรมเนียมบัตรข้ามประเทศ {(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}%
          </dt>
          <dd className="tabular text-aa-success">−{thb(quote.savings.crossBorderFee)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-aa-muted">
            ส่วนต่างอัตราแลกเปลี่ยน ~{(FX_MARKUP_RATE * 100).toFixed(1)}%
          </dt>
          <dd className="tabular text-aa-success">−{thb(quote.savings.fxMarkup)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-[10px] font-light leading-relaxed text-aa-muted">
        ค่าธรรมเนียมทั้งสองรายการนี้ถูกเรียกเก็บโดยธนาคารผู้ออกบัตร ไม่ใช่สายการบิน
        และจะไม่เกิดขึ้นเมื่อร้านค้าผู้รับชำระจดทะเบียนในประเทศไทย
      </p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="font-light text-aa-graphite">{label}</dt>
      <dd className="tabular font-medium">{value}</dd>
    </div>
  );
}
