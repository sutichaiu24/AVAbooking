import { MERCHANT } from "@/lib/network";

/**
 * Optional hero photograph, served from `public/`.
 *
 * Painted as a CSS background rather than an <Image> so the page degrades
 * cleanly when the file is absent: the crimson gradient and the drawn route
 * network below simply show through, which is exactly the previous design.
 * Drop a file at this path to switch the hero over to photography.
 */
const HERO_PHOTO = "/hero.png";

export function SiteHeader() {
  return (
    <header className="relative isolate overflow-hidden bg-aa-hero text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_PHOTO})` }}
      />
      {/* Guarantees headline contrast whatever the photograph does: heavy on
          the text column, opening up toward the right where the frame is. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage:
            "linear-gradient(100deg, rgba(36,6,6,0.97) 0%, rgba(36,6,6,0.9) 32%, rgba(36,6,6,0.55) 60%, rgba(36,6,6,0.3) 100%), linear-gradient(to bottom, rgba(36,6,6,0.55) 0%, rgba(36,6,6,0) 30%, rgba(36,6,6,0.7) 100%)",
        }}
      />

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

/**
 * The route network, drawn rather than photographed.
 *
 * Deliberately abstract: a curved graticule and a set of great-circle arcs
 * converging on a single hub. No coastlines and no place names — a drawn map
 * that tries to be literal ends up being a wrong map, and labels would fight
 * the headline sitting on top of it.
 *
 * Geometry is hand-placed rather than random so server and client render
 * identically, and the whole network is kept to the right of centre to leave
 * the headline's half of the frame quiet.
 */

/** Hub, in viewBox units. Sits well right of the headline column. */
const HUB = { x: 812, y: 246 };

/** Destinations, with the bow height of the arc that reaches each one. */
const SPOKES = [
  { x: 1042, y: 92, bow: -58 },
  { x: 1148, y: 214, bow: -34 },
  { x: 1096, y: 372, bow: 30 },
  { x: 934, y: 470, bow: 44 },
  { x: 706, y: 468, bow: 40 },
  { x: 636, y: 104, bow: -46 },
];

/** Quadratic arc from the hub, bowed perpendicular to the chord. */
function arc(to: { x: number; y: number; bow: number }): string {
  const mx = (HUB.x + to.x) / 2;
  const my = (HUB.y + to.y) / 2;
  const dx = to.x - HUB.x;
  const dy = to.y - HUB.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular offset gives every arc the same great-circle bow.
  const cx = mx + (-dy / len) * to.bow;
  const cy = my + (dx / len) * to.bow;
  return `M${HUB.x} ${HUB.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

function RouteBackdrop() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-80"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 600"
      fill="none"
    >
      <defs>
        <linearGradient id="aa-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E60000" stopOpacity="0" />
          <stop offset="45%" stopColor="#FF4D4D" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#E60000" stopOpacity="0.15" />
        </linearGradient>

        <radialGradient id="aa-glow" cx="0.72" cy="0.34" r="0.55">
          <stop offset="0%" stopColor="#E60000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E60000" stopOpacity="0" />
        </radialGradient>

        {/* Keeps the headline's half of the frame quiet. */}
        <linearGradient id="aa-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="1" />
          <stop offset="42%" stopColor="#000" stopOpacity="1" />
          <stop offset="72%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="aa-right">
          <rect width="1200" height="600" fill="url(#aa-fade)" />
        </mask>

        <filter id="aa-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="1200" height="600" fill="url(#aa-glow)" />

      {/* Curved graticule — suggests a globe without claiming a geography. */}
      <g stroke="#E60000" strokeOpacity="0.09" strokeWidth="0.5">
        {[-140, 0, 140, 280, 420, 560, 700].map((offset) => (
          <path key={offset} d={`M${540 + offset} -40 Q${660 + offset} 300 ${540 + offset} 640`} />
        ))}
        {[80, 190, 300, 410, 520].map((y) => (
          <path key={y} d={`M-40 ${y} Q600 ${y - 46} 1240 ${y}`} />
        ))}
      </g>

      {/* Route network. */}
      <g mask="url(#aa-right)">
        <g stroke="url(#aa-arc)" strokeLinecap="round">
          {SPOKES.map((spoke, i) => (
            <path key={i} d={arc(spoke)} strokeWidth={i % 3 === 0 ? 1.5 : 0.9} />
          ))}
        </g>

        {SPOKES.map((spoke, i) => (
          <circle key={i} cx={spoke.x} cy={spoke.y} r="2.2" fill="#FF6B6B" fillOpacity="0.75" />
        ))}

        <circle cx={HUB.x} cy={HUB.y} r="4" fill="#FF6B6B" />
        <circle cx={HUB.x} cy={HUB.y} r="11" stroke="#E60000" strokeOpacity="0.5" strokeWidth="0.9" />
        <circle cx={HUB.x} cy={HUB.y} r="22" stroke="#E60000" strokeOpacity="0.22" strokeWidth="0.7" />
        <circle cx={HUB.x} cy={HUB.y} r="38" stroke="#E60000" strokeOpacity="0.1" strokeWidth="0.6" />
      </g>

      {/* Film grain, so the flat gradient does not band on wide screens. */}
      <rect width="1200" height="600" filter="url(#aa-grain)" opacity="0.045" />
    </svg>
  );
}
