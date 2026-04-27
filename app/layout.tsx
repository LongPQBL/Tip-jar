import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tip jar",
  description: "send xlm tips on stellar testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
