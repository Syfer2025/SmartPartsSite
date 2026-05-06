import { MessageCircle, MapPin, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '../hooks/useAnalytics';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();

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
    const message = `Olá! Vim do site e gostaria de mais informações sobre os produtos. (${city})`;
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
                <MessageCircle className="w-5 h-5" />
                Escolha a Filial
              </h3>
              <p className="text-sm text-green-100 mt-1">Nossa equipe está pronta para atender!</p>
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
                      Clique para conversar
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
        className={`relative text-white p-4 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow duration-300 ${
          isOpen 
            ? 'bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.3)] focus-visible:ring-gray-800' 
            : 'bg-gradient-to-br from-green-500 to-green-600 shadow-[0_8px_30px_rgb(34,197,94,0.4)] focus-visible:ring-green-500'
        }`}
        aria-label={isOpen ? "Fechar menu do WhatsApp" : "Fale conosco no WhatsApp"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Modern Pulsing indicator - only show when closed */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
