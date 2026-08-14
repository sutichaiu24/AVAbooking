"use client";

import { Landmark } from "lucide-react";

/**
 * Small "where does the money land" table repeated under each payment rail.
 * Keeping it identical across methods is the point: every rail settles the
 * same way.
 */
export function SettlementNote({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-6 border-l-2 border-aa-success pl-4">
      <p className="flex items-center gap-2 text-[11px] font-bold text-aa-success">
        <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
        รับชำระโดยนิติบุคคลไทย · ไม่ผ่านระบบข้ามประเทศ
      </p>
      <dl className="mt-2.5 space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 text-[11px]">
            <dt className="shrink-0 font-light text-aa-muted">{label}</dt>
            <dd className="tabular truncate text-right font-medium text-aa-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
