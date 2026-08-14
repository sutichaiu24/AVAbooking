import { BookingFlow } from "@/components/BookingFlow";
import { ExecutiveValueBanner } from "@/components/ExecutiveValueBanner";
import { PhotoBand } from "@/components/PhotoBand";
import { SiteHeader } from "@/components/SiteHeader";
import { MERCHANT } from "@/lib/network";

export default function Page() {
  return (
    <>
      <ExecutiveValueBanner />
      <SiteHeader />

      <main>
        <BookingFlow />
        <PhotoBand
          file="apron.jpg"
          caption="ดอนเมือง — ฐานปฏิบัติการภายในประเทศ"
          sub="เที่ยวบินภายในประเทศของไทยแอร์เอเชียออกเดินทางจากท่าอากาศยานดอนเมือง สู่ 5 จุดหมายปลายทางหลักทั่วประเทศ"
        />
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
      title: "Local Merchant of Record",
      body: `รายการชำระเงินทั้งหมดถูกบันทึกภายใต้ ${MERCHANT.legalNameTh} ทำให้รายได้เข้าสู่บัญชีนิติบุคคลไทยโดยตรง และออกใบกำกับภาษีในประเทศได้ทันที`,
    },
    {
      title: "Local Payment Rails",
      body: "รองรับพร้อมเพย์ โมบายแบงก์กิ้ง ทรูมันนี่ ช้อปปี้เพย์ และบัตรในประเทศ ซึ่งเป็นช่องทางที่ผู้บริโภคไทยใช้จริงมากกว่าบัตรเครดิตต่างประเทศ",
    },
    {
      title: "PSS Sync (BFF)",
      body: "ชั้น Backend-For-Frontend ส่งโทเคนการจองและการชำระเงินกลับเข้าระบบ Navitaire ของสำนักงานใหญ่แบบเรียลไทม์ โดยไม่ต้องแก้ไขระบบหลัก",
    },
    {
      title: "Compliance & PDPA",
      body: "ข้อมูลผู้โดยสารและข้อมูลการชำระเงินถูกประมวลผลในประเทศตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล และมาตรฐาน PCI-DSS ระดับ 1",
    },
  ];

  const flow = [
    "ผู้โดยสารไทย",
    "Local Booking UI",
    "BFF Orchestrator",
    "Thai Acquirer",
    "บัญชี บจ. ไทยแอร์เอเชีย (THB)",
    "Navitaire PSS (HQ)",
  ];

  return (
    <section className="border-t border-aa-border bg-aa-tint">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="aa-eyebrow">Architecture</p>
        <h2 className="mt-5 max-w-2xl text-[32px] font-light leading-snug tracking-tight sm:text-[34px]">
          ชั้นการจองและชำระเงินเฉพาะตลาดไทย ที่วางทับระบบเดิมโดยไม่ต้องเปลี่ยนระบบหลัก
        </h2>

        {/* Numbered because the pillars are a stack, not a sequence — the index
            is presentational only. */}
        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="border-t border-aa-rule pt-5">
              <h3 className="text-[16px] font-bold tracking-tight">{pillar.title}</h3>
              <p className="mt-3 text-[15px] font-light leading-[1.9] text-aa-graphite">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-20 border-t border-aa-rule pt-8">
          <p className="aa-eyebrow">Booking &amp; settlement flow</p>
          <div className="mt-6 overflow-x-auto">
            <ol className="flex min-w-[760px] items-stretch">
              {flow.map((node, index) => (
                <li key={node} className="flex flex-1 items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold tabular tracking-widest text-aa-red">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1.5 block text-[15px] font-medium leading-snug text-aa-ink">
                      {node}
                    </span>
                  </div>
                  {index < flow.length - 1 && (
                    <span className="h-px w-6 shrink-0 bg-aa-rule" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-aa-wine text-white/55">
      <div className="mx-auto max-w-6xl space-y-3 px-6 py-16 text-[15px] font-light leading-relaxed">
        <p className="text-[16px] font-medium text-white">{MERCHANT.legalNameTh}</p>
        <p>
          เลขประจำตัวผู้เสียภาษี {MERCHANT.taxId} · Merchant ID {MERCHANT.merchantId} ·
          ผู้ให้บริการรับชำระ {MERCHANT.acquirer}
        </p>
        <p className="max-w-3xl pt-3 text-white/35">
          เอกสารและระบบนี้เป็นต้นแบบเชิงแนวคิด (Proof of Concept) สำหรับการนำเสนอภายในเท่านั้น
          ข้อมูลเที่ยวบิน ราคา เลขทะเบียนนิติบุคคล และรายการชำระเงินทั้งหมดเป็นข้อมูลจำลอง
          ไม่สามารถใช้เดินทางหรืออ้างอิงทางกฎหมายได้
        </p>
      </div>
    </footer>
  );
}
