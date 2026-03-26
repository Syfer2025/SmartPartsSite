import { useState, useEffect } from 'react';
import { FileText, Download, ArrowLeft, Loader2, BookOpen, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface PdfCatalog {
  id: string;
  name: string;
  pdfUrl: string;
  coverUrl?: string;
  description?: string;
  position: number;
  createdAt: string;
}

interface CatalogViewerProps {
  onNavigate: (page: string) => void;
}

export default function CatalogViewer({ onNavigate }: CatalogViewerProps) {
  const [catalogs, setCatalogs] = useState<PdfCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<PdfCatalog | null>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const res = await fetch(`${API_URL}/pdf-catalogs`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        setCatalogs(data.catalogs || []);
      } catch {
        console.error('Erro ao carregar catálogos do servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, []);

  /* ── PDF Viewer (full-screen) ── */
  if (selectedCatalog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-black text-white py-4 px-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <button
              onClick={() => setSelectedCatalog(null)}
              className="flex items-center gap-2 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Voltar aos Catálogos</span>
            </button>
            <h1 className="text-lg font-bold truncate max-w-[50%]">{selectedCatalog.name}</h1>
            <a
              href={selectedCatalog.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </a>
          </div>
        </div>
        <div className="w-full" style={{ height: 'calc(100vh - 72px)' }}>
          <iframe
            src={`${selectedCatalog.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={selectedCatalog.name}
          />
        </div>
      </div>
    );
  }

  /* ── Catalog Listing ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300 font-medium">Catálogos Digitais</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Nossos <span className="text-red-500">Catálogos</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore nossos catálogos completos de produtos. Visualize online ou faça o download em PDF.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : catalogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum catálogo disponível</h3>
            <p className="text-gray-400">Novos catálogos serão adicionados em breve.</p>
            <button
              onClick={() => onNavigate('home')}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                onClick={() => setSelectedCatalog(catalog)}
                className="w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-red-300 group"
              >
                {/* Cover */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                  {catalog.coverUrl ? (
                    <img
                      src={catalog.coverUrl}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <FileText className="w-20 h-20 text-red-300" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-white text-red-600 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl font-semibold text-sm">
                      <Eye className="w-4 h-4" />
                      Abrir Catálogo
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 text-center">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-red-600 transition-colors">
                    {catalog.name}
                  </h3>
                  {catalog.description && (
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{catalog.description}</p>
                  )}
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(catalog.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <a
                      href={catalog.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
