"use client";

import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, ScanLine, Timer } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { mmss, thb } from "@/lib/format";
import type { PaymentIntent, PaymentIntentStatus } from "@/lib/types";

import { SettlementNote } from "./SettlementNote";

interface Props {
  amount: number;
  onSettled: (ref: string) => void;
}

/**
 * Dynamic PromptPay QR with a live five-minute countdown and automatic
 * verification.
 *
 * The intent, its expiry and its status all live on the server; this component
 * renders the countdown locally and polls for the status transition, which is
 * how a real merchant-presented QR checkout behaves.
 */
export function PromptPayPane({ amount, onSettled }: Props) {
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentIntentStatus>("PENDING");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [creating, setCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Bumped by the retry button to re-run the effect below. */
  const [reloadKey, setReloadKey] = useState(0);

  // Guards the hand-off so a late poll can't fire it twice.
  const settledRef = useRef(false);

  /**
   * Issues a QR as soon as the pane opens, and re-issues if the total changes
   * or the passenger asks for a fresh code. The effect owns every fetch, so a
   * response that arrives after the amount changed is discarded rather than
   * overwriting the newer intent.
   */
  useEffect(() => {
    let cancelled = false;
    settledRef.current = false;

    (async () => {
      try {
        const response = await fetch("/api/payments/promptpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        if (!response.ok) throw new Error("intent");

        const created: PaymentIntent = await response.json();
        if (cancelled) return;

        setIntent(created);
        setStatus("PENDING");
        setSecondsLeft(
          Math.max(0, Math.floor((Date.parse(created.expiresAt) - Date.now()) / 1000)),
        );
      } catch {
        if (!cancelled) setError("ไม่สามารถสร้างรหัส QR ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        if (!cancelled) setCreating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [amount, reloadKey]);

  /** Discards the current code and asks the effect for a new one. */
  const requestNewCode = useCallback(() => {
    setError(null);
    setIntent(null);
    setStatus("PENDING");
    setCreating(true);
    setReloadKey((key) => key + 1);
  }, []);

  // Local countdown.
  useEffect(() => {
    if (!intent || status !== "PENDING") return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((Date.parse(intent.expiresAt) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setStatus("EXPIRED");
    }, 1000);

    return () => clearInterval(timer);
  }, [intent, status]);

  // Poll the acquirer for the settlement notification.
  useEffect(() => {
    if (!intent || status !== "PENDING") return;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status?ref=${intent.ref}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data: { status: PaymentIntentStatus } = await response.json();
        if (data.status !== "PENDING") setStatus(data.status);
      } catch {
        // Transient network noise — the next tick retries.
      }
    }, 1500);

    return () => clearInterval(poll);
  }, [intent, status]);

  // Hand the settled reference back to the booking flow.
  useEffect(() => {
    if (status !== "PAID" || !intent || settledRef.current) return;
    settledRef.current = true;
    const handoff = setTimeout(() => onSettled(intent.ref), 900);
    return () => clearTimeout(handoff);
  }, [status, intent, onSettled]);

  if (error) {
    return (
      <div className="p-5">
        <p className="text-sm font-semibold text-aa-red">{error}</p>
        <button type="button" className="aa-btn-ghost mt-3" onClick={requestNewCode}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          ลองใหม่
        </button>
      </div>
    );
  }

  if (creating || !intent) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-aa-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        กำลังสร้างรหัส QR สำหรับชำระเงิน…
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[280px]">
        <div className="relative overflow-hidden rounded-2xl border border-aa-border bg-white p-4 shadow-aa-card">
          {/* PromptPay brand strip, as printed on merchant-presented codes. */}
          <div className="-m-4 mb-4 bg-aa-hero px-4 py-2.5 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white">
              PromptPay
            </p>
            <p className="text-[10px] text-white/60">พร้อมเพย์</p>
          </div>

          <div className="relative">
            <Image
              src={intent.qrDataUrl ?? ""}
              alt={`รหัส QR พร้อมเพย์ สำหรับชำระเงิน ${thb(amount)}`}
              width={480}
              height={480}
              unoptimized
              className={`h-auto w-full transition ${
                status === "PENDING" ? "" : "opacity-20 blur-[2px]"
              }`}
            />

            {status === "PENDING" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-2 top-0 h-0.5 animate-aa-scan bg-aa-red/70 shadow-[0_0_12px_2px_rgba(230,0,0,0.5)]"
              />
            )}

            {status === "PAID" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-aa-success">
                <CheckCircle2 className="h-14 w-14" aria-hidden />
                <p className="text-sm font-bold">ชำระเงินสำเร็จ</p>
              </div>
            )}

            {status === "EXPIRED" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-aa-crimson">
                <AlertTriangle className="h-12 w-12" aria-hidden />
                <p className="text-sm font-bold">รหัส QR หมดอายุ</p>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-dashed border-aa-border pt-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-aa-muted">ยอดชำระ</p>
            <p className="text-2xl font-extrabold tabular text-aa-crimson">{thb(amount)}</p>
            <p className="mt-1 text-[10px] text-aa-muted">
              อ้างอิง <span className="tabular font-semibold">{intent.ref}</span>
            </p>
          </div>
        </div>

        {status === "EXPIRED" && (
          <button
            type="button"
            className="aa-btn-primary mt-3 w-full"
            onClick={requestNewCode}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            สร้างรหัส QR ใหม่
          </button>
        )}
      </div>

      <div className="min-w-0">
        <StatusBadge status={status} secondsLeft={secondsLeft} />

        <ol className="mt-4 space-y-3">
          {[
            "เปิดแอปธนาคารบนโทรศัพท์มือถือของคุณ",
            "เลือกเมนู “สแกน” หรือ “สแกน QR” แล้วสแกนรหัสด้านซ้าย",
            `ตรวจสอบชื่อผู้รับเงิน “${intent.merchant.legalNameTh}” และยอดเงิน ${thb(amount)}`,
            "ยืนยันการโอน ระบบจะตรวจสอบและออกบัตรโดยสารให้อัตโนมัติ",
          ].map((step, index) => (
            <li key={step} className="flex gap-3 text-xs leading-relaxed text-aa-muted">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aa-tint text-[11px] font-bold text-aa-crimson">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <SettlementNote
          rows={[
            ["ผู้รับชำระเงิน", intent.merchant.legalNameTh],
            ["เลขประจำตัวผู้เสียภาษี", intent.merchant.taxId],
            ["ช่องทาง", "PromptPay Dynamic QR (EMVCo)"],
            ["ค่าธรรมเนียมร้านค้า", "0.00% (T+0 เรียลไทม์)"],
          ]}
        />

        <details className="mt-3 rounded-xl border border-aa-border bg-white p-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-aa-crimson">
            ดู EMVCo payload ที่เข้ารหัสอยู่ในรหัส QR นี้
          </summary>
          <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-aa-muted">
            {intent.qrPayload}
          </p>
        </details>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  secondsLeft,
}: {
  status: PaymentIntentStatus;
  secondsLeft: number | null;
}) {
  if (status === "PAID") {
    return (
      <p className="aa-chip bg-aa-success/10 text-aa-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        ได้รับเงินแล้ว · กำลังออกบัตรโดยสาร
      </p>
    );
  }

  if (status === "EXPIRED") {
    return (
      <p className="aa-chip bg-aa-red/10 text-aa-crimson">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        รหัส QR หมดอายุแล้ว
      </p>
    );
  }

  const low = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="aa-chip bg-aa-tint text-aa-crimson">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-aa-pulse-ring rounded-full bg-aa-red" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-aa-red" />
        </span>
        <ScanLine className="h-3.5 w-3.5" aria-hidden />
        รอการสแกนและยืนยันการชำระเงิน
      </p>

      <p
        className={`aa-chip tabular ${low ? "bg-aa-red text-white" : "bg-aa-wine/5 text-aa-wine"}`}
        role="timer"
        aria-live="off"
      >
        <Timer className="h-3.5 w-3.5" aria-hidden />
        เหลือเวลา {secondsLeft === null ? "—" : mmss(secondsLeft)} นาที
      </p>
    </div>
  );
}
