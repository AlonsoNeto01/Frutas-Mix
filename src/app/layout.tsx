import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './print.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LancheFlow — Delivery de Lanches',
  description: 'Peça seus lanches favoritos online com entrega rápida e prática. LancheFlow, o melhor delivery da região!',
  keywords: ['delivery', 'lanches', 'hambúrguer', 'pedido online', 'entrega'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[var(--font-inter)] antialiased">
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
