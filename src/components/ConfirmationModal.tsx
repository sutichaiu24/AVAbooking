"use client";

import {
  CheckCircle2,
  Download,
  Landmark,
  Loader2,
  Plane,
  Server,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { downloadETicket } from "@/lib/eticket";
import { clockTime, thaiDate, thb } from "@/lib/format";
import { AIRPORTS, FARE_BRANDS } from "@/lib/network";
import { CROSS_BORDER_FEE_RATE, FX_MARKUP_RATE } from "@/lib/pricing";
import { findMethod, findProvider } from "@/lib/payments";
import type { CommitBookingResponse, PaymentMethodId } from "@/lib/types";

interface Props {
  booking: CommitBookingResponse | null;
  committing: boolean;
  error: string | null;
  method: PaymentMethodId | null;
  provider?: string;
  onClose: () => void;
}

/**
 * Terminal step: replays the PSS handshake, then shows the PNR, the e-tickets
 * and the settlement position.
 */
export function ConfirmationModal({
  booking,
  committing,
  error,
  method,
  provider,
  onClose,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = committing || Boolean(booking) || Boolean(error);

  // Close on Escape, but only once the commit has resolved — interrupting an
  // in-flight PSS call would leave the user unsure whether they were charged.
  useEffect(() => {
    if (!open || committing) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, committing, onClose]);

  useEffect(() => {
    if (booking) closeRef.current?.focus();
  }, [booking]);

  // Lock background scrolling while the modal owns the screen.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-aa-wine/60 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div className="animate-aa-rise my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-aa-lift">
        {committing && <CommitProgress />}
        {!committing && error && <CommitError message={error} onClose={onClose} />}
        {!committing && booking && (
          <Confirmed
            booking={booking}
            method={method}
            provider={provider}
            onClose={onClose}
            closeRef={closeRef}
          />
        )}
      </div>
    </div>
  );
}

/** Animated trace of the four upstream calls, shown while the commit runs. */
function CommitProgress() {
  const steps = [
    "เชื่อมต่อระบบสำรองที่นั่งส่วนกลาง (Navitaire)",
    "จองที่นั่งและตัดจำนวนที่นั่งคงเหลือ",
    "แนบโทเคนการชำระเงินสกุลบาทจากผู้รับชำระในประเทศ",
    "ยืนยันรหัสการจองและออกบัตรโดยสารอิเล็กทรอนิกส์",
  ];

  const [reached, setReached] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReached((current) => (current >= steps.length ? current : current + 1));
    }, 620);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-aa-tint">
        <Server className="h-7 w-7 animate-pulse text-aa-red" aria-hidden />
      </div>
      <h2 id="confirmation-title" className="mt-4 text-lg font-bold">
        กำลังส่งข้อมูลการจองไปยังระบบสำรองที่นั่ง
      </h2>
      <p className="mt-1 font-mono text-[11px] text-aa-muted">POST /api/pss/v1/commit-booking</p>

      <ol className="mx-auto mt-6 max-w-md space-y-2.5 text-left">
        {steps.map((step, index) => {
          const done = index < reached;
          const active = index === reached;
          return (
            <li
              key={step}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                done ? "bg-aa-success/5 text-aa-ink" : active ? "bg-aa-tint text-aa-ink" : "text-aa-muted/60"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-aa-success" aria-hidden />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-aa-red" aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-aa-border" aria-hidden />
              )}
              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CommitError({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 id="confirmation-title" className="text-lg font-bold text-aa-crimson">
        ไม่สามารถยืนยันการจองได้
      </h2>
      <p className="mt-2 text-sm text-aa-muted">{message}</p>
      <button type="button" className="aa-btn-ghost mt-6" onClick={onClose}>
        ปิดหน้าต่าง
      </button>
    </div>
  );
}

function Confirmed({
  booking,
  method,
  provider,
  onClose,
  closeRef,
}: {
  booking: CommitBookingResponse;
  method: PaymentMethodId | null;
  provider?: string;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { flight, quote, settlement, pss } = booking;
  const methodSpec = method ? findMethod(method) : undefined;
  const providerSpec = provider ? findProvider(provider) : undefined;

  return (
    <>
      <div className="relative bg-aa-hero px-6 py-6 text-white">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่างยืนยันการจอง"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-2 text-aa-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-widest">Booking Confirmed</p>
        </div>

        <h2 id="confirmation-title" className="mt-2 text-2xl font-extrabold">
          การจองของคุณสำเร็จแล้ว
        </h2>
        <p className="mt-1 text-xs text-white/60">
          ส่งบัตรโดยสารอิเล็กทรอนิกส์ไปยังอีเมลของคุณเรียบร้อยแล้ว
        </p>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-xl bg-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50">
              รหัสการจอง (PNR)
            </p>
            <p className="tabular text-3xl font-extrabold tracking-wider">{booking.pnr}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/50">ยอดชำระ</p>
            <p className="tabular text-xl font-extrabold">{thb(quote.total)}</p>
          </div>
        </div>
      </div>

      <div className="max-h-[52vh] space-y-5 overflow-y-auto px-6 py-5">
        {/* Itinerary */}
        <section>
          <SectionHeading icon={Plane} title="รายละเอียดเที่ยวบิน" />
          <div className="mt-2.5 rounded-xl border border-aa-border p-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="tabular text-xl font-extrabold">{clockTime(flight.departAt)}</p>
                <p className="text-xs font-semibold text-aa-muted">
                  {flight.origin} · {AIRPORTS[flight.origin].cityTh}
                </p>
              </div>
              <div className="flex-1 border-t border-dashed border-aa-border" aria-hidden />
              <div className="text-right">
                <p className="tabular text-xl font-extrabold">{clockTime(flight.arriveAt)}</p>
                <p className="text-xs font-semibold text-aa-muted">
                  {flight.destination} · {AIRPORTS[flight.destination].cityTh}
                </p>
              </div>
            </div>
            <p className="mt-3 border-t border-aa-border pt-3 text-[11px] text-aa-muted">
              {flight.flightNo} · {thaiDate(flight.departAt)} · {flight.aircraft} ·{" "}
              {FARE_BRANDS[quote.brand].name}
            </p>
          </div>
        </section>

        {/* E-tickets */}
        <section>
          <SectionHeading icon={CheckCircle2} title="บัตรโดยสารอิเล็กทรอนิกส์" />
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-aa-border text-[10px] uppercase tracking-wide text-aa-muted">
                  <th className="pb-1.5 font-semibold">ผู้โดยสาร</th>
                  <th className="pb-1.5 font-semibold">เลขที่บัตรโดยสาร</th>
                  <th className="pb-1.5 font-semibold">ที่นั่ง</th>
                  <th className="pb-1.5 font-semibold">สัมภาระ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aa-border">
                {booking.tickets.map((ticket) => (
                  <tr key={ticket.ticketNumber}>
                    <td className="py-1.5 font-semibold">{ticket.passengerName}</td>
                    <td className="tabular py-1.5">{ticket.ticketNumber}</td>
                    <td className="tabular py-1.5">{ticket.seat}</td>
                    <td className="py-1.5">{ticket.baggageKg} กก.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Savings — the executive headline */}
        <section className="rounded-xl border border-aa-success/25 bg-aa-success/5 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-aa-success">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            คุณประหยัดค่าธรรมเนียมไป {thb(quote.savings.total)} จากการชำระเงินในประเทศ
          </p>
          <dl className="mt-3 space-y-1.5 text-[11px]">
            <SaveRow
              label={`ค่าธรรมเนียมบัตรข้ามประเทศ ${(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}%`}
              value={thb(quote.savings.crossBorderFee)}
            />
            <SaveRow
              label={`ส่วนต่างอัตราแลกเปลี่ยน (FX/DCC) ~${(FX_MARKUP_RATE * 100).toFixed(1)}%`}
              value={thb(quote.savings.fxMarkup)}
            />
            <div className="flex items-baseline justify-between border-t border-aa-success/20 pt-1.5">
              <dt className="font-bold text-aa-ink">รวมประหยัดต่อการจอง</dt>
              <dd className="tabular text-base font-extrabold text-aa-success">
                {thb(quote.savings.total)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Settlement + PSS trace */}
        <section>
          <SectionHeading icon={Landmark} title="การรับชำระเงินและการเชื่อมต่อระบบส่วนกลาง" />
          <dl className="mt-2.5 space-y-1.5 rounded-xl border border-aa-border p-4 text-[11px]">
            <InfoRow label="ผู้รับชำระเงิน (Merchant of Record)" value={settlement.entityTh} />
            <InfoRow label="Merchant ID" value={settlement.merchantId} />
            <InfoRow label="ผู้ให้บริการรับชำระ" value={settlement.acquirer} />
            <InfoRow
              label="ช่องทางที่ใช้"
              value={
                providerSpec
                  ? `${methodSpec?.nameTh ?? "-"} · ${providerSpec.name}`
                  : (methodSpec?.nameTh ?? "-")
              }
            />
            <InfoRow label="สกุลเงินและวันที่รับเงิน" value={`THB · ${settlement.valueDate}`} />
            <InfoRow label="รายการข้ามประเทศ" value="ไม่มี (Domestic Acquiring)" highlight />
            <InfoRow label="ระบบปลายทาง" value={pss.system} />
            <InfoRow label="Booking Key" value={booking.bookingKey} />
            <InfoRow label="Correlation ID" value={pss.correlationId} />
            <InfoRow label="เวลาที่ใช้ซิงก์ข้อมูล" value={`${pss.latencyMs} มิลลิวินาที`} />
          </dl>
        </section>
      </div>

      <footer className="flex flex-col gap-2.5 border-t border-aa-border bg-aa-tint px-6 py-4 sm:flex-row">
        <button
          type="button"
          className="aa-btn-primary flex-1"
          onClick={() => downloadETicket(booking)}
        >
          <Download className="h-4 w-4" aria-hidden />
          ดาวน์โหลดบัตรโดยสาร (PDF)
        </button>
        <button type="button" className="aa-btn-ghost sm:w-auto" onClick={onClose}>
          จองเที่ยวบินใหม่
        </button>
      </footer>
    </>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof Plane; title: string }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-bold text-aa-crimson">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {title}
    </h3>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-aa-muted">{label}</dt>
      <dd
        className={`tabular truncate text-right font-semibold ${
          highlight ? "text-aa-success" : "text-aa-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function SaveRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-aa-muted">{label}</dt>
      <dd className="tabular font-semibold text-aa-success">−{value}</dd>
    </div>
  );
}
