import type { PaymentMethodSpec, PaymentProviderSpec } from "./types";

/**
 * The local rails the orchestration layer exposes. Every one of them settles
 * into the Thai merchant entity in THB — no cross-border leg, no FX.
 */
export const PAYMENT_METHODS: PaymentMethodSpec[] = [
  {
    id: "promptpay",
    name: "PromptPay QR",
    nameTh: "พร้อมเพย์ (QR Code)",
    blurb: "สแกนจ่ายผ่านแอปธนาคารใดก็ได้ ยืนยันอัตโนมัติภายในไม่กี่วินาที",
    mdr: 0,
    settlementDays: "T+0 (เรียลไทม์)",
    recommended: true,
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    nameTh: "โมบายแบงก์กิ้ง",
    blurb: "เปิดแอปธนาคารอัตโนมัติผ่าน Deep Link ไม่ต้องกรอกเลขบัญชี",
    mdr: 0.35,
    settlementDays: "T+1",
  },
  {
    id: "local_card",
    name: "Local Card",
    nameTh: "บัตรเครดิต/เดบิตในประเทศ",
    blurb: "ตัดบัตรในประเทศภายใต้ Merchant ID ของไทยแอร์เอเชีย ไม่มีค่าธรรมเนียมต่างประเทศ",
    mdr: 1.55,
    settlementDays: "T+2",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    nameTh: "กระเป๋าเงินอิเล็กทรอนิกส์",
    blurb: "จ่ายด้วยยอดคงเหลือในวอลเล็ต พร้อมรับพอยต์สะสมจากผู้ให้บริการ",
    mdr: 1.2,
    settlementDays: "T+1",
  },
];

export const BANK_PROVIDERS: PaymentProviderSpec[] = [
  {
    id: "kbank",
    name: "K PLUS",
    nameTh: "เค พลัส (กสิกรไทย)",
    mark: "K+",
    swatch: "bg-[#138F2D]",
    deepLink: "kplus://payment",
  },
  {
    id: "scb",
    name: "SCB EASY",
    nameTh: "เอสซีบี อีซี่ (ไทยพาณิชย์)",
    mark: "SCB",
    swatch: "bg-[#4E2E7F]",
    deepLink: "scbeasy://payment",
  },
  {
    id: "ktb",
    name: "Krungthai NEXT",
    nameTh: "กรุงไทย เน็กซ์",
    mark: "KTB",
    swatch: "bg-[#00A6E2]",
    deepLink: "ktbnext://payment",
  },
  {
    id: "bbl",
    name: "Bualuang mBanking",
    nameTh: "บัวหลวง เอ็มแบงก์กิ้ง",
    mark: "BBL",
    swatch: "bg-[#1E4598]",
    deepLink: "bualuang://payment",
  },
];

export const WALLET_PROVIDERS: PaymentProviderSpec[] = [
  {
    id: "truemoney",
    name: "TrueMoney Wallet",
    nameTh: "ทรูมันนี่ วอลเล็ท",
    mark: "TMN",
    swatch: "bg-[#F04E23]",
    deepLink: "truemoney://pay",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    nameTh: "ช้อปปี้เพย์",
    mark: "SPay",
    swatch: "bg-[#EE4D2D]",
    deepLink: "shopeepay://pay",
  },
];

export function findProvider(id: string): PaymentProviderSpec | undefined {
  return [...BANK_PROVIDERS, ...WALLET_PROVIDERS].find((p) => p.id === id);
}

export function findMethod(id: string): PaymentMethodSpec | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
