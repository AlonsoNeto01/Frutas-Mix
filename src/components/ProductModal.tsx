'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { formatCurrency, getSupabaseImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
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
  const { addItem } = useCart();

  if (!product) return null;

  const imageUrl = getSupabaseImageUrl(product.image_url);

  const handleAdd = () => {
    addItem(product, quantity, observation);
    setQuantity(1);
    setObservation('');
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
        <Button onClick={handleAdd} className="flex-1" size="lg" id="add-to-cart-btn">
          Adicionar · {formatCurrency(product.price * quantity)}
        </Button>
      </div>
    </Modal>
  );
}
