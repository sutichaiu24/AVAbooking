"use client";

import { Check } from "lucide-react";

export type StepId = "search" | "select" | "passenger" | "payment";

const STEPS: Array<{ id: StepId; label: string; labelTh: string }> = [
  { id: "search", label: "Search", labelTh: "ค้นหาเที่ยวบิน" },
  { id: "select", label: "Fare", labelTh: "เลือกราคา" },
  { id: "passenger", label: "Passenger", labelTh: "ข้อมูลผู้โดยสาร" },
  { id: "payment", label: "Payment", labelTh: "ชำระเงิน" },
];

export function Stepper({ current }: { current: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="flex items-center gap-1.5 sm:gap-3">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li key={step.id} className="flex flex-1 items-center gap-1.5 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                  done
                    ? "bg-aa-success text-white"
                    : active
                      ? "bg-aa-red text-white ring-4 ring-aa-red/15"
                      : "border border-aa-border bg-white text-aa-muted",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={[
                  "hidden truncate text-xs font-semibold sm:block",
                  active ? "text-aa-crimson" : done ? "text-aa-success" : "text-aa-muted",
                ].join(" ")}
              >
                {step.labelTh}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`h-px flex-1 ${done ? "bg-aa-success/40" : "bg-aa-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
