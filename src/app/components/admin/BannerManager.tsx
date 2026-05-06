import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Plus, Trash2, Edit2, Upload, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string; // Nova propriedade para vídeo
  mediaType?: 'image' | 'video'; // Tipo de mídia
  order: number;
  buttonText?: string;
  buttonLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerManagerProps {
  accessToken: string;
  onUpdate?: () => void;
}

export default function BannerManager({ accessToken, onUpdate }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    videoUrl: '',
    mediaType: 'image' as 'image' | 'video',
    buttonText: 'Ver Catálogo',
    buttonLink: '#catalog',
    order: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/banners`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (data.banners) {
        const sorted = data.banners.sort((a: Banner, b: Banner) => a.order - b.order);
        setBanners(sorted);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, imageUrl: data.url, mediaType: 'image' });
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error('Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um vídeo válido');
      return;
    }

    // Validate file size (max 60MB)
    if (file.size > 60 * 1024 * 1024) {
      toast.error('O vídeo deve ter no máximo 60MB');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, videoUrl: data.url, mediaType: 'video' });
        toast.success('Vídeo enviado com sucesso!');
      } else {
        toast.error('Erro ao enviar vídeo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle || (!formData.imageUrl && !formData.videoUrl)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const url = editingBanner
        ? `${API_URL}/admin/banners/${editingBanner.id}`
        : `${API_URL}/admin/banners`;

      const method = editingBanner ? 'PUT' : 'POST';

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
        toast.success(editingBanner ? 'Banner atualizado!' : 'Banner criado!');
        fetchBanners();
        resetForm();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || 'Erro ao salvar banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Erro ao salvar banner');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl || '',
      mediaType: banner.mediaType || 'image',
      buttonText: banner.buttonText || 'Ver Catálogo',
      buttonLink: banner.buttonLink || '#catalog',
      order: banner.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        toast.success('Banner excluído!');
        fetchBanners();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Erro ao excluir banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erro ao excluir banner');
    }
  };

  const handleMoveUp = async (banner: Banner, index: number) => {
    if (index === 0) return;

    const prevBanner = banners[index - 1];
    const newBanners = [...banners];

    // Swap orders
    newBanners[index].order = prevBanner.order;
    newBanners[index - 1].order = banner.order;

    // Update both banners
    await updateBannerOrder(newBanners[index]);
    await updateBannerOrder(newBanners[index - 1]);

    fetchBanners();
  };

  const handleMoveDown = async (banner: Banner, index: number) => {
    if (index === banners.length - 1) return;

    const nextBanner = banners[index + 1];
    const newBanners = [...banners];

    // Swap orders
    newBanners[index].order = nextBanner.order;
    newBanners[index + 1].order = banner.order;

    // Update both banners
    await updateBannerOrder(newBanners[index]);
    await updateBannerOrder(newBanners[index + 1]);

    fetchBanners();
  };

  const updateBannerOrder = async (banner: Banner) => {
    try {
      await fetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ order: banner.order }),
      });
    } catch (error) {
      console.error('Error updating banner order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      videoUrl: '',
      mediaType: 'image' as 'image' | 'video',
      buttonText: 'Ver Catálogo',
      buttonLink: '#catalog',
      order: banners.length,
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <Image className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Banners do Carrossel</h2>
            <p className="text-gray-400 text-sm">Gerencie os banners da página inicial</p>
          </div>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            Novo Banner
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
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Peças de Qualidade"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtítulo *
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Para Caminhões e Carretas"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ver Catálogo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="#catalog"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem do Banner * (1920x600px recomendado)
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">
                        {uploading ? 'Enviando...' : 'Escolher Imagem'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {formData.imageUrl && (
                      <span className="text-green-400 text-sm">✓ Imagem carregada</span>
                    )}
                  </div>
                  {formData.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vídeo do Banner * (1920x600px recomendado)
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">
                        {uploading ? 'Enviando...' : 'Escolher Vídeo'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {formData.videoUrl && (
                      <span className="text-green-400 text-sm">✓ Vídeo carregado</span>
                    )}
                  </div>
                  {formData.videoUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <video
                        src={formData.videoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingBanner ? 'Atualizar' : 'Criar'} Banner
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

      {/* Banners List */}
      <div className="grid gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum banner cadastrado</p>
            <p className="text-gray-500 text-sm mt-2">Clique em "Novo Banner" para começar</p>
          </div>
        ) : (
          banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{banner.title}</h4>
                  <p className="text-sm text-gray-400">{banner.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">Ordem: {banner.order + 1}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveUp(banner, index)}
                    disabled={index === 0}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(banner, index)}
                    disabled={index === banners.length - 1}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
