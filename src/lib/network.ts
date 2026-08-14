import type { Airport, AirportCode, FareBrandSpec, MerchantIdentity } from "./types";

/**
 * Thai domestic network served out of Don Mueang (DMK) — the sectors that
 * generate the bulk of Thai AirAsia's THB-denominated point-of-sale revenue.
 */
export const AIRPORTS: Record<AirportCode, Airport> = {
  DMK: {
    code: "DMK",
    city: "Bangkok",
    cityTh: "กรุงเทพฯ",
    name: "Don Mueang International",
    nameTh: "ท่าอากาศยานดอนเมือง",
    psc: 100,
  },
  CNX: {
    code: "CNX",
    city: "Chiang Mai",
    cityTh: "เชียงใหม่",
    name: "Chiang Mai International",
    nameTh: "ท่าอากาศยานเชียงใหม่",
    psc: 100,
  },
  HKT: {
    code: "HKT",
    city: "Phuket",
    cityTh: "ภูเก็ต",
    name: "Phuket International",
    nameTh: "ท่าอากาศยานภูเก็ต",
    psc: 100,
  },
  HDY: {
    code: "HDY",
    city: "Hat Yai",
    cityTh: "หาดใหญ่",
    name: "Hat Yai International",
    nameTh: "ท่าอากาศยานหาดใหญ่",
    psc: 100,
  },
  CEI: {
    code: "CEI",
    city: "Chiang Rai",
    cityTh: "เชียงราย",
    name: "Mae Fah Luang – Chiang Rai",
    nameTh: "ท่าอากาศยานแม่ฟ้าหลวง เชียงราย",
    psc: 100,
  },
  UTH: {
    code: "UTH",
    city: "Udon Thani",
    cityTh: "อุดรธานี",
    name: "Udon Thani International",
    nameTh: "ท่าอากาศยานอุดรธานี",
    psc: 100,
  },
};

export const AIRPORT_LIST: Airport[] = Object.values(AIRPORTS);

/** Published sector economics: block time and the lead-in one-way base fare. */
interface SectorSpec {
  blockMin: number;
  leadInFare: number;
  /** Daily rotations — drives how many departures the search returns. */
  frequency: number;
}

const SECTORS: Record<string, SectorSpec> = {
  "DMK-CNX": { blockMin: 80, leadInFare: 690, frequency: 6 },
  "DMK-HKT": { blockMin: 95, leadInFare: 790, frequency: 6 },
  "DMK-HDY": { blockMin: 90, leadInFare: 750, frequency: 5 },
  "DMK-CEI": { blockMin: 80, leadInFare: 720, frequency: 4 },
  "DMK-UTH": { blockMin: 65, leadInFare: 640, frequency: 5 },
};

export function sectorKey(origin: AirportCode, destination: AirportCode): string {
  const direct = `${origin}-${destination}`;
  if (SECTORS[direct]) return direct;
  const reverse = `${destination}-${origin}`;
  if (SECTORS[reverse]) return reverse;
  return direct;
}

export function getSector(origin: AirportCode, destination: AirportCode): SectorSpec {
  return SECTORS[sectorKey(origin, destination)] ?? { blockMin: 85, leadInFare: 760, frequency: 4 };
}

/** Every sector the PoC can price, expressed in both directions. */
export const ROUTES: Array<{ origin: AirportCode; destination: AirportCode }> = Object.keys(
  SECTORS,
).flatMap((key) => {
  const [origin, destination] = key.split("-") as [AirportCode, AirportCode];
  return [
    { origin, destination },
    { origin: destination, destination: origin },
  ];
});

export const FARE_BRANDS: Record<string, FareBrandSpec> = {
  VALUE: {
    id: "VALUE",
    name: "Value Fare",
    nameTh: "ราคาประหยัด",
    tagline: "ราคาต่ำสุด สำหรับผู้เดินทางที่วางแผนล่วงหน้า",
    multiplier: 1,
    baggageKg: 7,
    changeable: false,
    refundable: false,
    inclusions: [
      "สัมภาระถือขึ้นเครื่อง 7 กก.",
      "เลือกที่นั่งแบบสุ่ม",
      "เช็คอินออนไลน์ฟรี",
    ],
  },
  PREMIUM_FLEX: {
    id: "PREMIUM_FLEX",
    name: "Premium Flex",
    nameTh: "พรีเมียมเฟล็กซ์",
    tagline: "เปลี่ยนเที่ยวบินได้ไม่จำกัด พร้อมสัมภาระและอาหาร",
    multiplier: 1.72,
    baggageKg: 20,
    changeable: true,
    refundable: true,
    inclusions: [
      "สัมภาระโหลดใต้ท้องเครื่อง 20 กก.",
      "เลือกที่นั่ง Hot Seat ฟรี",
      "อาหารร้อนบนเครื่อง 1 มื้อ",
      "เปลี่ยนเที่ยวบินไม่จำกัดจำนวนครั้ง",
      "Xpress Boarding",
    ],
  },
};

export const FARE_BRAND_LIST: FareBrandSpec[] = [
  FARE_BRANDS.VALUE,
  FARE_BRANDS.PREMIUM_FLEX,
];

/**
 * The local merchant of record. Every figure here is mock data for the PoC —
 * the tax ID and merchant ID are placeholders, not the airline's real
 * registration numbers.
 */
export const MERCHANT: MerchantIdentity = {
  legalName: "Thai AirAsia Co., Ltd.",
  legalNameTh: "บริษัท ไทยแอร์เอเชีย จำกัด",
  taxId: "0105546000001",
  merchantId: "TH-FD-MERCH-004821",
  acquirer: "2C2P (Thailand) / Omise",
  settlementBank: "Kasikornbank (KBANK)",
  settlementCurrency: "THB",
};
