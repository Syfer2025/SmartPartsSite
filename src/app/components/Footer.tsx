import { MapPin, Facebook, Instagram } from 'lucide-react';
import { WeeklySchedule } from './WeeklySchedule';
import logo from 'figma:asset/93a318fedff287cf8ae9966775cd849f3e3199e4.png';
import { useIsMobile } from '../hooks/useIsMobile';
import { useInView } from '../hooks/useInView';
import { useTranslation } from '../i18n/LanguageContext';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

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
    const message = t('header.whatsappMessage');
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
    <footer className="bg-gradient-to-b from-gray-950 via-black to-black text-white pt-16 pb-10 relative overflow-hidden rounded-t-[40px] md:rounded-t-[60px]">
      {/* Animated Background Blobs — CSS @keyframes (Desktop only) */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl footer-blob-1" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl footer-blob-2" />
        </>
      )}

      <div className="container mx-auto px-6 relative z-10">
        {/* Logo */}
        <div
          ref={companyRef}
          className={`flex justify-center mb-12 ${!isMobile ? `footer-reveal ${companyInView ? 'in-view' : ''}` : ''}`}
        >
          <img
            src={logo}
            alt="Smart Parts Import"
            className={`h-14 md:h-16 w-auto object-contain ${!isMobile ? 'footer-logo-hover' : ''}`}
            width="684"
            height="162"
          />
        </div>

        {/* Contatos em destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">
          {locations.map((location, index) => (
            <div key={index} className="text-center md:text-left">
              <p className="text-red-500 text-sm font-bold tracking-wide mb-2">
                {t('footer.service', { name: location.name })}
              </p>
              <button
                onClick={() => handleWhatsAppClick(location.whatsapp)}
                className="text-2xl md:text-3xl font-extrabold text-white hover:text-red-400 transition-colors"
              >
                {location.phone}
              </button>
              <p className="text-gray-400 text-sm mt-3">{t('footer.weekdays')}</p>
              <p className="text-gray-400 text-sm">{t('footer.hours')}</p>
            </div>
          ))}

          {/* E-mail */}
          <div className="text-center md:text-left">
            <p className="text-red-500 text-sm font-bold tracking-wide mb-2">{t('footer.emailContact')}</p>
            <a
              href={`mailto:${locations[0].email}`}
              className="text-xl md:text-2xl font-extrabold text-white hover:text-red-400 transition-colors break-all"
            >
              {locations[0].email}
            </a>
            <p className="text-gray-400 text-sm mt-3">{t('footer.b2bExclusive')}</p>
            <p className="text-gray-400 text-sm">{t('footer.forResellers')}</p>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12" />

        {/* Horário semanal */}
        <div
          ref={scheduleRef}
          className={`mb-12 ${!isMobile ? `footer-reveal ${scheduleInView ? 'in-view' : ''}` : ''}`}
        >
          <WeeklySchedule />
        </div>

        {/* Filiais + mapas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {locations.map((location, locationIndex) => (
            <div
              key={locationIndex}
              ref={branchRefs[locationIndex]}
              className={`bg-gray-900/60 rounded-3xl p-6 md:p-8 border border-gray-800 ${
                !isMobile
                  ? `footer-reveal footer-branch-${locationIndex} ${branchInView[locationIndex] ? 'in-view' : ''}`
                  : ''
              }`}
            >
              <div className="inline-flex items-center bg-red-600 px-5 py-2 rounded-full mb-4">
                <span className="font-extrabold text-base">{location.name}</span>
              </div>

              <div className="flex items-start gap-3 mb-5">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300 text-sm leading-relaxed">
                  <p>{location.address}</p>
                  <p>
                    {location.district} — {location.city}/{location.state}
                  </p>
                  <p className="text-gray-500">{t('footer.cep')} {location.cep}</p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-800 h-60">
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

        {/* Divisor */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-10" />

        {/* Barra inferior: redes + empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
          {/* Redes sociais */}
          <div>
            <span className="inline-flex items-center bg-red-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              {t('footer.socialMedia')}
            </span>
            <div className="flex items-center gap-3">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Siga-nos no ${item.name}`}
                  className={`w-11 h-11 bg-gray-800 ${item.color} rounded-full flex items-center justify-center shadow-lg ${!isMobile ? 'footer-social-link' : 'transition'}`}
                >
                  <item.Icon className="w-5 h-5" />
                </a>
              ))}
              <a
                href="https://www.instagram.com/smart.partsimport/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 font-semibold hover:text-white transition-colors ml-1"
              >
                @smart.partsimport
              </a>
            </div>
          </div>

          {/* Empresa */}
          <div className="md:text-right">
            <p className="font-extrabold text-white text-lg">Smart Parts Import</p>
            <p className="text-gray-400 text-sm mt-2 max-w-md md:ml-auto">
              {t('footer.companyDesc')}
            </p>
            <p className="text-gray-500 text-sm mt-2">{t('footer.b2bSales')}</p>
          </div>
        </div>

        {/* Copyright */}
        <div
          ref={copyrightRef}
          className={`flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-gray-800 ${!isMobile ? `footer-reveal ${copyrightInView ? 'in-view' : ''}` : ''}`}
        >
          <p className="text-gray-500 text-sm relative">
            {/* Botão Admin INVISÍVEL sobre o © */}
            <button
              onClick={() => onNavigate?.('admin')}
              className="absolute -left-1 -top-1 w-5 h-5 opacity-0 hover:opacity-0 cursor-default z-10"
              aria-label="Admin"
            />
            © {new Date().getFullYear()}{' '}
            <span className="text-red-500 font-semibold">Smart Parts Import</span>.{' '}
            {t('footer.rights')}
          </p>
          <a
            href="https://wa.me/5544998492172"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-red-600 text-xs transition-colors opacity-50 hover:opacity-100"
          >
            {t('footer.developedBy')}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
