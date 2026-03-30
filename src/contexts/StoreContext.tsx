'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { StoreSettings } from '@/lib/types';

interface StoreContextType {
  storeName: string;
  logoUrl: string | null;
}

const StoreContext = createContext<StoreContextType>({
  storeName: 'LancheFlow',
  logoUrl: null,
});

export function StoreProvider({
  settings,
  children,
}: {
  settings: StoreSettings | null;
  children: ReactNode;
}) {
  return (
    <StoreContext.Provider
      value={{
        storeName: settings?.store_name || 'LancheFlow',
        logoUrl: settings?.logo_url || null,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
