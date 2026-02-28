import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halacha AI — Halakhic Research",
  description: "RAG-based halakhic research system for scholars and learners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
