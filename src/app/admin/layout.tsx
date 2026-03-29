import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from './AdminLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — LancheFlow',
  description: 'Painel administrativo do LancheFlow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
