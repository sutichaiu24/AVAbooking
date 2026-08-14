import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";

import "./globals.css";

/**
 * Anuphan carries both the Thai and the Latin.
 *
 * Thai typography splits on whether the letters keep their loops: looped faces
 * read as officialdom, near-loopless ones as contemporary. Anuphan sits at the
 * loopless end and holds a genuine 300 weight, which is what the display
 * headings are set in — the system Thai fallbacks have no light weight at all,
 * so the browser was synthesising one and the type came out heavier and
 * blotchier than the design asks for.
 *
 * next/font self-hosts the files at build time, so there is no font CDN at
 * runtime and no layout shift while it loads.
 */
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thai AirAsia | จองบัตรโดยสาร ชำระเงินในประเทศ 100%",
  description:
    "ระบบจองและชำระเงินเฉพาะตลาดไทยของสายการบินไทยแอร์เอเชีย รองรับพร้อมเพย์ โมบายแบงก์กิ้ง และบัตรในประเทศ ไม่มีค่าธรรมเนียมข้ามประเทศ",
};

export const viewport: Viewport = {
  themeColor: "#990000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={anuphan.variable}>
      <body>{children}</body>
    </html>
  );
}
