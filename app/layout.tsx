import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REEL — your film-obsessed friend",
  description: "Meet Connossaurus — a small green dinosaur with impeccable taste. Tell him your mood; he hands you the one film you didn't know you needed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gloock&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
