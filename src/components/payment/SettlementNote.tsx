"use client";

import { Landmark } from "lucide-react";

/**
 * Small "where does the money land" table repeated under each payment rail.
 * Keeping it identical across methods is the point: every rail settles the
 * same way.
 */
export function SettlementNote({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-4 rounded-xl border border-aa-success/25 bg-aa-success/5 p-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-aa-success">
        <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
        รับชำระโดยนิติบุคคลไทย · ไม่ผ่านระบบข้ามประเทศ
      </p>
      <dl className="mt-2 space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 text-[11px]">
            <dt className="shrink-0 text-aa-muted">{label}</dt>
            <dd className="tabular truncate text-right font-semibold text-aa-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
