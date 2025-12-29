'use client';

import { useEffect } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  // PWA registration is now handled in index.tsx for Vite
  // This component is kept for compatibility but does nothing
  return <>{children}</>;
}
