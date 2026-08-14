"use client";

import {
  ChevronDown,
  CreditCard,
  QrCode,
  Smartphone,
  Wallet,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { thb } from "@/lib/format";
import { BANK_PROVIDERS, PAYMENT_METHODS, WALLET_PROVIDERS } from "@/lib/payments";
import type { FareQuote, PaymentMethodId } from "@/lib/types";

import { LocalCardPane } from "./LocalCardPane";
import { PromptPayPane } from "./PromptPayPane";
import { ProviderPane } from "./ProviderPane";

export interface SettledPayment {
  ref: string;
  method: PaymentMethodId;
  provider?: string;
  amount: number;
}

interface Props {
  quote: FareQuote;
  onSettled: (payment: SettledPayment) => void;
  disabled?: boolean;
}

const ICONS: Record<PaymentMethodId, typeof QrCode> = {
  promptpay: QrCode,
  mobile_banking: Smartphone,
  local_card: CreditCard,
  ewallet: Wallet,
};

/**
 * The orchestration layer's front door: one accordion, four local rails, one
 * settlement destination. Opening a pane is what provisions the underlying
 * payment intent, so only one rail is ever live at a time.
 */
export function PaymentPanel({ quote, onSettled, disabled = false }: Props) {
  const [open, setOpen] = useState<PaymentMethodId | null>("promptpay");

  function toggle(id: PaymentMethodId) {
    if (disabled) return;
    setOpen((current) => (current === id ? null : id));
  }

  return (
    <section className="aa-card overflow-hidden">
      <header className="border-b border-aa-border px-5 py-4">
        <h2 className="text-base font-bold">เลือกวิธีชำระเงิน</h2>
        <p className="mt-1 text-xs text-aa-muted">
          ทุกช่องทางเรียกเก็บเป็นเงินบาทและรับชำระโดยนิติบุคคลในประเทศไทย
          ผู้ถือบัตรไทยจึงไม่ถูกเรียกเก็บค่าธรรมเนียมข้ามประเทศ
        </p>
      </header>

      <div className="divide-y divide-aa-border">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.id];
          const expanded = open === method.id;

          return (
            <div key={method.id} className={expanded ? "bg-aa-tint/40" : "bg-white"}>
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(method.id)}
                  aria-expanded={expanded}
                  aria-controls={`pane-${method.id}`}
                  disabled={disabled}
                  className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-aa-tint/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                      expanded ? "bg-aa-cta text-white" : "bg-aa-tint text-aa-crimson",
                    ].join(" ")}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">{method.nameTh}</span>
                      {method.recommended && (
                        <span className="aa-chip bg-aa-success/10 py-0.5 text-[10px] text-aa-success">
                          <Sparkles className="h-3 w-3" aria-hidden />
                          แนะนำ · ยืนยันทันที
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-aa-muted">
                      {method.blurb}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="block text-[10px] uppercase tracking-wide text-aa-muted">
                      Settlement
                    </span>
                    <span className="block text-[11px] font-bold text-aa-success">
                      {method.settlementDays}
                    </span>
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-aa-muted transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
              </h3>

              {expanded && (
                <div id={`pane-${method.id}`} className="animate-aa-rise border-t border-aa-border bg-white">
                  {method.id === "promptpay" && (
                    <PromptPayPane
                      amount={quote.total}
                      onSettled={(ref) =>
                        onSettled({ ref, method: "promptpay", amount: quote.total })
                      }
                    />
                  )}

                  {method.id === "mobile_banking" && (
                    <ProviderPane
                      method="mobile_banking"
                      providers={BANK_PROVIDERS}
                      amount={quote.total}
                      onSettled={(ref, provider) =>
                        onSettled({ ref, method: "mobile_banking", provider, amount: quote.total })
                      }
                    />
                  )}

                  {method.id === "local_card" && (
                    <LocalCardPane
                      amount={quote.total}
                      savedCrossBorderFee={quote.savings.crossBorderFee}
                      onSettled={(ref) =>
                        onSettled({ ref, method: "local_card", amount: quote.total })
                      }
                    />
                  )}

                  {method.id === "ewallet" && (
                    <ProviderPane
                      method="ewallet"
                      providers={WALLET_PROVIDERS}
                      amount={quote.total}
                      onSettled={(ref, provider) =>
                        onSettled({ ref, method: "ewallet", provider, amount: quote.total })
                      }
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-baseline justify-between gap-2 border-t border-aa-border bg-aa-tint px-5 py-3.5">
        <span className="text-xs font-semibold text-aa-muted">ยอดที่ต้องชำระ</span>
        <span className="text-xl font-extrabold tabular text-aa-crimson">{thb(quote.total)}</span>
      </footer>
    </section>
  );
}
