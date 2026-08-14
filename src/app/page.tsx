import { Building2, Network, ShieldCheck, Zap } from "lucide-react";

import { BookingFlow } from "@/components/BookingFlow";
import { ExecutiveValueBanner } from "@/components/ExecutiveValueBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { MERCHANT } from "@/lib/network";

export default function Page() {
  return (
    <>
      <ExecutiveValueBanner />
      <SiteHeader />

      <main>
        <BookingFlow />
        <ArchitectureStrip />
      </main>

      <SiteFooter />
    </>
  );
}

/** Short architectural explainer for the executive audience. */
function ArchitectureStrip() {
  const pillars = [
    {
      icon: Building2,
      title: "Local Merchant of Record",
      body: `รายการชำระเงินทั้งหมดถูกบันทึกภายใต้ ${MERCHANT.legalNameTh} ทำให้รายได้เข้าสู่บัญชีนิติบุคคลไทยโดยตรง และออกใบกำกับภาษีในประเทศได้ทันที`,
    },
    {
      icon: Zap,
      title: "Local Payment Rails",
      body: "รองรับพร้อมเพย์ โมบายแบงก์กิ้ง ทรูมันนี่ ช้อปปี้เพย์ และบัตรในประเทศ ซึ่งเป็นช่องทางที่ผู้บริโภคไทยใช้จริงมากกว่าบัตรเครดิตต่างประเทศ",
    },
    {
      icon: Network,
      title: "PSS Sync (BFF)",
      body: "ชั้น Backend-For-Frontend ส่งโทเคนการจองและการชำระเงินกลับเข้าระบบ Navitaire ของสำนักงานใหญ่แบบเรียลไทม์ โดยไม่ต้องแก้ไขระบบหลัก",
    },
    {
      icon: ShieldCheck,
      title: "Compliance & PDPA",
      body: "ข้อมูลผู้โดยสารและข้อมูลการชำระเงินถูกประมวลผลในประเทศตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล และมาตรฐาน PCI-DSS ระดับ 1",
    },
  ];

  return (
    <section className="border-t border-aa-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-aa-red">
          Architecture
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-tight">
          ชั้นการจองและชำระเงินเฉพาะตลาดไทย ที่วางทับระบบเดิมโดยไม่ต้องเปลี่ยนระบบหลัก
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-2xl border border-aa-border p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aa-tint text-aa-crimson">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3.5 text-sm font-bold">{pillar.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-aa-muted">{pillar.body}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-aa-border bg-aa-tint p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-aa-muted">
            Booking &amp; settlement flow
          </p>
          <div className="mt-3 flex min-w-[720px] items-center gap-2 text-[11px] font-semibold">
            {[
              "ผู้โดยสารไทย",
              "Local Booking UI (Next.js)",
              "BFF Orchestrator",
              "Thai Acquirer (2C2P / Omise)",
              "บัญชี บจ. ไทยแอร์เอเชีย (THB)",
              "Navitaire PSS (HQ)",
            ].map((node, index, all) => (
              <div key={node} className="flex items-center gap-2">
                <span className="whitespace-nowrap rounded-lg border border-aa-border bg-white px-3 py-2 text-aa-ink">
                  {node}
                </span>
                {index < all.length - 1 && (
                  <span className="text-aa-red" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-aa-wine px-4 py-8 text-white/60 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-2 text-[11px] leading-relaxed">
        <p className="font-bold text-white/90">{MERCHANT.legalNameTh}</p>
        <p>
          เลขประจำตัวผู้เสียภาษี {MERCHANT.taxId} · Merchant ID {MERCHANT.merchantId} ·
          ผู้ให้บริการรับชำระ {MERCHANT.acquirer}
        </p>
        <p className="text-white/40">
          เอกสารและระบบนี้เป็นต้นแบบเชิงแนวคิด (Proof of Concept) สำหรับการนำเสนอภายในเท่านั้น
          ข้อมูลเที่ยวบิน ราคา เลขทะเบียนนิติบุคคล และรายการชำระเงินทั้งหมดเป็นข้อมูลจำลอง
          ไม่สามารถใช้เดินทางหรืออ้างอิงทางกฎหมายได้
        </p>
      </div>
    </footer>
  );
}
