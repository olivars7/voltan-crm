import { LeadsPageClient } from '@/components/leads/LeadsPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads',
};

export default function LeadsPage() {
  return <LeadsPageClient />;
}
