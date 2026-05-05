import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title:       "FakeLens — AI Fake News Detector",
  description: "Hybrid TF-IDF + ML classification with Explainable AI",
  keywords:    ["fake news", "AI", "machine learning", "NLP", "fact check"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#080b14] antialiased">
        <Navbar />
        <div className="min-h-[calc(100vh-56px)]">{children}</div>
      </body>
    </html>
  );
}
