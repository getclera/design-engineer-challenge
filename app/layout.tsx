import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review | Design Engineering Challenge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
