import { useState } from 'react';
import { supabase } from '@/../utils/supabase/client';
import { Upload, CheckCircle, XCircle, Loader2, Image } from 'lucide-react';

// Import all figma:asset images
import logoImg from 'figma:asset/64691187aafea5b1405da18747b628927fc164ef.png';
import faviconImg from 'figma:asset/93a318fedff287cf8ae9966775cd849f3e3199e4.png';

interface AssetItem {
  name: string;
  src: string;
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadAssets() {
  const [assets, setAssets] = useState<AssetItem[]>([
    { name: 'Logo', src: logoImg, fileName: 'logo.png', status: 'pending' },
    { name: 'Favicon', src: faviconImg, fileName: 'favicon.png', status: 'pending' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const BUCKET_NAME = 'assets';

  const uploadAsset = async (asset: AssetItem, index: number) => {
    setAssets(prev => prev.map((a, i) => i === index ? { ...a, status: 'uploading' } : a));

    try {
      // Fetch the image as blob
      const response = await fetch(asset.src);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
      const blob = await response.blob();

      // Upload to Supabase Storage (upsert = overwrite if exists)
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(asset.fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) throw error;

      setAssets(prev => prev.map((a, i) => i === index ? { ...a, status: 'success' } : a));
    } catch (err: any) {
      setAssets(prev => prev.map((a, i) => i === index ? { ...a, status: 'error', error: err.message } : a));
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setDone(false);

    // Upload all assets directly (bucket already exists and is public)
    for (let i = 0; i < assets.length; i++) {
      await uploadAsset(assets[i], i);
    }

    setUploading(false);
    setDone(true);
  };

  const allSuccess = assets.every(a => a.status === 'success');
  const SUPABASE_STORAGE = 'https://khvkawwzikfcnirkwnih.supabase.co/storage/v1/object/public/assets';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl mb-2 text-red-500">Upload de Assets</h1>
        <p className="text-gray-400 mb-8">
          Esta página faz upload das imagens do Figma Make direto para o Supabase Storage.
          <br />
          <strong className="text-yellow-400">Execute isso AQUI no Figma Make</strong> (não em produção).
        </p>

        {/* Preview dos assets */}
        <div className="space-y-4 mb-8">
          {assets.map((asset, i) => (
            <div key={asset.fileName} className="bg-gray-900 rounded-lg p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={asset.src} alt={asset.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-lg">{asset.name}</p>
                <p className="text-gray-500 text-sm">{asset.fileName}</p>
              </div>
              <div className="flex-shrink-0">
                {asset.status === 'pending' && <Image className="w-6 h-6 text-gray-500" />}
                {asset.status === 'uploading' && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                {asset.status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                {asset.status === 'error' && (
                  <div className="text-right">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <p className="text-red-400 text-xs mt-1">{asset.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUploadAll}
          disabled={uploading || allSuccess}
          className={`w-full py-4 rounded-lg text-lg flex items-center justify-center gap-3 transition ${
            allSuccess
              ? 'bg-green-700 cursor-default'
              : uploading
              ? 'bg-gray-700 cursor-wait'
              : 'bg-red-600 hover:bg-red-700 cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Fazendo upload...
            </>
          ) : allSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Upload concluído!
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Fazer Upload de Tudo
            </>
          )}
        </button>

        {/* Verification links */}
        {done && allSuccess && (
          <div className="mt-8 bg-green-900/20 border border-green-700 rounded-lg p-6">
            <h2 className="text-green-400 text-lg mb-3">Tudo pronto! Verifique as URLs:</h2>
            <ul className="space-y-2">
              {assets.map(asset => (
                <li key={asset.fileName}>
                  <a
                    href={`${SUPABASE_STORAGE}/${asset.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm break-all"
                  >
                    {SUPABASE_STORAGE}/{asset.fileName}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-gray-400 mt-4 text-sm">
              Se as URLs abrem as imagens, faça push pro GitHub e rebuild no cPanel. A logo vai aparecer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}