# ✈️ Thai AirAsia Local Booking & Payment Orchestration System (PoC)

## 📌 Project Vision & Executive Objective

A high-converting, localized Front-End Booking & Payment Orchestration Layer
("หน้ากากจองตั๋วเฉพาะตลาดไทย") for **Thai AirAsia (FD)**.

This PoC demonstrates how Thai AirAsia can capture 100% THB revenue into its local
merchant entity (**บจ. ไทยแอร์เอเชีย**), eliminate the 1% cross-border credit card fee
for Thai passengers, support local payment rails (PromptPay, Mobile Banking, TrueMoney),
and sync booking tokens back to HQ's Navitaire PSS via API.

---

## 🎨 Theme & Brand Styling (AirAsia Crimson Palette)

Defined once in `tailwind.config.ts` under the `aa-*` namespace. No component
hard-codes a hex value.

| Token              | Hex       | Usage                             |
| ------------------ | --------- | --------------------------------- |
| `aa-red`           | `#E60000` | Primary brand red, CTAs           |
| `aa-crimson`       | `#990000` | Hero gradient start, headings     |
| `aa-crimson-dark`  | `#7A0000` | Hero gradient mid                 |
| `aa-wine`          | `#4A0000` | Deep accent, footer, overlays     |
| `aa-tint`          | `#FFF5F5` | Page background, soft fills       |
| `aa-border`        | `#F5C2C2` | Card borders & dividers           |
| `aa-ink`           | `#1E1E1E` | Primary text                      |
| `aa-muted`         | `#666666` | Secondary text                    |
| `aa-success`       | `#059669` | Local-settlement success badges   |

Gradients `bg-aa-hero` and `bg-aa-cta` compose the crimson ramp.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **Styling:** Tailwind CSS 3.4 with the Crimson theme
- **Icons:** Lucide React
- **QR:** `qrcode` — renders a spec-compliant EMVCo payload built in-repo
- **Architecture:** Backend-For-Frontend (BFF) route handlers fronting a mock
  Navitaire PSS

```
Thai passenger
  → Local Booking UI (Next.js, this repo)
    → BFF Orchestrator (/api/*)
      → Thai acquirer (2C2P / Omise mock)     ← money settles here, in THB
        → บจ. ไทยแอร์เอเชีย treasury account
      → Navitaire PSS (HQ, mock)              ← booking + e-ticket issued here
```

---

## 🚀 Functional Modules

### 1. 📊 Executive Value Banner — `src/components/ExecutiveValueBanner.tsx`

Sticky top strip carrying the three executive metrics: **0% cross-border fee**,
**+18% conversion target**, **100% THB local treasury settlement**. Collapses to a
single tappable summary line on mobile.

### 2. 🛫 Localized Flight Search & Fare Selection

- `src/components/SearchPanel.tsx` — DMK ⇄ CNX / HKT / HDY / CEI / UTH
- `src/components/FlightList.tsx` — Value Fare vs Premium Flex, priced side by side
- `src/lib/pricing.ts` — Base Fare + Airport Tax (PSC) + Booking Fee + VAT 7%

VAT is levied on the fare plus booking fee; the PSC is collected on behalf of the
airport operator and sits outside the VAT base.

### 3. 💳 Thai Payment Orchestration — `src/components/payment/`

| Rail | Component | Behaviour |
| ---- | --------- | --------- |
| PromptPay Dynamic QR | `PromptPayPane.tsx` | Real EMVCo payload, 5-min countdown, server-side status polling → auto-confirm |
| Mobile Banking | `ProviderPane.tsx` | K PLUS, SCB EASY, Krungthai NEXT, Bualuang — deep-link handoff |
| Local Card | `LocalCardPane.tsx` | Domestic acquiring under the Thai merchant ID, 3-D Secure step-up, side-by-side cost comparison vs cross-border |
| E-Wallets | `ProviderPane.tsx` | TrueMoney Wallet, ShopeePay |

Every rail renders the same `SettlementNote` — the point being that all four land in
the same Thai entity, in THB.

### 4. 🎟️ PSS Sync & E-Ticket — `src/components/ConfirmationModal.tsx`

Posts to `/api/pss/v1/commit-booking`, replays the four upstream Navitaire calls as a
live trace, issues a mock PNR (`FD-XXXXXX`), lists e-tickets, shows the savings
breakdown, and downloads a real PDF e-ticket generated in `src/lib/eticket.ts`.

---

## 📁 Layout

```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   └── api/
│       ├── flights/search/route.ts          POST  availability
│       ├── payments/promptpay/route.ts      POST  create dynamic QR intent
│       ├── payments/status/route.ts         GET   poll intent status
│       ├── payments/authorize/route.ts      POST  card / banking / wallet
│       └── pss/v1/commit-booking/route.ts   POST  commit to Navitaire
├── components/
│   ├── ExecutiveValueBanner, SiteHeader, Stepper
│   ├── BookingFlow            ← state machine for the whole funnel
│   ├── SearchPanel, FlightList, FareSummary, PassengerPanel
│   ├── ConfirmationModal
│   └── payment/               ← PaymentPanel + the four rails
└── lib/
    ├── types.ts        shared domain model
    ├── network.ts      airports, sectors, fare brands, merchant identity
    ├── pricing.ts      quote + savings maths
    ├── promptpay.ts    EMVCo TLV builder + CRC-16/CCITT-FALSE
    ├── inventory.ts    deterministic mock schedule
    ├── intent-store.ts in-memory acquirer ledger
    ├── payments.ts     rail + provider catalogue
    ├── eticket.ts      hand-built PDF writer
    └── format.ts       THB / Thai date / countdown formatting
```

---

## 🔑 Implementation Notes

**PromptPay payloads are real.** `src/lib/promptpay.ts` implements the EMVCo
merchant-presented TLV format profiled by the Bank of Thailand, including the nested
tag 29 account template and a CRC-16/CCITT-FALSE checksum (verified against the
standard `0x29B1` check value for `"123456789"`). The generated codes parse correctly
in a TLV reader; they point at a **mock** merchant tax ID and will not move money.

**Determinism.** `inventory.ts` seeds a xorshift PRNG from the query, so the same
search always returns the same schedule. This keeps server and client markup in
agreement and makes the demo reproducible.

**Settlement is server-authoritative.** The QR pane does not fake its own success:
`/api/payments/status` advances `PENDING → PAID` after a simulated acquirer delay,
and `/api/pss/v1/commit-booking` returns **409** if asked to commit a booking whose
payment has not settled.

**All money figures are mock.** Tax ID, merchant ID, fares and PNRs are placeholders,
not the airline's real registrations.

---

## 💻 Running It

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint
```
