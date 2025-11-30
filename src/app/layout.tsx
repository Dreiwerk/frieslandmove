import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrieslandMove - Schülerbeförderung',
  description: 'Webbasierte SaaS-Plattform für die Schülerbeförderung des Landkreises Friesland',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
