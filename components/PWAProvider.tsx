'use client';

import type { ReactNode } from 'react';

export function PWAProvider({ children }: { children: ReactNode }) {
  // PWA registration is now handled in index.tsx for Vite
  // This component is kept for compatibility but does nothing
  return <>{children}</>;
}
