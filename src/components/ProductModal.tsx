'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product, AddonGroup, AddonItem } from '@/lib/types';
import { formatCurrency, getSupabaseImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { getAddonGroupsByProduct } from '@/lib/actions/addons';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Image from 'next/image';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, AddonItem[]>>({});
  const [loadingAddons, setLoadingAddons] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setObservation('');
      setSelectedAddons({});
      fetchAddons();
    }
  }, [product]);

  const fetchAddons = async () => {
    if (!product) return;
    setLoadingAddons(true);
    const { data } = await getAddonGroupsByProduct(product.id);
    if (data) setAddonGroups(data);
    setLoadingAddons(false);
  };

  const handleAddonSelect = (group: AddonGroup, item: AddonItem) => {
    setSelectedAddons(prev => {
      const groupSelected = prev[group.id] || [];
      const isSelected = groupSelected.some(a => a.id === item.id);
      
      if (isSelected) {
        // Remover
        return { ...prev, [group.id]: groupSelected.filter(a => a.id !== item.id) };
      } else {
        // Adicionar
        if (group.max_choices === 1) {
          return { ...prev, [group.id]: [item] }; // Substitui
        } else if (groupSelected.length < group.max_choices) {
          return { ...prev, [group.id]: [...groupSelected, item] };
        }
      }
      return prev; // Atingiu limite
    });
  };

  const totalAddonsPrice = useMemo(() => {
    let sum = 0;
    Object.values(selectedAddons).forEach(items => {
      items.forEach(item => { sum += Number(item.price); });
    });
    return sum;
  }, [selectedAddons]);

  const canAdd = useMemo(() => {
    return addonGroups.every(group => {
      if (!group.is_mandatory) return true;
      const selected = selectedAddons[group.id] || [];
      return selected.length > 0;
    });
  }, [addonGroups, selectedAddons]);

  if (!product) return null;

  const imageUrl = getSupabaseImageUrl(product.image_url);

  const handleAdd = () => {
    if (!canAdd) return;
    
    // Flat array of all selected addons
    const allSelectedAddons = Object.values(selectedAddons).flat();
    
    addItem(product, quantity, observation, allSelectedAddons);
    onClose();
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} size="md">
      {/* Image */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 -mt-1 mb-5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
            🍔
          </div>
        )}
        {product.is_highlight && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            ⭐ Destaque
          </span>
        )}
      </div>

      {/* Info */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {product.name}
      </h2>
      {product.description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
          {product.description}
        </p>
      )}
      <p className="mt-3 text-2xl font-bold text-orange-600 dark:text-orange-400">
        {formatCurrency(product.price)}
      </p>

      {/* Observation */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Observações (opcional)
        </label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="Ex: Sem cebola, molho extra..."
          className="w-full h-20 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
          id="product-observation"
        />
      </div>

      {/* Addons */}
      {!loadingAddons && addonGroups.length > 0 && (
        <div className="mt-6 space-y-6">
          {addonGroups.map((group) => {
            const selected = selectedAddons[group.id] || [];
            const isFulfilled = !group.is_mandatory || selected.length > 0;
            
            return (
              <div key={group.id} className="border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-800/30">
                <div className="bg-gray-100 dark:bg-neutral-800 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{group.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {group.max_choices === 1 ? 'Escolha 1 opção' : `Escolha até ${group.max_choices} opções`}
                    </p>
                  </div>
                  {group.is_mandatory && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isFulfilled ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                      {isFulfilled ? '✓ OK' : 'Obrigatório'}
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  {group.items?.map(item => {
                    const isChecked = selected.some(a => a.id === item.id);
                    const disabled = !isChecked && selected.length >= group.max_choices;
                    
                    return (
                      <label 
                        key={item.id} 
                        className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                            : 'border-transparent hover:bg-gray-200 dark:hover:bg-neutral-700/50'
                        } ${disabled && !isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={group.max_choices === 1 ? "radio" : "checkbox"}
                            name={`group-${group.id}`}
                            checked={isChecked}
                            disabled={disabled && !isChecked}
                            onChange={() => handleAddonSelect(group, item)}
                            className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                        </div>
                        {Number(item.price) > 0 && (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            + {formatCurrency(item.price)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quantity + Add */}
      <div className="mt-5 flex items-center gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-11 h-11 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100 border-x border-gray-200 dark:border-neutral-700">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <Button onClick={handleAdd} disabled={!canAdd} className="flex-1" size="lg" id="add-to-cart-btn">
          Adicionar · {formatCurrency((Number(product.price) + totalAddonsPrice) * quantity)}
        </Button>
      </div>
    </Modal>
  );
}
