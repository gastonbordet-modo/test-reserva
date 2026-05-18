import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { SearchProvider } from "./context/SearchContext";

config.autoAddCss = false;

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Modo Reservas",
  description: "Reserva lo que quieras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${redHatDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-home text-text-home">
        <SearchProvider>{children}</SearchProvider>
      </body>
    </html>
  );
}
