import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Streetlight Check • Houston",
  description:
    "A little light makes a big difference. Prepare a streetlight report, one photo at a time.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
