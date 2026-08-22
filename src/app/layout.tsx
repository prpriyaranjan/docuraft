import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuCraft | Resume, Biodata & Document Maker",
  description: "Create professional resumes, marriage biodatas, cover letters, and more with DocuCraft's template-first document maker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
