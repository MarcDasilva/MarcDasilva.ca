import "./globals.css";
import localFont from "next/font/local";

const scriptFont = localFont({
  src: "../components/Script-Regular.ttf",
  variable: "--font-script",
  display: "swap",
});

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
