import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from './AdminLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Frutas Mix',
  description: 'Painel administrativo do Frutas Mix',
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
