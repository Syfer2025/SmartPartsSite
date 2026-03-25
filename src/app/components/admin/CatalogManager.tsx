import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Loader2, Plus, GripVertical, X, Eye, ImageIcon } from 'lucide-react';
import { projectId } from '../../../../utils/supabase/info';

interface PdfCatalog {
  id: string;
  name: string;
  pdfUrl: string;
  coverUrl?: string;
  description?: string;
  position: number;
  createdAt: string;
  storagePath?: string;
}

interface CatalogManagerProps {
  accessToken: string;
  onUpdate?: () => void;
}

export default function CatalogManager({ accessToken, onUpdate }: CatalogManagerProps) {
  const [catalogs, setCatalogs] = useState<PdfCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/pdf-catalogs`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar catálogos');
      const data = await res.json();
      setCatalogs(data.catalogs || []);
    } catch (err) {
      console.error('Erro ao carregar catálogos:', err);
      toast.error('Erro ao carregar catálogos do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são aceitos');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 50MB');
      return;
    }

    setSelectedFile(file);
    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: file.name.replace('.pdf', '') }));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são aceitas para a capa');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 5MB');
      return;
    }

    setSelectedCover(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha no upload');
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Selecione um arquivo PDF');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Digite o nome do catálogo');
      return;
    }

    setUploading(true);

    try {
      // Upload PDF
      const pdfUrl = await uploadFile(selectedFile);

      // Upload cover if provided
      let coverUrl = '';
      if (selectedCover) {
        coverUrl = await uploadFile(selectedCover);
      }

      // Salvar no Supabase via API
      const saveRes = await fetch(`${API_URL}/admin/pdf-catalogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          pdfUrl,
          coverUrl,
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao salvar catálogo');
      }

      await fetchCatalogs();
      toast.success('Catálogo adicionado com sucesso!');
      resetForm();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar catálogo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o catálogo "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/pdf-catalogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Falha ao excluir catálogo');

      await fetchCatalogs();
      toast.success('Catálogo excluído!');
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir catálogo');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setSelectedCover(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Catálogos PDF</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie os catálogos em PDF disponíveis para seus clientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Novo Catálogo'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Adicionar Catálogo PDF</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Catálogo *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Catálogo Geral 2026"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descrição (opcional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição breve do catálogo"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Two columns: Cover + PDF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Imagem de Capa *</label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors h-[200px] flex items-center justify-center ${
                    coverPreview
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-white/20 hover:border-red-500/50 hover:bg-red-500/5'
                  }`}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  {coverPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={coverPreview}
                        alt="Capa preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCover(null);
                          setCoverPreview(null);
                          if (coverInputRef.current) coverInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 p-1 rounded-full"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Imagem de capa</p>
                      <p className="text-gray-500 text-xs mt-1">JPG, PNG — Máx: 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Arquivo PDF *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors h-[200px] flex items-center justify-center ${
                    selectedFile
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-white/20 hover:border-red-500/50 hover:bg-red-500/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-green-400" />
                      <p className="text-green-400 font-medium text-sm">PDF selecionado</p>
                      <p className="text-gray-400 text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Arquivo PDF</p>
                      <p className="text-gray-500 text-xs mt-1">Máximo: 50MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Enviar Catálogo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : catalogs.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum catálogo cadastrado</h3>
          <p className="text-gray-500">Clique em "Novo Catálogo" para adicionar seu primeiro PDF.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:bg-white/10 transition-colors group"
            >
              <div className="text-gray-600">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Thumbnail */}
              <div className="w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {catalog.coverUrl ? (
                  <img src={catalog.coverUrl} alt={catalog.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-600/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate">{catalog.name}</h4>
                {catalog.description && (
                  <p className="text-gray-400 text-sm truncate">{catalog.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  Adicionado em {new Date(catalog.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={catalog.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Visualizar PDF"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                </a>
                <button
                  onClick={() => handleDelete(catalog.id, catalog.name)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
