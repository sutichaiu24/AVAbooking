"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { bangkokToday, addDays } from "@/lib/format";
import { buildQuote } from "@/lib/pricing";
import type {
  CommitBookingResponse,
  FareBrand,
  FlightOption,
  Passenger,
  SearchQuery,
  SearchResponse,
} from "@/lib/types";

import { ConfirmationModal } from "./ConfirmationModal";
import { FareSummary } from "./FareSummary";
import { FlightList } from "./FlightList";
import { PassengerPanel } from "./PassengerPanel";
import { SearchPanel } from "./SearchPanel";
import { Stepper, type StepId } from "./Stepper";
import { PaymentPanel, type SettledPayment } from "./payment/PaymentPanel";

function emptyPassenger(): Passenger {
  return {
    title: "MR",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    nationalId: "",
  };
}

export function BookingFlow() {
  const [step, setStep] = useState<StepId>("search");

  const [query, setQuery] = useState<SearchQuery>(() => ({
    origin: "DMK",
    destination: "CNX",
    // Default to a week out — a realistic advance-purchase window.
    departDate: addDays(bangkokToday(), 7),
    pax: 1,
  }));

  const [result, setResult] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [flight, setFlight] = useState<FlightOption | null>(null);
  const [brand, setBrand] = useState<FareBrand | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);
  const [passengerErrors, setPassengerErrors] = useState<Record<string, string>>({});

  const [payment, setPayment] = useState<SettledPayment | null>(null);
  const [booking, setBooking] = useState<CommitBookingResponse | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const quote = useMemo(() => {
    if (!flight || !brand) return null;
    return buildQuote({
      baseFare: flight.baseFare,
      brand,
      pax: query.pax,
      origin: flight.origin,
    });
  }, [flight, brand, query.pax]);

  /* ------------------------------------------------------------- search */

  function patchQuery(patch: Partial<SearchQuery>) {
    setQuery((current) => ({ ...current, ...patch }));

    if (typeof patch.pax === "number") {
      // Keep the passenger list the same length as the party size.
      const size = patch.pax;
      setPassengers((list) =>
        size > list.length
          ? [...list, ...Array.from({ length: size - list.length }, emptyPassenger)]
          : list.slice(0, size),
      );
    }

    // Any change to the query invalidates the current selection.
    setFlight(null);
    setBrand(null);
  }

  async function runSearch() {
    setSearching(true);
    setSearchError(null);
    setResult(null);
    setFlight(null);
    setBrand(null);

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        const data: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "SEARCH_FAILED");
      }

      const data: SearchResponse = await response.json();
      setResult(data);
      setStep("select");
    } catch {
      setSearchError("ค้นหาเที่ยวบินไม่สำเร็จ กรุณาตรวจสอบเงื่อนไขการค้นหาแล้วลองอีกครั้ง");
    } finally {
      setSearching(false);
    }
  }

  /* ---------------------------------------------------------- passengers */

  function patchPassenger(index: number, patch: Partial<Passenger>) {
    setPassengers((list) =>
      list.map((passenger, i) => (i === index ? { ...passenger, ...patch } : passenger)),
    );
    // Clear the field's error as soon as the traveller edits it.
    setPassengerErrors((errors) => {
      const next = { ...errors };
      for (const key of Object.keys(patch)) delete next[`${key}-${index}`];
      return next;
    });
  }

  function validatePassengers(): boolean {
    const errors: Record<string, string> = {};

    passengers.forEach((passenger, index) => {
      if (passenger.firstName.trim().length < 2) {
        errors[`firstName-${index}`] = "กรุณากรอกชื่อเป็นภาษาอังกฤษ";
      }
      if (passenger.lastName.trim().length < 2) {
        errors[`lastName-${index}`] = "กรุณากรอกนามสกุลเป็นภาษาอังกฤษ";
      }
      if (!/^\d{13}$|^[A-Za-z0-9]{6,12}$/.test(passenger.nationalId.trim())) {
        errors[`nationalId-${index}`] = "เลขบัตรประชาชน 13 หลัก หรือเลขหนังสือเดินทาง";
      }
      if (index === 0) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(passenger.email.trim())) {
          errors[`email-${index}`] = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        if (passenger.mobile.replace(/\D/g, "").length < 9) {
          errors[`mobile-${index}`] = "กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลัก";
        }
      }
    });

    setPassengerErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* -------------------------------------------------------------- commit */

  const commitBooking = useCallback(
    async (settled: SettledPayment) => {
      if (!flight || !brand || !quote) return;

      setPayment(settled);
      setCommitting(true);
      setCommitError(null);

      try {
        const response = await fetch("/api/pss/v1/commit-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flightId: flight.id,
            brand,
            passengers,
            quote,
            payment: {
              ref: settled.ref,
              method: settled.method,
              provider: settled.provider,
              amount: settled.amount,
            },
          }),
        });

        if (!response.ok) {
          const data: { error?: string } = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "COMMIT_FAILED");
        }

        setBooking(await response.json());
      } catch {
        setCommitError(
          "ระบบสำรองที่นั่งส่วนกลางไม่ตอบสนอง การชำระเงินของคุณยังไม่ถูกตัดยอด กรุณาติดต่อฝ่ายบริการลูกค้า",
        );
      } finally {
        setCommitting(false);
      }
    },
    [flight, brand, quote, passengers],
  );

  function reset() {
    setBooking(null);
    setCommitError(null);
    setPayment(null);
    setFlight(null);
    setBrand(null);
    setResult(null);
    setPassengers(Array.from({ length: query.pax }, emptyPassenger));
    setPassengerErrors({});
    setStep("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------------------------------------------------------- view */

  const showSummary = Boolean(flight && quote) && step !== "search";

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-28">
      {/* The panel breaks the hero's lower edge — the one piece of elevation
          on the page. */}
      <div className="aa-panel -mt-20 mb-10 px-8 pb-8 pt-6 lg:-mt-24 lg:px-10">
        <Stepper current={step} />
      </div>

      <div
        className={
          showSummary
            ? "grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_312px] lg:items-start"
            : "space-y-10"
        }
      >
        <div className="min-w-0 space-y-10">
          {step === "search" && (
            <SearchPanel
              query={query}
              onChange={patchQuery}
              onSubmit={() => void runSearch()}
              loading={searching}
              error={searchError}
            />
          )}

          {step === "select" && result && (
            <>
              <BackLink label="แก้ไขการค้นหา" onClick={() => setStep("search")} />
              <FlightList
                result={result}
                selectedFlightId={flight?.id ?? null}
                selectedBrand={brand}
                onSelect={(selectedFlight, selectedBrand) => {
                  setFlight(selectedFlight);
                  setBrand(selectedBrand);
                }}
              />
              <NextButton
                label="ดำเนินการต่อ · กรอกข้อมูลผู้โดยสาร"
                disabled={!flight || !brand}
                onClick={() => setStep("passenger")}
              />
            </>
          )}

          {step === "passenger" && (
            <>
              <BackLink label="เลือกเที่ยวบินอื่น" onClick={() => setStep("select")} />
              <PassengerPanel
                passengers={passengers}
                onChange={patchPassenger}
                errors={passengerErrors}
              />
              <NextButton
                label="ดำเนินการต่อ · เลือกวิธีชำระเงิน"
                onClick={() => {
                  if (validatePassengers()) setStep("payment");
                }}
              />
            </>
          )}

          {step === "payment" && quote && (
            <>
              <BackLink label="แก้ไขข้อมูลผู้โดยสาร" onClick={() => setStep("passenger")} />
              <PaymentPanel
                quote={quote}
                onSettled={(settled) => void commitBooking(settled)}
                disabled={committing || Boolean(booking)}
              />
            </>
          )}
        </div>

        {showSummary && flight && quote && <FareSummary flight={flight} quote={quote} />}
      </div>

      <ConfirmationModal
        booking={booking}
        committing={committing}
        error={commitError}
        method={payment?.method ?? null}
        provider={payment?.provider}
        onClose={reset}
      />
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-aa-muted transition-colors hover:text-aa-ink"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      {label}
    </button>
  );
}

function NextButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="aa-btn-primary w-full" onClick={onClick} disabled={disabled}>
      <ArrowRight className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
