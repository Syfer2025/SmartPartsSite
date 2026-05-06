import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Archive,
  FileText,
  Image as ImageIcon,
  Loader,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  sku: string;
  description: string;
  image: string;
  images?: string[];
  specifications: Array<{ id: string; key: string; value: string }>;
  createdAt?: string;
  updatedAt?: string;
}

interface BackupManagerProps {
  accessToken: string;
}

export default function BackupManager({ accessToken }: BackupManagerProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  // Função para sanitizar nomes de arquivos/pastas
  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  // Função para buscar imagem como Blob
  const fetchImageBlob = async (url: string): Promise<Blob | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.blob();
    } catch (error) {
      console.error(`Erro ao baixar imagem: ${url}`, error);
      return null;
    }
  };

  // Função principal para gerar o backup
  const handleGenerateBackup = async () => {
    setLoading(true);
    setProgress(0);
    setProcessedCount(0);
    setStatus('Iniciando backup...');

    try {
      // 1. Buscar todos os produtos
      setStatus('Buscando lista de produtos...');
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Falha ao buscar produtos');

      const data = await response.json();
      const products: Product[] = data.products || [];
      setTotalProducts(products.length);

      if (products.length === 0) {
        toast.warning('Nenhum produto encontrado para backup');
        setLoading(false);
        return;
      }

      // 2. Inicializar JSZip
      const zip = new JSZip();
      const date = new Date().toISOString().split('T')[0];
      const rootFolder = zip.folder(`Backup_SmartParts_${date}`);

      if (!rootFolder) throw new Error('Falha ao criar pasta ZIP');

      // 3. Processar cada produto
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const sku = product.sku || `NOSKU_${i}`;
        const folderName = `${sanitizeFilename(sku)}_${sanitizeFilename(product.name)}`;
        const productFolder = rootFolder.folder(folderName);

        if (!productFolder) continue;

        setStatus(`Processando: ${product.name}`);

        // --- A. Gerar PDF Ficha Técnica ---
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text(product.name, 14, 20);

        // Info Básica
        doc.setFontSize(12);
        doc.text(`SKU: ${product.sku || 'N/A'}`, 14, 30);
        doc.text(`Categoria: ${product.category}`, 14, 38);

        // Descrição
        doc.setFontSize(10);
        const splitDesc = doc.splitTextToSize(product.description || '', 180);
        doc.text(splitDesc, 14, 48);

        // Tabela de Especificações
        let specsY = 48 + splitDesc.length * 5 + 10;

        // Preparar dados para tabela
        // O formato de specs pode variar (array de objetos ou objeto chave/valor antigo)
        let specsData: string[][] = [];
        if (Array.isArray(product.specifications)) {
          specsData = product.specifications.map((s) => [s.key, s.value]);
        } else if (typeof product.specifications === 'object') {
          // Fallback para formato antigo se existir
          specsData = Object.entries(product.specifications).map(([k, v]) => [k, String(v)]);
        }

        if (specsData.length > 0) {
          autoTable(doc, {
            startY: specsY,
            head: [['Especificação', 'Detalhe']],
            body: specsData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] }, // Vermelho Smart Parts
          });
        }

        // Salvar PDF no ZIP
        const pdfBlob = doc.output('blob');
        productFolder.file(`${folderName}_ficha_tecnica.pdf`, pdfBlob);

        // --- B. Baixar e Salvar Imagens ---
        // Imagem Principal
        if (product.image) {
          const mainImgBlob = await fetchImageBlob(product.image);
          if (mainImgBlob) {
            // Tentar descobrir extensão pelo tipo MIME
            const ext = mainImgBlob.type.split('/')[1] || 'jpg';
            productFolder.file(`imagem_principal.${ext}`, mainImgBlob);
          } else {
            // Criar log de erro se falhar
            productFolder.file('erro_imagem_principal.txt', `Falha ao baixar: ${product.image}`);
          }
        }

        // Imagens Adicionais
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const galleryFolder = productFolder.folder('galeria');
          if (galleryFolder) {
            for (let j = 0; j < product.images.length; j++) {
              const imgUrl = product.images[j];
              const imgBlob = await fetchImageBlob(imgUrl);
              if (imgBlob) {
                const ext = imgBlob.type.split('/')[1] || 'jpg';
                galleryFolder.file(`imagem_${j + 1}.${ext}`, imgBlob);
              }
            }
          }
        }

        // --- C. Salvar JSON Dados Brutos ---
        productFolder.file('dados_brutos.json', JSON.stringify(product, null, 2));

        // Atualizar progresso
        setProcessedCount((prev) => prev + 1);
        setProgress(Math.round(((i + 1) / products.length) * 100));
      }

      // 4. Gerar e Baixar o ZIP final
      setStatus('Compactando arquivos... (Isso pode demorar)');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Backup_SmartParts_${date}.zip`);

      toast.success('Backup concluído com sucesso!');
      setStatus('Backup concluído!');
    } catch (error: any) {
      console.error('Erro no backup:', error);
      toast.error(`Erro ao gerar backup: ${error.message}`);
      setStatus('Erro ao gerar backup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-green-500/10 rounded-xl">
          <Archive className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Backup do Sistema</h2>
          <p className="text-gray-400">
            Baixe todos os produtos, fotos e fichas técnicas organizados por pasta.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center text-center">
          <FileText className="w-8 h-8 text-blue-400 mb-2" />
          <h3 className="font-semibold text-white">Fichas Técnicas</h3>
          <p className="text-xs text-gray-400 mt-1">Geradas automaticamente em PDF com tabelas</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center text-center">
          <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
          <h3 className="font-semibold text-white">Imagens Originais</h3>
          <p className="text-xs text-gray-400 mt-1">
            Download em alta resolução organizado por pasta
          </p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center text-center">
          <Archive className="w-8 h-8 text-yellow-400 mb-2" />
          <h3 className="font-semibold text-white">Arquivo ZIP Único</h3>
          <p className="text-xs text-gray-400 mt-1">Tudo compactado e organizado por SKU</p>
        </div>
      </div>

      {!loading ? (
        <button
          onClick={handleGenerateBackup}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01]"
        >
          <Download className="w-6 h-6" />
          Gerar e Baixar Backup Completo
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-green-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-2">
            <Loader className="w-4 h-4 animate-spin" />
            Processando item {processedCount} de {totalProducts}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-yellow-500 font-semibold text-sm">Nota Importante</h4>
          <p className="text-yellow-200/70 text-xs mt-1">
            O processo pode demorar alguns minutos dependendo da quantidade de imagens. Não feche
            esta página enquanto o backup estiver sendo gerado. Se houver erro no download de alguma
            imagem específica, um arquivo de texto será criado na pasta do produto informando o
            erro.
          </p>
        </div>
      </div>
    </div>
  );
}
