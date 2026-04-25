'use client';

import { useState } from 'react';
import type { DeliveryNeighborhood } from '@/lib/types';
import { updateNeighborhoodFee, updateNeighborhoodStatus } from '@/lib/actions/neighborhoods';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function NeighborhoodSettings({ initialNeighborhoods }: { initialNeighborhoods: DeliveryNeighborhood[] }) {
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const newStatus = !currentStatus;
    
    // Optimistic update
    setNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, is_active: newStatus } : n));
    
    const result = await updateNeighborhoodStatus(id, newStatus);
    if (result.error) {
      // Rollback
      setNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, is_active: currentStatus } : n));
      alert('Erro ao atualizar status do bairro.');
    }
    setLoadingId(null);
  };

  const handleUpdateFee = async (id: string, feeStr: string) => {
    const fee = parseFloat(feeStr);
    if (isNaN(fee)) return;

    setLoadingId(id);
    const result = await updateNeighborhoodFee(id, fee);
    if (result.error) {
      alert('Erro ao atualizar taxa.');
    } else {
      setNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, fee } : n));
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>🛵</span> Taxas de Entrega por Bairro
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Ative ou desative os bairros que você atende e defina a taxa de entrega para cada um.
      </p>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {neighborhoods.map((n) => (
          <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(n.id, n.is_active)}
                disabled={loadingId === n.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  n.is_active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    n.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${n.is_active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                {n.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                defaultValue={n.fee}
                disabled={!n.is_active || loadingId === n.id}
                onBlur={(e) => {
                  if (parseFloat(e.target.value) !== n.fee) {
                    handleUpdateFee(n.id, e.target.value);
                  }
                }}
                className="w-20 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-right focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
