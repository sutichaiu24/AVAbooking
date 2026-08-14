"use client";

import { CheckCircle2, CreditCard, Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { thb } from "@/lib/format";
import { MERCHANT } from "@/lib/network";
import { CROSS_BORDER_FEE_RATE } from "@/lib/pricing";

import { SettlementNote } from "./SettlementNote";

interface Props {
  amount: number;
  savedCrossBorderFee: number;
  onSettled: (ref: string) => void;
}

type Phase = "idle" | "authorising" | "challenge" | "done";

/**
 * Domestic card acquiring under the Thai merchant ID (2C2P / Omise mock).
 *
 * Card data is never retained here — the PoC only shapes the input and hands
 * a token-shaped reference to the BFF, matching how a hosted-fields
 * integration behaves.
 */
export function LocalCardPane({ amount, savedCrossBorderFee, onSettled }: Props) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const digits = number.replace(/\D/g, "");
  const complete =
    digits.length >= 15 && /^\d{2}\/\d{2}$/.test(expiry) && cvv.length >= 3 && name.trim().length > 2;

  const scheme = detectScheme(digits);

  async function pay() {
    setError(null);
    setPhase("authorising");
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Domestic 3-D Secure step-up.
    setPhase("challenge");
    await new Promise((resolve) => setTimeout(resolve, 1_100));

    try {
      const response = await fetch("/api/payments/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "local_card", amount }),
      });
      if (!response.ok) throw new Error("authorize");

      const data: { ref: string } = await response.json();
      setPhase("done");
      setTimeout(() => onSettled(data.ref), 800);
    } catch {
      setPhase("idle");
      setError("ธนาคารผู้ออกบัตรปฏิเสธรายการ กรุณาตรวจสอบข้อมูลบัตรอีกครั้ง");
    }
  }

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="aa-label" htmlFor="card-number">
              หมายเลขบัตร
            </label>
            <div className="relative">
              <input
                id="card-number"
                className="aa-field pr-16 font-mono tabular"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4111 1111 1111 1111"
                value={number}
                disabled={phase !== "idle"}
                onChange={(event) => setNumber(formatCardNumber(event.target.value))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-wide text-aa-crimson">
                {scheme}
              </span>
            </div>
          </div>

          <div>
            <label className="aa-label" htmlFor="card-expiry">
              วันหมดอายุ
            </label>
            <input
              id="card-expiry"
              className="aa-field font-mono tabular"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              disabled={phase !== "idle"}
              onChange={(event) => setExpiry(formatExpiry(event.target.value))}
            />
          </div>

          <div>
            <label className="aa-label" htmlFor="card-cvv">
              รหัส CVV
            </label>
            <input
              id="card-cvv"
              className="aa-field font-mono tabular"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              value={cvv}
              disabled={phase !== "idle"}
              onChange={(event) => setCvv(event.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="aa-label" htmlFor="card-name">
              ชื่อบนบัตร
            </label>
            <input
              id="card-name"
              className="aa-field uppercase"
              autoComplete="cc-name"
              placeholder="SOMCHAI JAIDEE"
              value={name}
              disabled={phase !== "idle"}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 bg-aa-red/10 px-3 py-2 text-[13px] font-semibold text-aa-crimson">
            {error}
          </p>
        )}

        <button
          type="button"
          className="aa-btn-primary mt-4 w-full sm:w-auto"
          disabled={!complete || phase !== "idle"}
          onClick={() => void pay()}
        >
          {phase === "idle" && (
            <>
              <Lock className="h-4 w-4" aria-hidden />
              ชำระเงิน {thb(amount)}
            </>
          )}
          {phase === "authorising" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              กำลังส่งข้อมูลไปยังผู้รับชำระในประเทศ…
            </>
          )}
          {phase === "challenge" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              รอการยืนยัน OTP / 3-D Secure…
            </>
          )}
          {phase === "done" && (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              อนุมัติรายการแล้ว
            </>
          )}
        </button>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-aa-muted">
          <Lock className="mt-px h-3 w-3 shrink-0" aria-hidden />
          ข้อมูลบัตรถูกเข้ารหัสและส่งตรงไปยังผู้ให้บริการรับชำระที่ได้รับการรับรองมาตรฐาน PCI-DSS
          ระดับ 1 ในประเทศไทย สายการบินไม่จัดเก็บหมายเลขบัตรของคุณ
        </p>
      </div>

      <div>
        <div className="border border-aa-border bg-aa-tint p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-aa-crimson">
            <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
            เปรียบเทียบกับการตัดบัตรผ่านร้านค้าต่างประเทศ
          </p>

          <div className="mt-3 space-y-2.5 text-[13px]">
            <CompareRow
              label="ยอดเรียกเก็บบนใบแจ้งหนี้"
              here={thb(amount)}
              there={thb(amount + savedCrossBorderFee)}
            />
            <CompareRow
              label={`ค่าธรรมเนียมข้ามประเทศ ${(CROSS_BORDER_FEE_RATE * 100).toFixed(0)}%`}
              here="ไม่มี"
              there={thb(amount * CROSS_BORDER_FEE_RATE)}
            />
            <CompareRow label="สกุลเงินที่ตัดบัตร" here="THB" there="MYR / USD" />
            <CompareRow label="ส่วนต่างอัตราแลกเปลี่ยน" here="ไม่มี" there="มี" />
          </div>
        </div>

        <SettlementNote
          rows={[
            ["ผู้รับชำระเงิน", MERCHANT.legalNameTh],
            ["ผู้ให้บริการรับชำระ", MERCHANT.acquirer],
            ["Merchant ID", MERCHANT.merchantId],
            ["Descriptor บนใบแจ้งหนี้", "THAI AIRASIA BKK"],
          ]}
        />
      </div>
    </div>
  );
}

function CompareRow({ label, here, there }: { label: string; here: string; there: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-2">
      <span className="truncate text-aa-muted">{label}</span>
      <span className="tabular w-20 text-right font-bold text-aa-success">{here}</span>
      <span className="tabular w-20 text-right text-aa-muted line-through">{there}</span>
    </div>
  );
}

/** Presentation-only scheme detection from the leading digits. */
function detectScheme(digits: string): string {
  if (/^4/.test(digits)) return "VISA";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "MASTER";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^62/.test(digits)) return "UNIONPAY";
  return "";
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
