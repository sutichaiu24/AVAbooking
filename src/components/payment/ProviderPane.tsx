"use client";

import { ArrowUpRight, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

import { thb } from "@/lib/format";
import { MERCHANT } from "@/lib/network";
import type { PaymentMethodId, PaymentProviderSpec } from "@/lib/types";

import { SettlementNote } from "./SettlementNote";

interface Props {
  method: Extract<PaymentMethodId, "mobile_banking" | "ewallet">;
  providers: PaymentProviderSpec[];
  amount: number;
  onSettled: (ref: string, provider: string) => void;
}

type Phase = "idle" | "redirecting" | "authorising" | "done";

/**
 * Shared pane for the two deep-link rails: mobile banking and e-wallets.
 * Both follow the same shape — pick a provider, get handed to the provider's
 * app, come back authorised — so they share one implementation.
 */
export function ProviderPane({ method, providers, amount, onSettled }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const isBanking = method === "mobile_banking";
  const provider = providers.find((p) => p.id === selected);

  async function authorise() {
    if (!selected) return;
    setError(null);

    // Stage one: the browser hands off to the provider's app via deep link.
    setPhase("redirecting");
    await new Promise((resolve) => setTimeout(resolve, 1_200));

    // Stage two: the provider authorises and calls the acquirer back.
    setPhase("authorising");
    try {
      const response = await fetch("/api/payments/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, provider: selected, amount }),
      });
      if (!response.ok) throw new Error("authorize");

      const data: { ref: string } = await response.json();
      setPhase("done");
      setTimeout(() => onSettled(data.ref, selected), 800);
    } catch {
      setPhase("idle");
      setError("การเชื่อมต่อกับผู้ให้บริการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="p-5">
      <p className="text-xs font-semibold text-aa-ink">
        {isBanking ? "เลือกธนาคารของคุณ" : "เลือกกระเป๋าเงินอิเล็กทรอนิกส์"}
      </p>
      <p className="mt-1 text-[13px] text-aa-muted">
        ระบบจะเปิดแอปพลิเคชันของผู้ให้บริการโดยอัตโนมัติผ่าน Deep Link
        โดยไม่ต้องกรอกเลขบัญชีหรือจำนวนเงินเอง
      </p>

      <div className={`mt-4 grid gap-2.5 ${isBanking ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {providers.map((item) => {
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={phase !== "idle"}
              onClick={() => setSelected(item.id)}
              aria-pressed={active}
              className={[
                "flex items-center gap-3 border p-3 text-left transition disabled:opacity-60",
                active
                  ? "border-aa-red bg-aa-tint "
                  : "border-aa-border bg-white hover:border-aa-red/60 hover:bg-aa-tint",
              ].join(" ")}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center text-[13px] font-medium text-white ${item.swatch}`}
                aria-hidden
              >
                {item.mark}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{item.name}</span>
                <span className="block truncate text-[13px] text-aa-muted">{item.nameTh}</span>
              </span>
              {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-aa-red" aria-hidden />}
            </button>
          );
        })}
      </div>

      {provider?.deepLink && (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-aa-muted">
          <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
          {provider.deepLink}?amount={amount.toFixed(2)}&merchant={MERCHANT.merchantId}&ccy=THB
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 bg-aa-red/10 px-3 py-2 text-[13px] font-semibold text-aa-crimson">
          {error}
        </p>
      )}

      <button
        type="button"
        className="aa-btn-primary mt-4 w-full sm:w-auto"
        disabled={!selected || phase !== "idle"}
        onClick={() => void authorise()}
      >
        {phase === "idle" && (
          <>
            <Smartphone className="h-4 w-4" aria-hidden />
            เปิดแอป{provider ? ` ${provider.name}` : ""} เพื่อชำระ {thb(amount)}
          </>
        )}
        {phase === "redirecting" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            กำลังเปิดแอปพลิเคชัน…
          </>
        )}
        {phase === "authorising" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            รอการยืนยันจากผู้ให้บริการ…
          </>
        )}
        {phase === "done" && (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            ชำระเงินสำเร็จ
          </>
        )}
      </button>

      <SettlementNote
        rows={[
          ["ผู้รับชำระเงิน", MERCHANT.legalNameTh],
          ["Merchant ID", MERCHANT.merchantId],
          ["ช่องทาง", isBanking ? "Mobile Banking Deep Link" : "E-Wallet Balance"],
          ["สกุลเงินที่เรียกเก็บ", "THB — ไม่มีการแปลงสกุลเงิน"],
        ]}
      />
    </div>
  );
}
