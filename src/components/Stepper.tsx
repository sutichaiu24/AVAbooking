"use client";

export type StepId = "search" | "select" | "passenger" | "payment";

const STEPS: Array<{ id: StepId; labelTh: string }> = [
  { id: "search", labelTh: "ค้นหาเที่ยวบิน" },
  { id: "select", labelTh: "เลือกราคา" },
  { id: "passenger", labelTh: "ข้อมูลผู้โดยสาร" },
  { id: "payment", labelTh: "ชำระเงิน" },
];

/**
 * Progression rendered as underlined tabs rather than as a chain of bubbles —
 * the current step is marked by a rule that goes accent, everything else stays
 * quiet.
 */
export function Stepper({ current }: { current: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="flex">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className={[
              "flex flex-1 items-center gap-2.5 border-t-2 pt-3.5 transition-colors",
              active ? "border-aa-red" : done ? "border-aa-rule" : "border-aa-border",
            ].join(" ")}
          >
            <span
              className={[
                "text-[10px] font-bold tabular tracking-widest",
                active ? "text-aa-red" : "text-aa-muted",
              ].join(" ")}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={[
                "hidden truncate text-[11px] font-medium tracking-wide sm:block",
                active ? "text-aa-ink" : "text-aa-muted",
              ].join(" ")}
            >
              {step.labelTh}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
