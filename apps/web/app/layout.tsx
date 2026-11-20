import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5S - FiveM Sunucu İstihbaratı',
  description: '5S ile FiveM sunucularını keşfedin, karşılaştırın ve yönetin.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
