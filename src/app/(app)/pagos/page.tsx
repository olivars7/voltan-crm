import { PagosPageClient } from '@/components/pagos/PagosPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagos',
};

export default function PagosPage() {
  return <PagosPageClient />;
}
