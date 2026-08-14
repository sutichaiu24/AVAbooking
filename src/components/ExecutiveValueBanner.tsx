"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { MERCHANT } from "@/lib/network";
import { CROSS_BORDER_FEE_RATE } from "@/lib/pricing";

interface Metric {
  figure: string;
  label: string;
  detail: string;
}

const METRICS: Metric[] = [
  {
    figure: "0%",
    label: "ค่าธรรมเนียมข้ามประเทศ",
    detail: `ยกเลิกค่าธรรมเนียม Cross-Border ${(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}% ที่ธนาคารผู้ออกบัตรเรียกเก็บจากผู้ถือบัตรไทย`,
  },
  {
    figure: "+18%",
    label: "เป้าหมาย Conversion",
    detail: "ลดขั้นตอนการชำระเงินเหลือการสแกนครั้งเดียวผ่านพร้อมเพย์และโมบายแบงก์กิ้ง",
  },
  {
    figure: "100% THB",
    label: "รับชำระเข้านิติบุคคลไทย",
    detail: `รายได้เข้าบัญชี ${MERCHANT.legalNameTh} โดยตรง ผ่าน ${MERCHANT.settlementBank}`,
  },
];

/**
 * Slim masthead: brand lockup on the left, the three executive metrics on the
 * right, separated by hairlines. Sticks to the top of the viewport and stays
 * out of the way — the numbers are present for the executive audience without
 * claiming the space a marketing banner would.
 */
export function ExecutiveValueBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-aa-border bg-aa-paper/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between gap-8">
          <Wordmark />

          {/* Labelled so the internal KPIs read as an overlay on the product
              rather than as something a passenger would see on a booking site. */}
          <div className="hidden items-center gap-6 lg:flex">
            <span className="aa-eyebrow shrink-0 border-r border-aa-border pr-6 leading-[1.6]">
              มุมมอง
              <br />
              ผู้บริหาร
            </span>
            <dl className="flex items-center divide-x divide-aa-border">
              {METRICS.map((metric) => (
                <div key={metric.label} className="px-6 last:pr-0">
                  <dd className="text-[16px] font-bold tabular leading-none tracking-tight text-aa-red">
                    {metric.figure}
                  </dd>
                  <dt className="mt-1.5 text-[13px] font-medium tracking-wide text-aa-muted">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-aa-graphite lg:hidden"
          >
            <span className="text-aa-red">0%</span> ค่าธรรมเนียมข้ามประเทศ
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>

        {expanded && (
          <dl className="animate-aa-rise space-y-5 border-t border-aa-border py-5 lg:hidden">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <dd className="text-[20px] font-bold tabular leading-none tracking-tight text-aa-red">
                  {metric.figure}
                </dd>
                <dt className="mt-1.5 text-[15px] font-medium text-aa-ink">{metric.label}</dt>
                <dd className="mt-1 text-[15px] font-light leading-relaxed text-aa-muted">
                  {metric.detail}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/**
 * Official airline mark, served from `public/logo.png`.
 *
 * Optional: when the file is absent nothing paints and the text lockup beside
 * it carries the identification on its own, so the masthead still reads
 * correctly. Trademarks are only ever rendered from a supplied asset — never
 * redrawn.
 */
const LOGO = "/logo.png";

function Wordmark() {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <span
        aria-hidden
        className="h-8 w-8 shrink-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${LOGO})` }}
      />
      <span className="leading-none">
        <span className="block text-[16px] font-bold tracking-tight text-aa-ink">AirAsia</span>
        <span className="mt-1 block text-[12px] font-medium uppercase tracking-widest text-aa-muted">
          ไทยแอร์เอเชีย
        </span>
      </span>
    </div>
  );
}
