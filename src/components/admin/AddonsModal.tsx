'use client';

import { useState, useEffect } from 'react';
import type { Product, AddonGroup } from '@/lib/types';
import { getAddonGroupsByProduct, createAddonGroup, deleteAddonGroup, createAddonItem, deleteAddonItem } from '@/lib/actions/addons';
import { formatCurrency } from '@/lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AddonsModalProps {
  product: Product;
  onClose: () => void;
}

export default function AddonsModal({ product, onClose }: AddonsModalProps) {
  const [groups, setGroups] = useState<AddonGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [maxChoices, setMaxChoices] = useState(1);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [product.id]);

  const loadGroups = async () => {
    setLoading(true);
    const { data } = await getAddonGroupsByProduct(product.id);
    if (data) setGroups(data);
    setLoading(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    const result = await createAddonGroup(product.id, newGroupName, isMandatory, maxChoices);
    if (result.data) {
      setGroups([...groups, { ...result.data, items: [] }]);
      setNewGroupName('');
      setIsMandatory(false);
      setMaxChoices(1);
    }
    setCreatingGroup(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Apagar este grupo e todos os seus itens?')) return;
    await deleteAddonGroup(groupId);
    setGroups(groups.filter(g => g.id !== groupId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Adicionais
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Carregando...</div>
          ) : (
            <>
              {groups.map(group => (
                <div key={group.id} className="bg-gray-50 dark:bg-neutral-800/50 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{group.name}</h3>
                      <p className="text-xs text-gray-500">
                        {group.is_mandatory ? 'Obrigatório' : 'Opcional'} • Máximo: {group.max_choices}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500 text-sm hover:underline">
                      Apagar Grupo
                    </button>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2 mb-4">
                    {group.items?.length === 0 && <p className="text-xs text-gray-400">Nenhum item adicionado.</p>}
                    {group.items?.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-orange-600">{formatCurrency(item.price)}</span>
                          <button 
                            onClick={async () => {
                              await deleteAddonItem(item.id);
                              loadGroups(); // Recarrega para atualizar a lista
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add item form */}
                  <AddItemForm groupId={group.id} onAdded={loadGroups} />
                </div>
              ))}

              {/* Create new group form */}
              <div className="border-t border-dashed border-gray-300 dark:border-neutral-700 pt-6">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Criar Novo Grupo de Adicionais</h3>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <Input
                    id="group-name"
                    label="Nome do Grupo (Ex: Escolha o Ponto, Extras)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={isMandatory} 
                        onChange={(e) => setIsMandatory(e.target.checked)} 
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      Obrigatório
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Qtd. Máxima:</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={maxChoices} 
                        onChange={(e) => setMaxChoices(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-1.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={creatingGroup}>
                    + Adicionar Grupo
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddItemForm({ groupId, onAdded }: { groupId: string, onAdded: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await createAddonItem(groupId, name, parseFloat(price) || 0);
    setName('');
    setPrice('0');
    setLoading(false);
    onAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Opção</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Bacon"
          required
          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="w-24">
        <label className="block text-xs font-medium text-gray-500 mb-1">Preço (R$)</label>
        <input 
          type="number" 
          step="0.50"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 dark:text-gray-100"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading} className="py-2.5">
        +
      </Button>
    </form>
  );
}
