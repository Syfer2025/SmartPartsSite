import { MapPin, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTranslation } from '../i18n/LanguageContext';

// Logo oficial do WhatsApp (lucide não inclui ícones de marca)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();
  const { t } = useTranslation();

  const branches = [
    {
      city: 'Maringá',
      state: 'PR',
      phone: '+5544997260058',
      color: 'from-green-500 to-green-600',
    },
    {
      city: 'Várzea Grande',
      state: 'MT',
      phone: '+5565993291135',
      color: 'from-blue-500 to-blue-600',
    },
  ];

  const handleWhatsAppClick = (phone: string, city: string) => {
    analytics.trackWhatsAppClick(`Botão Flutuante - ${city}`);
    const message = t('whatsapp.message', { city });
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Dropdown Menu via Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-4 w-[280px] sm:w-80 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5">
              <h3 className="font-black text-lg flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5" />
                {t('whatsapp.chooseBranch')}
              </h3>
              <p className="text-sm text-green-100 mt-1">{t('whatsapp.teamReady')}</p>
            </div>

            <div className="p-3 space-y-3">
              {branches.map((branch) => (
                <motion.button
                  key={branch.city}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleWhatsAppClick(branch.phone, branch.city)}
                  className={`w-full bg-gradient-to-r ${branch.color} text-white p-4 rounded-2xl flex items-center gap-3 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500`}
                >
                  <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-extrabold text-base">
                      {branch.city} - {branch.state}
                    </div>
                    <div className="text-xs text-white/90 flex items-center gap-1 mt-0.5 font-medium">
                      <Phone className="w-3.5 h-3.5" />
                      {t('whatsapp.clickToChat')}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative text-white rounded-full flex items-center justify-center ring-1 ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow duration-300 ${
          isOpen
            ? 'bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.3)] focus-visible:ring-gray-800'
            : 'bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-[0_10px_34px_rgb(37,211,102,0.45)] focus-visible:ring-[#25D366]'
        }`}
        style={{ width: '3.5rem', height: '3.5rem' }}
        aria-label={isOpen ? t('whatsapp.closeMenu') : t('whatsapp.talkToUs')}
      >
        {/* Halo pulsante quando fechado */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10"
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10"
            >
              <WhatsAppIcon className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de mensagem - só quando fechado */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center z-10">
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
