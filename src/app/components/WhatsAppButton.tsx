import { MessageCircle, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const analytics = useAnalytics();

  const branches = [
    {
      city: 'Maringá',
      state: 'PR',
      phone: '+5544997260058',
      color: 'bg-green-600',
    },
    {
      city: 'Várzea Grande',
      state: 'MT',
      phone: '+5565993291135',
      color: 'bg-blue-600',
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
    <>
      {/* WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all group z-[9999] whatsapp-btn-hover"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse whatsapp-notif" />
      </button>

      {/* Dropdown Menu — CSS transition (no AnimatePresence) */}
      <div
        className={`fixed bottom-26 right-6 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 z-[9998] whatsapp-dropdown ${
          isOpen ? 'whatsapp-dropdown-enter' : 'whatsapp-dropdown-exit'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Escolha a Filial
          </h3>
          <p className="text-sm text-green-100">Fale conosco via WhatsApp</p>
        </div>

        <div className="p-3 space-y-2">
          {branches.map((branch) => (
            <button
              key={branch.city}
              onClick={() => handleWhatsAppClick(branch.phone, branch.city)}
              tabIndex={isOpen ? 0 : -1}
              className={`w-full ${branch.color} hover:opacity-90 text-white p-4 rounded-xl flex items-center gap-3 transition-all shadow-lg whatsapp-branch-hover`}
            >
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black">{branch.city} - {branch.state}</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Clique para conversar
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}