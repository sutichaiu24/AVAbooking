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
    <section>
      <header className="border-b border-aa-border pb-4">
        <h2 className="text-[26px] font-light tracking-tight">เลือกวิธีชำระเงิน</h2>
        <p className="mt-2 max-w-2xl text-[13px] font-light leading-relaxed text-aa-muted">
          ทุกช่องทางเรียกเก็บเป็นเงินบาทและรับชำระโดยนิติบุคคลในประเทศไทย
          ผู้ถือบัตรไทยจึงไม่ถูกเรียกเก็บค่าธรรมเนียมข้ามประเทศ
        </p>
      </header>

      <div className="divide-y divide-aa-border border-b border-aa-border">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.id];
          const expanded = open === method.id;

          return (
            <div key={method.id}>
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(method.id)}
                  aria-expanded={expanded}
                  aria-controls={`pane-${method.id}`}
                  disabled={disabled}
                  className="group flex w-full items-center gap-5 py-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon
                    className={[
                      "h-5 w-5 shrink-0 transition-colors",
                      expanded ? "text-aa-red" : "text-aa-muted group-hover:text-aa-ink",
                    ].join(" ")}
                    aria-hidden
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-3">
                      <span className="text-[16px] font-medium">{method.nameTh}</span>
                      {method.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-aa-success">
                          <Sparkles className="mr-1 inline h-2.5 w-2.5" aria-hidden />
                          ยืนยันทันที
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[13px] font-light leading-relaxed text-aa-muted">
                      {method.blurb}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-right sm:block">
                    <span className="aa-eyebrow block">Settlement</span>
                    <span className="mt-1 block text-[13px] font-medium text-aa-graphite">
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
                <div id={`pane-${method.id}`} className="animate-aa-rise border-t border-aa-border bg-aa-tint">
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

      <footer className="flex flex-wrap items-baseline justify-between gap-3 py-5">
        <span className="aa-eyebrow">ยอดที่ต้องชำระ</span>
        <span className="text-[27px] font-light tabular leading-none tracking-tight">
          {thb(quote.total)}
        </span>
      </footer>
    </section>
  );
}
