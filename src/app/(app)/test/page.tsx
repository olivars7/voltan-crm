import TestPageClient from '@/components/test/TestPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prueba de Conexión',
};

export default function TestPage() {
  return <TestPageClient />;
}
