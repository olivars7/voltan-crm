import ConsolePageClient from '@/components/console/ConsolePageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consola',
};

export default function ConsolePage() {
  return <ConsolePageClient />;
}
