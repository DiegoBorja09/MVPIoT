import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MVPMixer - IoT Dashboard',
  description: 'IoT monitoring dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
