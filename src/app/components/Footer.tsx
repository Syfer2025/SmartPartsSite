import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { WeeklySchedule } from './WeeklySchedule';
import logo from 'figma:asset/93a318fedff287cf8ae9966775cd849f3e3199e4.png';
import { useIsMobile } from '../hooks/useIsMobile';
import { useInView } from '../hooks/useInView';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const isMobile = useIsMobile();

  // IntersectionObserver refs (desktop only — mobile skips animations)
  const { ref: companyRef, inView: companyInView } = useInView<HTMLDivElement>();
  const { ref: scheduleRef, inView: scheduleInView } = useInView<HTMLDivElement>();
  const { ref: branch0Ref, inView: branch0InView } = useInView<HTMLDivElement>();
  const { ref: branch1Ref, inView: branch1InView } = useInView<HTMLDivElement>();
  const { ref: copyrightRef, inView: copyrightInView } = useInView<HTMLDivElement>();

  const branchRefs = [branch0Ref, branch1Ref];
  const branchInView = [branch0InView, branch1InView];

  const locations = [
    {
      name: 'Maringá - PR',
      phone: '(44) 99726-0058',
      whatsapp: '+5544997260058',
      email: 'contato@importadorasmart.com.br',
      address: 'R. Pioneiro Manoel Esteves, 2186',
      district: 'Distrito Industrial 2',
      city: 'Maringá',
      state: 'PR',
      cep: '87066-001',
      mapUrl: 'https://maps.google.com/maps?q=GXQX%2B87%20Maring%C3%A1,%20Paran%C3%A1&output=embed',
    },
    {
      name: 'Várzea Grande - MT',
      phone: '(65) 99329-1135',
      whatsapp: '+5565993291135',
      email: 'contato@importadorasmart.com.br',
      address: 'Rod. dos Imigrantes Km 19 Box 19',
      district: 'Capão do Pequi',
      city: 'Várzea Grande',
      state: 'MT',
      cep: '78152-135',
      mapUrl:
        'https://maps.google.com/maps?q=7VW3%2B75%20Santa%20Cecilia,%20V%C3%A1rzea%20Grande%20-%20MT&output=embed',
    },
  ];

  const handleWhatsAppClick = (phone: string) => {
    const message = 'Olá! Vim do site e gostaria de mais informações sobre os produtos.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const socialLinks = [
    {
      Icon: Facebook,
      color: 'hover:bg-blue-600',
      name: 'Facebook',
      link: 'https://www.facebook.com/smart.parts.56007',
    },
    {
      Icon: Instagram,
      color: 'hover:bg-pink-600',
      name: 'Instagram',
      link: 'https://www.instagram.com/smart.partsimport/',
    },
  ];

  return (
    <footer className="bg-black text-white py-16 relative overflow-hidden">
      {/* Animated Background Blobs — CSS @keyframes (Desktop only) */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl footer-blob-1" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl footer-blob-2" />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Company Info */}
        <div
          ref={companyRef}
          className={`text-center mb-12 ${!isMobile ? `footer-reveal ${companyInView ? 'in-view' : ''}` : ''}`}
        >
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo}
              alt="Smart Parts Import"
              className={`h-16 md:h-20 w-auto object-contain ${!isMobile ? 'footer-logo-hover' : ''}`}
              width="684"
              height="162"
            />
          </div>
          <p
            className={`text-gray-400 max-w-2xl mx-auto ${!isMobile ? `footer-reveal footer-reveal-delay-1 ${companyInView ? 'in-view' : ''}` : ''}`}
          >
            Especialistas em peças importadas premium para caminhões e carretas. Qualidade
            internacional com atendimento regional.
          </p>

          {/* Social Media */}
          <div
            className={`flex gap-3 mt-6 justify-center ${!isMobile ? `footer-reveal footer-reveal-delay-2 ${companyInView ? 'in-view' : ''}` : ''}`}
          >
            {socialLinks.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Siga-nos no ${item.name}`}
                className={`w-12 h-12 bg-gray-800 ${item.color} rounded-full flex items-center justify-center shadow-lg ${!isMobile ? 'footer-social-link' : 'transition'}`}
              >
                <item.Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div
          ref={scheduleRef}
          className={`mb-12 ${!isMobile ? `footer-reveal ${scheduleInView ? 'in-view' : ''}` : ''}`}
        >
          <WeeklySchedule />
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {locations.map((location, locationIndex) => (
            <div
              key={locationIndex}
              ref={branchRefs[locationIndex]}
              className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 ${
                !isMobile
                  ? `footer-reveal footer-branch-${locationIndex} ${branchInView[locationIndex] ? 'in-view' : ''}`
                  : ''
              }`}
            >
              {/* Branch Header */}
              <div className="text-center mb-6">
                <div
                  className={`inline-block bg-red-600 px-6 py-2 rounded-full mb-3 ${
                    !isMobile
                      ? `footer-badge footer-branch-${locationIndex} ${branchInView[locationIndex] ? 'in-view' : ''}`
                      : ''
                  }`}
                >
                  <span className="font-black text-lg">{location.name}</span>
                </div>
                <div
                  className={`h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full ${
                    !isMobile
                      ? `footer-divider ${branchInView[locationIndex] ? 'in-view' : ''}`
                      : 'w-16'
                  }`}
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                {[
                  {
                    Icon: Phone,
                    text: location.phone,
                    action: () => handleWhatsAppClick(location.whatsapp),
                  },
                  {
                    Icon: Mail,
                    text: location.email,
                    action: () => (window.location.href = `mailto:${location.email}`),
                  },
                  { Icon: MapPin, text: location.address, action: null },
                ].map((item, index) => (
                  <div
                    key={index}
                    onClick={item.action || undefined}
                    className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl ${
                      item.action ? 'cursor-pointer hover:bg-gray-700/50' : ''
                    } transition-all group ${
                      !isMobile
                        ? `footer-contact-item footer-stagger-${index} ${branchInView[locationIndex] ? 'in-view' : ''}`
                        : ''
                    }`}
                  >
                    <div className="bg-red-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <item.Icon className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition text-[11px] break-words">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700 h-64">
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa ${location.name}`}
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          ref={copyrightRef}
          className={`text-center pt-8 border-t border-gray-800 ${!isMobile ? `footer-reveal ${copyrightInView ? 'in-view' : ''}` : ''}`}
        >
          <p className="text-gray-500 text-sm relative inline-block">
            {/* Botão Admin INVISÍVEL sobre o © */}
            <button
              onClick={() => onNavigate?.('admin')}
              className="absolute -left-1 -top-1 w-5 h-5 opacity-0 hover:opacity-0 cursor-default z-10"
              aria-label="Admin"
            />
            © {new Date().getFullYear()}{' '}
            <span className="text-red-500 font-semibold">Smart Parts Import</span>. Todos os
            direitos reservados.
          </p>
          <p className="text-gray-600 text-xs mt-2">Vendas exclusivas B2B para revendedores</p>

          {/* Desenvolvido por nicebrand */}
          <div className="flex items-center justify-center mt-3">
            <a
              href="https://wa.me/5544998492172"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-red-600 text-xs transition-colors opacity-50 hover:opacity-100"
            >
              Desenvolvido com ❤️ por nicebrand
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
