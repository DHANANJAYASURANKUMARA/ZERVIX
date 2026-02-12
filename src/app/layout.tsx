import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Zervix | Next-Gen Digital Marketplace",
  description: "Zervix is a premium freelancing platform for fullstack digital services and items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ paddingTop: '100px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
