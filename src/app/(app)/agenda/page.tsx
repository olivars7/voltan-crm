import { AgendaPageClient } from '@/components/agenda/AgendaPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda',
};

export default function AgendaPage() {
  return <AgendaPageClient />;
}
