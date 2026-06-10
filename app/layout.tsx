import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REEL — your film-obsessed friend",
  description: "Meet Connossaurus — a small green dinosaur with impeccable taste. Tell him your mood; he hands you the one film you didn't know you needed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="velvet">
      <body>{children}</body>
    </html>
  );
}
