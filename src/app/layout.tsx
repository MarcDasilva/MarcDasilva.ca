import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";

const scriptFont = localFont({
  src: "../components/Script-Regular.ttf",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marc Da Silva",
  icons: {
    icon: "/MD.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={scriptFont.variable}>{children}</body>
    </html>
  );
}
