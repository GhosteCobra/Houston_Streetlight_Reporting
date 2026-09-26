import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "Streetlight Check | Help keep our streets lit",
  description:
    "Prepare and review a streetlight report for your Houston neighborhood. Independent community demo.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
