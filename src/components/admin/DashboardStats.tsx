'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface DashboardStatsProps {
  initialOrders: Order[];
}

export default function DashboardStats({ initialOrders }: DashboardStatsProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Realtime subscription to keep stats updated
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? ({ ...o, ...payload.new } as Order) : o))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const now = new Date();

  // Filter only completed orders for earnings, but all orders for volume
  const completedOrders = orders.filter((o) => o.status === 'concluido');

  // Daily Stats
  const dailyOrders = orders.filter((o) => isSameDay(parseISO(o.created_at), now));
  const dailyEarnings = completedOrders
    .filter((o) => isSameDay(parseISO(o.created_at), now))
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Weekly Stats
  const weeklyOrders = orders.filter((o) => isSameWeek(parseISO(o.created_at), now, { weekStartsOn: 0 }));
  const weeklyEarnings = completedOrders
    .filter((o) => isSameWeek(parseISO(o.created_at), now, { weekStartsOn: 0 }))
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Monthly Stats
  const monthlyOrders = orders.filter((o) => isSameMonth(parseISO(o.created_at), now));
  const monthlyEarnings = completedOrders
    .filter((o) => isSameMonth(parseISO(o.created_at), now))
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Chart Data (Last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(now, 6 - i);
    const dayOrders = orders.filter((o) => isSameDay(parseISO(o.created_at), date));
    
    return {
      name: format(date, 'EE', { locale: ptBR }),
      pedidos: dayOrders.length,
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Hoje"
          orders={dailyOrders.length}
          earnings={dailyEarnings}
          icon="📅"
          color="blue"
        />
        <StatCard
          title="Esta Semana"
          orders={weeklyOrders.length}
          earnings={weeklyEarnings}
          icon="📆"
          color="orange"
        />
        <StatCard
          title="Este Mês"
          orders={monthlyOrders.length}
          earnings={monthlyEarnings}
          icon="📈"
          color="green"
        />
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span>📊</span> Frequência de Pedidos (Últimos 7 dias)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280' }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#6b7280' }} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="pedidos" 
                name="Pedidos"
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, orders, earnings, icon, color }: { title: string, orders: number, earnings: number, icon: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm opacity-80 mb-0.5">Faturamento</p>
          <p className="text-2xl font-bold">{formatCurrency(earnings)}</p>
        </div>
        <div className="pt-2 border-t border-current/10">
          <p className="text-sm font-medium">{orders} {orders === 1 ? 'pedido' : 'pedidos'}</p>
        </div>
      </div>
    </div>
  );
}
