import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, BarChart2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../../utils/supabase/info';

interface SettingsProps {
  accessToken: string;
}

export default function Settings({ accessToken }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'SMART PARTS IMPORT',
    companyEmail: 'contato@importadorasmart.com.br',
    whatsappMaringa: '5544997260058',
    whatsappSinop: '5565993291135',
  });

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.settings) {
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ settings })
      });

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!');
        
        // Update Google Analytics script if ID changed
        if (settings.googleAnalyticsId) {
          updateGoogleAnalytics(settings.googleAnalyticsId);
        }
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateGoogleAnalytics = (gaId: string) => {
    // Remove existing GA scripts
    const existingScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
    existingScripts.forEach(script => script.remove());

    // Add new GA scripts
    if (gaId && gaId.startsWith('G-')) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);

      toast.success('Google Analytics ativado!');
    }
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
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gray-500/10 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Configurações do Site</h2>
          <p className="text-gray-400 text-sm">Gerencie as configurações gerais do sistema</p>
        </div>
      </div>

      {/* Google Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <BarChart2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Google Analytics</h3>
            <p className="text-gray-400 text-sm">Integre o Google Analytics para rastreamento avançado</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Google Analytics ID *
            </label>
            <input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-sm mt-2">
              📌 Cole aqui o ID do Google Analytics (formato: G-XXXXXXXXXX)
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-bold text-blue-400 mb-2">Como obter o Google Analytics ID:</h4>
            <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
              <li>Acesse <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">analytics.google.com</a></li>
              <li>Crie uma conta e propriedade (se ainda não tiver)</li>
              <li>Vá em Admin → Fluxos de dados → Web</li>
              <li>Copie o ID de medição (começa com G-)</li>
              <li>Cole aqui e clique em Salvar</li>
            </ol>
          </div>
        </div>
      </motion.div>

      {/* Company Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Globe className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Informações da Empresa</h3>
            <p className="text-gray-400 text-sm">Dados de contato e localização</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              E-mail Principal
            </label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              WhatsApp Maringá
            </label>
            <input
              type="text"
              value={settings.whatsappMaringa}
              onChange={(e) => setSettings({ ...settings, whatsappMaringa: e.target.value })}
              placeholder="5544997260058"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              WhatsApp Sinop
            </label>
            <input
              type="text"
              value={settings.whatsappSinop}
              onChange={(e) => setSettings({ ...settings, whatsappSinop: e.target.value })}
              placeholder="5565993291135"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </motion.button>
      </div>
    </div>
  );
}