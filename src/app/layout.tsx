import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './print.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { getStoreSettings } from '@/lib/actions/store-settings';
import type { StoreSettings } from '@/lib/types';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import { getSupabaseImageUrl } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settingsResult = await getStoreSettings();
  const settings = settingsResult.data as StoreSettings | null;
  const logoUrl = getSupabaseImageUrl(settings?.logo_url) || '/favicon.ico';

  return {
    title: 'Frutas Mix — Delivery de Frutas Cortadas',
    description: 'Peça seu copo tropical com frutas frescas cortadas, sucos naturais e pudim. Delivery rápido e prático. Frutas Mix!',
    keywords: ['frutas', 'delivery', 'frutas cortadas', 'copo tropical', 'suco natural', 'abacaxi', 'manga', 'melancia', 'pudim'],
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    },
  };
}

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
              <ActiveOrderBanner />
            </StoreProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
