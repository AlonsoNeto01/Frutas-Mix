import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './print.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { getStoreSettings } from '@/lib/actions/store-settings';
import type { StoreSettings } from '@/lib/types';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LancheFlow — Delivery de Lanches',
  description: 'Peça seus lanches favoritos online com entrega rápida e prática. LancheFlow, o melhor delivery da região!',
  keywords: ['delivery', 'lanches', 'hambúrguer', 'pedido online', 'entrega'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsResult = await getStoreSettings();
  const settings = settingsResult.data as StoreSettings | null;

  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-[var(--font-inter)] antialiased">
        <ThemeProvider>
          <CartProvider>
            <StoreProvider settings={settings}>
              {children}
            </StoreProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
