import { orgRoutes } from "@clera/route-factory";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import type React from "react";

const THEMED_ROUTE_PREFIXES = [orgRoutes.root];

const THEME_BOOTSTRAP_SCRIPT = `try{if(${JSON.stringify(THEMED_ROUTE_PREFIXES)}.some(function(p){return location.pathname===p||location.pathname.indexOf(p+"/")===0})&&localStorage.getItem("v2-theme")==="dark"){document.documentElement.setAttribute("data-v2-theme","dark");document.documentElement.style.colorScheme="dark"}}catch(e){}`;

export const metadata: Metadata = {
  title: "Clera",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistMono.variable} font-sans`}>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme must apply before first paint to avoid a light flash
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
