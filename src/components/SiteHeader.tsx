import { Plane, ShieldCheck } from "lucide-react";

import { MERCHANT } from "@/lib/network";

/** Brand header. Static — rendered on the server. */
export function SiteHeader() {
  return (
    <header className="bg-aa-hero text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-12 pt-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:pb-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-aa-red shadow-aa-lift">
              <Plane className="h-6 w-6 -rotate-45 text-white" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-xl font-extrabold tracking-tight">
                AirAsia<span className="text-white/50"> · ไทยแอร์เอเชีย</span>
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Thailand Domestic Booking
              </p>
            </div>
          </div>

          <h1 className="mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            จองบัตรโดยสารในประเทศ
            <br />
            <span className="text-white/70">ชำระเป็นเงินบาท เข้านิติบุคคลไทย 100%</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
            ระบบจองและชำระเงินเฉพาะตลาดไทย รองรับพร้อมเพย์ โมบายแบงก์กิ้ง ทรูมันนี่ และบัตรในประเทศ
            พร้อมส่งข้อมูลการจองกลับเข้าระบบสำรองที่นั่งส่วนกลางแบบเรียลไทม์
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur lg:w-80">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Merchant of Record
          </div>
          <p className="mt-2 text-sm font-bold">{MERCHANT.legalNameTh}</p>
          <p className="text-xs text-white/55">{MERCHANT.legalName}</p>

          <dl className="mt-4 space-y-1.5 text-[11px]">
            <Row label="เลขประจำตัวผู้เสียภาษี" value={MERCHANT.taxId} />
            <Row label="Merchant ID" value={MERCHANT.merchantId} />
            <Row label="ธนาคารรับชำระ" value={MERCHANT.settlementBank} />
            <Row label="สกุลเงินรับชำระ" value="THB (บาท)" />
          </dl>
        </div>
      </div>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-1.5 last:border-0">
      <dt className="text-white/50">{label}</dt>
      <dd className="tabular font-semibold text-white/90">{value}</dd>
    </div>
  );
}
