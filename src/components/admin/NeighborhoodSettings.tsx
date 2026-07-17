'use client';

import { useState } from 'react';
import type { DeliveryNeighborhood } from '@/lib/types';
import { updateNeighborhoodFee, updateNeighborhoodStatus, addNeighborhood, deleteNeighborhood } from '@/lib/actions/neighborhoods';
import Button from '../ui/Button';

export default function NeighborhoodSettings({ initialNeighborhoods }: { initialNeighborhoods: DeliveryNeighborhood[] }) {
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('3.00');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleAdd = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert('Digite o nome do bairro.');
      return;
    }

    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0) {
      alert('Digite uma taxa válida.');
      return;
    }

    // Verificar duplicata
    if (neighborhoods.some(n => n.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Esse bairro já existe na lista.');
      return;
    }

    setAdding(true);
    const result = await addNeighborhood(trimmedName, fee);

    if (result.error) {
      alert(`Erro ao adicionar bairro: ${result.error}`);
    } else if (result.data) {
      setNeighborhoods(prev => [...prev, result.data as DeliveryNeighborhood].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewFee('3.00');
    }
    setAdding(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o bairro "${name}"?`)) return;

    setDeletingId(id);
    const result = await deleteNeighborhood(id);

    if (result.error) {
      alert(`Erro ao remover bairro: ${result.error}`);
    } else {
      setNeighborhoods(prev => prev.filter(n => n.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>🛵</span> Taxas de Entrega por Bairro
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Ative ou desative os bairros que você atende, defina a taxa de entrega para cada um, ou adicione novos bairros.
      </p>

      {/* Formulário para adicionar novo bairro */}
      <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-xl">
        <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
          <span>➕</span> Adicionar Novo Bairro
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nome do bairro..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">R$</span>
            <input
              type="number"
              step="0.50"
              min="0"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className="w-24 px-3 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm text-right text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="whitespace-nowrap"
          >
            {adding ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Lista de bairros */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {neighborhoods.map((n) => (
          <div key={n.id} className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-100 dark:border-neutral-800 transition-opacity ${deletingId === n.id ? 'opacity-50' : ''}`}>
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
              {/* Botão de remover */}
              <button
                type="button"
                onClick={() => handleDelete(n.id, n.name)}
                disabled={deletingId === n.id}
                title={`Remover ${n.name}`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {neighborhoods.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-sm">Nenhum bairro cadastrado. Adicione acima!</p>
          </div>
        )}
      </div>
    </div>
  );
}
