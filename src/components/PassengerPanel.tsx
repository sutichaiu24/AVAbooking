"use client";

import { IdCard, UserRound } from "lucide-react";

import type { Passenger } from "@/lib/types";

interface Props {
  passengers: Passenger[];
  onChange: (index: number, patch: Partial<Passenger>) => void;
  errors: Record<string, string>;
}

const TITLES: Array<Passenger["title"]> = ["MR", "MS", "MRS"];

export function PassengerPanel({ passengers, onChange, errors }: Props) {
  return (
    <section className="aa-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <UserRound className="h-4 w-4 text-aa-red" aria-hidden />
        ข้อมูลผู้โดยสาร
      </h2>
      <p className="mt-1 text-xs text-aa-muted">
        กรอกชื่อ-นามสกุลให้ตรงกับบัตรประชาชนหรือหนังสือเดินทางที่ใช้เดินทาง
      </p>

      <div className="mt-5 space-y-6">
        {passengers.map((passenger, index) => (
          <fieldset key={index} className="rounded-xl border border-aa-border p-4">
            <legend className="px-2 text-xs font-bold text-aa-crimson">
              ผู้โดยสารคนที่ {index + 1} {index === 0 && "(ผู้ติดต่อหลัก)"}
            </legend>

            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-1">
                <label className="aa-label" htmlFor={`title-${index}`}>
                  คำนำหน้า
                </label>
                <select
                  id={`title-${index}`}
                  className="aa-field"
                  value={passenger.title}
                  onChange={(e) =>
                    onChange(index, { title: e.target.value as Passenger["title"] })
                  }
                >
                  {TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                className="sm:col-span-2"
                id={`firstName-${index}`}
                label="ชื่อ (ภาษาอังกฤษ)"
                placeholder="SOMCHAI"
                value={passenger.firstName}
                error={errors[`firstName-${index}`]}
                onChange={(v) => onChange(index, { firstName: v.toUpperCase() })}
              />

              <Field
                className="sm:col-span-3"
                id={`lastName-${index}`}
                label="นามสกุล (ภาษาอังกฤษ)"
                placeholder="JAIDEE"
                value={passenger.lastName}
                error={errors[`lastName-${index}`]}
                onChange={(v) => onChange(index, { lastName: v.toUpperCase() })}
              />

              <Field
                className="sm:col-span-3"
                id={`nationalId-${index}`}
                label="เลขบัตรประชาชน / หนังสือเดินทาง"
                placeholder="1234567890123"
                value={passenger.nationalId}
                error={errors[`nationalId-${index}`]}
                inputMode="numeric"
                onChange={(v) => onChange(index, { nationalId: v })}
              />

              {index === 0 && (
                <>
                  <Field
                    className="sm:col-span-3"
                    id={`mobile-${index}`}
                    label="เบอร์โทรศัพท์มือถือ"
                    placeholder="081-234-5678"
                    value={passenger.mobile}
                    error={errors[`mobile-${index}`]}
                    inputMode="tel"
                    onChange={(v) => onChange(index, { mobile: v })}
                  />
                  <Field
                    className="sm:col-span-6"
                    id={`email-${index}`}
                    label="อีเมลสำหรับรับบัตรโดยสาร"
                    placeholder="somchai@example.com"
                    value={passenger.email}
                    error={errors[`email-${index}`]}
                    type="email"
                    onChange={(v) => onChange(index, { email: v })}
                  />
                </>
              )}
            </div>
          </fieldset>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-aa-tint p-3 text-[11px] leading-snug text-aa-muted">
        <IdCard className="mt-px h-3.5 w-3.5 shrink-0 text-aa-crimson" aria-hidden />
        ข้อมูลผู้โดยสารถูกจัดเก็บและประมวลผลภายในประเทศไทยตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
        (PDPA) ก่อนส่งต่อไปยังระบบสำรองที่นั่งเพื่อออกบัตรโดยสาร
      </p>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  inputMode,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  inputMode?: "numeric" | "tel";
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="aa-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className={`aa-field ${error ? "border-aa-red ring-2 ring-aa-red/20" : ""}`}
        placeholder={placeholder}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="mt-1 text-[11px] font-semibold text-aa-red">{error}</p>}
    </div>
  );
}
