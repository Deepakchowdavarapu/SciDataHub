import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/common/Navigation";

export const metadata: Metadata = {
  title: "SciDataHub - Scientific Data Collection Platform",
  description: "A platform for collecting, validating, and retrieving scientific or academic data for researchers and citizen scientists.",
  keywords: "scientific data, research, citizen science, data collection, validation",
  authors: [{ name: "Ch Deepak, T Naresh Kumar" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <div id="root">
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
