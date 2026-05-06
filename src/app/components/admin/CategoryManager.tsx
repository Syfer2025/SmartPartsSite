import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderTree, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../../utils/supabase/info';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryManagerProps {
  accessToken: string;
  onUpdate?: () => void;
}

export default function CategoryManager({ accessToken, onUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      console.log('Categories fetched:', data);

      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Digite o nome da categoria');
      return;
    }

    try {
      const url = editingCategory
        ? `${API_URL}/admin/categories/${editingCategory.slug}`
        : `${API_URL}/admin/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
        fetchCategories();
        resetForm();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || 'Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/categories/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Categoria excluída!');
        fetchCategories();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      description: '',
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, icon: base64String });
        toast.success('Imagem carregada!');
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Erro ao carregar imagem');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <FolderTree className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Categorias</h2>
            <p className="text-gray-400 text-sm">{categories.length} categorias cadastradas</p>
          </div>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </motion.button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Geladeiras Portáteis"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ícone da Categoria (PNG/JPG) *
                  </label>
                  <div className="space-y-3">
                    {/* Preview */}
                    {formData.icon && (
                      <div className="flex items-center justify-center w-32 h-32 bg-white/10 rounded-xl border-2 border-dashed border-white/20 overflow-hidden">
                        <img
                          src={formData.icon}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    )}

                    {/* Upload button */}
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors border border-white/20">
                      <Package className="w-4 h-4" />
                      {uploadingImage
                        ? 'Carregando...'
                        : formData.icon
                          ? 'Trocar Imagem'
                          : 'Escolher Imagem'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      Recomendado: PNG transparente, 128x128px, máx 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descrição breve da categoria..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                </motion.button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma categoria cadastrada</p>
            <p className="text-gray-500 text-sm mt-2">Clique em "Nova Categoria" para começar</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                {category.icon.startsWith('data:image') ? (
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="text-4xl">{category.icon}</div>
                )}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.slug)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-white mb-2">{category.name}</h4>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {category.description || 'Sem descrição'}
              </p>
              <p className="text-xs text-gray-500">Slug: {category.slug}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
