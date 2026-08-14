# Thai AirAsia — Local Booking & Payment Orchestration (PoC)

A localized booking and payment front-end for **Thai AirAsia (FD)** domestic sectors,
demonstrating 100% THB settlement into the local merchant entity
(**บริษัท ไทยแอร์เอเชีย จำกัด**) with a real-time sync back to HQ's Navitaire PSS.

> **Proof of concept.** Flight schedules, fares, the merchant tax ID, PNRs and all
> payment transactions are mock data. Nothing here moves money or issues a valid
> travel document.

```bash
npm install
npm run dev     # http://localhost:3000
```

Requires Node 18.17+. See [`CLAUDE.md`](./CLAUDE.md) for the full module and
architecture breakdown.

---

## What it demonstrates

| Objective | How it shows up |
| --- | --- |
| Eliminate the 1% cross-border card fee | Fare summary and confirmation both itemise the fee the passenger *doesn't* pay |
| Capture revenue in the Thai entity | Every payment rail settles to the same THB merchant of record, shown inline on each rail |
| Support local payment behaviour | PromptPay QR, mobile-banking deep links, domestic card acquiring, TrueMoney / ShopeePay |
| Keep HQ systems unchanged | A BFF layer commits the paid booking to Navitaire and receives the PNR back |

## The four payment rails

1. **PromptPay Dynamic QR** — a genuine EMVCo payload (nested tag 29, THB currency,
   fixed amount, merchant reference, CRC-16/CCITT-FALSE) rendered as a scannable PNG,
   with a five-minute countdown and automatic verification by polling the acquirer.
2. **Mobile Banking** — K PLUS, SCB EASY, Krungthai NEXT, Bualuang mBanking, with the
   deep-link URL shown as it would be constructed.
3. **Local Card** — domestic Visa / Mastercard under the Thai merchant ID, with a
   3-D Secure step-up and a side-by-side comparison against cross-border processing.
4. **E-Wallets** — TrueMoney Wallet and ShopeePay.

## Booking funnel

`Search → Fare → Passengers → Payment → PSS commit → e-ticket`

The confirmation step replays the four upstream Navitaire calls
(`session.open`, `booking.sell`, `payment.attach`, `booking.commit`), issues a mock
PNR, and offers a downloadable PDF e-ticket generated in-browser.

## API surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/flights/search` | POST | Mock Navitaire availability |
| `/api/payments/promptpay` | POST | Create a dynamic QR intent (returns payload + PNG) |
| `/api/payments/status` | GET | Poll intent status (`PENDING` / `PAID` / `EXPIRED`) |
| `/api/payments/authorize` | POST | Authorise card, banking and wallet rails |
| `/api/pss/v1/commit-booking` | POST | Commit the paid booking, return the PNR |

Settlement state lives on the server. `commit-booking` returns **409
`PAYMENT_NOT_SETTLED`** if the referenced payment intent has not yet been paid, so
the confirmation cannot be reached by client-side state alone.

## A note on the savings figure

The headline "฿120–฿250 saved per booking" is not hardcoded — it is computed in
`src/lib/pricing.ts` as the sum of two issuer-side charges the passenger avoids:

- **1.0%** cross-border interchange surcharge
- **~2.5%** issuer FX / DCC markup on a non-THB settlement

That is ~3.5% of the basket, so the figure scales with the booking: a single Value
Fare saves around ฿30, while a typical two-passenger or Premium Flex booking lands in
the ฿120–฿250 range quoted to the executive audience. Both charges are levied by the
card issuer rather than the airline, which is why they never appear on the fare
breakdown itself.

## Verification performed

- `npm run build`, `npm run typecheck` and `npm run lint` all pass clean.
- The CRC-16/CCITT-FALSE implementation matches the standard `0x29B1` check value.
- Generated PromptPay payloads round-trip through an independent TLV parser with a
  valid checksum.
- The full funnel was driven end-to-end in Chromium across the PromptPay and
  mobile-banking rails, with no console errors and no horizontal overflow at 390px.
- The generated PDF passes a structural audit: resolving xref offsets, matching
  stream `/Length`, balanced `BT`/`ET`, and correctly escaped string literals.
