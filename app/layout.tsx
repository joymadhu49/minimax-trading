import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MiniMaxClawd (MINI) | Trade on Base',
  description: 'Buy and trade MINI tokens on Base network. The official MiniMaxClawd ecosystem trading platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0f] text-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
