import type { Metadata, Viewport } from "next";

import "./globals.css";

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
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
