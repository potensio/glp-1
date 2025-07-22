'use client';

import { StackProvider } from '@stackframe/stack';
import { stackClientApp } from '@/stack';

export function Providers({ children }: { children: React.ReactNode }) {
  return <StackProvider app={stackClientApp}>{children}</StackProvider>;
}