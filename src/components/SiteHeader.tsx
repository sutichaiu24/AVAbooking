import { MERCHANT } from "@/lib/network";

/**
 * Full-bleed hero. Photography would sit here on the production site; in its
 * place is a drawn backdrop — a deep crimson field crossed by a great-circle
 * route arc — which keeps the page self-contained and stays quiet enough for
 * the booking panel to sit on top of it.
 */
export function SiteHeader() {
  return (
    <header className="relative isolate overflow-hidden bg-aa-hero text-white">
      <RouteBackdrop />

      <div className="relative mx-auto max-w-6xl px-6 pb-32 pt-20 sm:pt-28 lg:pb-40">
        <p className="aa-eyebrow text-white/50">Thailand Domestic · ไทยแอร์เอเชีย</p>

        <h1 className="mt-7 max-w-3xl text-[34px] font-light leading-[1.15] tracking-tighter sm:text-[46px] lg:text-[54px]">
          จองบัตรโดยสารในประเทศ
          <span className="mt-1 block text-white/55">ชำระเป็นเงินบาท เข้านิติบุคคลไทย</span>
        </h1>

        <p className="mt-8 max-w-xl text-[14px] font-light leading-[1.8] text-white/60">
          ระบบจองและชำระเงินเฉพาะตลาดไทย รองรับพร้อมเพย์ โมบายแบงก์กิ้ง ทรูมันนี่ และบัตรในประเทศ
          พร้อมส่งข้อมูลการจองกลับเข้าระบบสำรองที่นั่งส่วนกลางแบบเรียลไทม์
        </p>

        <dl className="mt-14 flex flex-wrap gap-x-16 gap-y-8 border-t border-white/15 pt-8">
          <Fact label="Merchant of record" value={MERCHANT.legalNameTh} sub={MERCHANT.legalName} />
          <Fact label="เลขประจำตัวผู้เสียภาษี" value={MERCHANT.taxId} sub="Merchant ID · TH-FD-MERCH-004821" />
          <Fact label="สกุลเงินรับชำระ" value="THB" sub={MERCHANT.settlementBank} />
        </dl>
      </div>
    </header>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="min-w-0">
      <dt className="aa-eyebrow text-white/40">{label}</dt>
      <dd className="mt-2.5 text-[15px] font-medium tracking-tight text-white">{value}</dd>
      <dd className="mt-0.5 text-[11px] font-light text-white/45">{sub}</dd>
    </div>
  );
}

/** Great-circle arcs, drawn rather than photographed. */
function RouteBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 600"
      fill="none"
    >
      <defs>
        <linearGradient id="aa-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E60000" stopOpacity="0" />
          <stop offset="55%" stopColor="#E60000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E60000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="aa-glow" cx="0.78" cy="0.18" r="0.6">
          <stop offset="0%" stopColor="#E60000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#E60000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="600" fill="url(#aa-glow)" />

      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M-80 ${300 + i * 78} C 300 ${150 + i * 62}, 780 ${120 + i * 58}, 1280 ${250 + i * 40}`}
          stroke="url(#aa-arc)"
          strokeWidth={i === 1 ? 1.4 : 0.6}
          opacity={i === 1 ? 0.9 : 0.4}
        />
      ))}

      <circle cx="906" cy="171" r="3" fill="#E60000" />
      <circle cx="906" cy="171" r="9" stroke="#E60000" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  );
}
