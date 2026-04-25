import { ClientesPageClient } from '@/components/clientes/ClientesPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default function ClientesPage() {
  return <ClientesPageClient />;
}
