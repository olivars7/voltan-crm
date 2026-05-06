import DashboardPageClient from '@/components/dashboard/DashboardPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'General',
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
