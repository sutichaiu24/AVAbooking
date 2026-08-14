"use client";

import { BadgePercent, Building2, ChevronDown, Landmark, TrendingUp } from "lucide-react";
import { useState } from "react";

import { CROSS_BORDER_FEE_RATE } from "@/lib/pricing";
import { MERCHANT } from "@/lib/network";

interface Metric {
  icon: typeof BadgePercent;
  headline: string;
  label: string;
  detail: string;
}

const METRICS: Metric[] = [
  {
    icon: BadgePercent,
    headline: "0%",
    label: "ค่าธรรมเนียมข้ามประเทศ",
    detail: `ยกเลิกค่าธรรมเนียม Cross-Border ${(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}% ที่ธนาคารผู้ออกบัตรเรียกเก็บจากผู้ถือบัตรไทย`,
  },
  {
    icon: TrendingUp,
    headline: "+18%",
    label: "เป้าหมาย Conversion",
    detail: "ลดขั้นตอนการชำระเงินเหลือการสแกนครั้งเดียวผ่านพร้อมเพย์และโมบายแบงก์กิ้ง",
  },
  {
    icon: Landmark,
    headline: "100% THB",
    label: "รับชำระเข้านิติบุคคลไทย",
    detail: `รายได้เข้าบัญชี ${MERCHANT.legalNameTh} โดยตรง ผ่าน ${MERCHANT.settlementBank}`,
  },
];

/**
 * Sticky executive strip. Collapses to a single summary row on small screens
 * so it never competes with the booking flow on mobile.
 */
export function ExecutiveValueBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-aa-wine/40 bg-aa-hero text-white shadow-aa-lift">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Desktop: all three metrics inline. */}
        <div className="hidden items-stretch gap-6 py-3 md:flex">
          <div className="flex items-center gap-2.5 border-r border-white/15 pr-6">
            <Building2 className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                Executive View
              </p>
              <p className="text-sm font-bold">Local Settlement Layer</p>
            </div>
          </div>

          {METRICS.map((metric) => (
            <MetricBlock key={metric.label} metric={metric} />
          ))}
        </div>

        {/* Mobile: one line, expandable. */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <BadgePercent className="h-4 w-4 text-white/80" aria-hidden />
              0% ค่าธรรมเนียมข้ามประเทศ · รับชำระเป็นเงินบาท 100%
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {expanded && (
            <div className="animate-aa-rise space-y-3 pb-4">
              {METRICS.map((metric) => (
                <MetricBlock key={metric.label} metric={metric} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBlock({ metric, compact = false }: { metric: Metric; compact?: boolean }) {
  const Icon = metric.icon;
  return (
    <div className={compact ? "flex items-start gap-3" : "flex flex-1 items-start gap-3 py-0.5"}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white/70" aria-hidden />
      <div className="leading-tight">
        <p className="text-lg font-extrabold tabular tracking-tight">{metric.headline}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
          {metric.label}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/60">{metric.detail}</p>
      </div>
    </div>
  );
}
