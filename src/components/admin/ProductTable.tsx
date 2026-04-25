'use client';

import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { formatCurrency, getSupabaseImageUrl } from '@/lib/utils';
import { deleteProduct } from '@/lib/actions/products';
import { createCategory, deleteCategory } from '@/lib/actions/categories';
import ProductForm from './ProductForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Image from 'next/image';
import AddonsModal from './AddonsModal';

interface ProductTableProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductTable({ initialProducts, initialCategories }: ProductTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addonsProduct, setAddonsProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const result = await deleteProduct(id);
    if (!result.error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditProduct(null);
    // Reload will happen via revalidatePath
    window.location.reload();
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setCatLoading(true);
    const result = await createCategory(newCategory.trim());
    if (!result.error) {
      setNewCategory('');
      window.location.reload();
    }
    setCatLoading(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return;
    const result = await deleteCategory(id);
    if (!result.error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Categorias */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">📂 Categorias</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label={`Excluir ${cat.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="new-category"
            placeholder="Nova categoria..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddCategory} disabled={catLoading} size="sm">
            {catLoading ? '...' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Produtos */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">🍔 Produtos</h3>
          <Button size="sm" onClick={() => { setEditProduct(null); setShowForm(true); }}>
            + Novo Produto
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <th className="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Imagem</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Nome</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Preço</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Categoria</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-500 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imageUrl = getSupabaseImageUrl(product.image_url);
                const category = categories.find((c) => c.id === product.category_id);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 relative">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-40">
                            🍔
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {product.name}
                        {product.is_highlight && <span className="ml-1">⭐</span>}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3 px-2 text-gray-500 dark:text-gray-400">
                      {category?.name || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500'
                      }`}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setEditProduct(product); setShowForm(true); }}>
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => setAddonsProduct(product)}
                          className="text-orange-600 border border-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-500/10"
                        >
                          ➕ Adicionais
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} className="text-red-600">
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">
              Nenhum produto cadastrado
            </p>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        title={editProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <ProductForm
          product={editProduct}
          categories={categories}
          onSuccess={handleSuccess}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      </Modal>

      {/* Addons Modal */}
      {addonsProduct && (
        <AddonsModal
          product={addonsProduct}
          onClose={() => setAddonsProduct(null)}
        />
      )}
    </div>
  );
}
