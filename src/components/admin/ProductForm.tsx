'use client';

import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { createProduct, updateProduct } from '@/lib/actions/products';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (product) {
        result = await updateProduct(product.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } catch {
      setError('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="product-name"
        name="name"
        label="Nome do Produto"
        placeholder="Ex: X-Burger Especial"
        defaultValue={product?.name || ''}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Descrição
        </label>
        <textarea
          name="description"
          placeholder="Descrição do produto..."
          defaultValue={product?.description || ''}
          className="w-full h-20 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
        />
      </div>

      <Input
        id="product-price"
        name="price"
        label="Preço (R$)"
        type="number"
        step="0.01"
        min="0"
        placeholder="29.90"
        defaultValue={product?.price?.toString() || ''}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Categoria
        </label>
        <select
          name="category_id"
          defaultValue={product?.category_id || ''}
          className="h-11 w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 text-sm text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
        >
          <option value="">Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Imagem
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-500/10 dark:file:text-orange-400"
        />
        {preview && (
          <img src={preview} alt="Preview" className="mt-2 w-32 h-24 object-cover rounded-lg" />
        )}
      </div>

      {/* Highlight Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="is_highlight"
          value="true"
          defaultChecked={product?.is_highlight || false}
          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          ⭐ Produto em destaque
        </span>
      </label>

      {/* Free Shipping Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="has_free_shipping"
          value="true"
          defaultChecked={product?.has_free_shipping || false}
          className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🚚 Frete grátis neste produto
        </span>
      </label>

      {product && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            value="true"
            defaultChecked={product.is_active}
            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Produto ativo (visível na vitrine)
          </span>
        </label>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Salvando...' : product ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
