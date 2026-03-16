import { Target, Eye, Award, Sparkles, MapPin, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useInView } from '../hooks/useInView';

export function AboutUs() {
  const isMobile = useIsMobile();

  // IntersectionObserver refs (desktop only)
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>();
  const { ref: descRef, inView: descInView } = useInView<HTMLDivElement>();
  const { ref: cardsRef, inView: cardsInView } = useInView<HTMLDivElement>();
  const { ref: faqRef, inView: faqInView } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaInView } = useInView<HTMLDivElement>();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Vocês vendem para pessoa física?',
      answer: 'Não, trabalhamos exclusivamente com vendas B2B (Business to Business) para revendedores e empresas do setor automotivo. Nossa estrutura é focada em atender lojistas e distribuidores de peças.'
    },
    {
      question: 'Qual o pedido mínimo?',
      answer: 'O pedido mínimo varia de acordo com a categoria de produto e sua localização. Entre em contato com nossa equipe comercial para conhecer as condições específicas para sua região.'
    },
    {
      question: 'Têm pronta entrega?',
      answer: 'Sim! Mantemos um estoque completo de produtos importados para pronta entrega. Alguns itens sob encomenda podem ter prazo diferenciado, que será informado no momento da cotação.'
    },
    {
      question: 'Fazem entrega em todo Brasil?',
      answer: 'Sim, atendemos todo o território nacional. Possuímos filiais em Maringá-PR e Várzea Grande-MT para melhor atender as diferentes regiões do país.'
    },
    {
      question: 'Como faço para me tornar um revendedor?',
      answer: 'Entre em contato através do nosso WhatsApp ou formulário de contato. Nossa equipe comercial irá analisar sua solicitação e fornecer todas as informações sobre nosso programa de parceria.'
    },
    {
      question: 'Os produtos têm garantia?',
      answer: 'Sim, todos os nossos produtos são 100% importados e possuem garantia do fabricante. Os prazos variam de acordo com cada categoria de produto.'
    }
  ];

  const missionCards = [
    {
      icon: Eye,
      title: 'Visão',
      description: 'Ser referência nacional em importação de peças para veículos pesados, reconhecida pela qualidade excepcional e compromisso com parceiros revendedores.',
      color: 'bg-gradient-to-br from-gray-700 to-gray-900',
      dotColor: 'bg-gray-700',
      values: null,
    },
    {
      icon: Target,
      title: 'Missão',
      description: 'Fornecer peças importadas de alta qualidade exclusivamente para revendedores B2B, garantindo suporte completo e máxima eficiência operacional.',
      color: 'bg-gradient-to-br from-red-600 to-red-700',
      dotColor: 'bg-red-600',
      values: null,
    },
    {
      icon: Award,
      title: 'Valores',
      description: null,
      color: 'bg-gradient-to-br from-gray-700 to-gray-900',
      dotColor: 'bg-gray-700',
      values: [
        'Parceria com revendedores',
        'Comprometimento com prazos',
        'Inovação constante',
        'Ética e transparência',
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Hero Header with Dark Background */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 relative overflow-hidden">
        {/* Animated Background — CSS @keyframes (Desktop only) */}
        {!isMobile && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-3xl about-blob" />
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={headerRef}
            className={`text-center ${!isMobile ? `footer-reveal ${headerInView ? 'in-view' : ''}` : ''}`}
          >
            <div
              className={`inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-full mb-4 backdrop-blur-sm border border-red-500/30 ${
                !isMobile ? `about-badge-pop ${headerInView ? 'in-view' : ''}` : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Conheça Nossa História</span>
            </div>
            <h2
              className={`text-5xl font-black text-white mb-4 ${
                !isMobile ? `footer-reveal footer-reveal-delay-1 ${headerInView ? 'in-view' : ''}` : ''
              }`}
            >
              Sobre a Smart Parts Import
            </h2>
            <div
              className={`h-1.5 bg-red-600 mx-auto rounded-full ${
                !isMobile
                  ? `footer-divider ${headerInView ? 'in-view' : ''}`
                  : 'w-24'
              }`}
              style={!isMobile ? { transitionDelay: '0.3s' } : undefined}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Description */}
          <div
            ref={descRef}
            className={`max-w-4xl mx-auto mb-16 ${!isMobile ? `footer-reveal ${descInView ? 'in-view' : ''}` : ''}`}
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                A <span className="font-black text-red-600">Smart Parts Import</span> é uma empresa especializada na importação e distribuição de peças 
                premium para caminhões e carretas. Com anos de experiência no mercado, nos dedicamos a 
                oferecer produtos de alta qualidade que garantem segurança, durabilidade e performance 
                superior para seus clientes.
              </p>
            </div>
          </div>

          {/* Missão, Visão e Valores - Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {missionCards.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden h-full flex flex-col ${
                  !isMobile
                    ? `about-card about-card-delay-${index} about-card-hover ${cardsInView ? 'in-view' : ''}`
                    : ''
                }`}
              >
                {/* Icon Header */}
                <div className={`${item.color} p-6 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div
                    className={`w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10 ${!isMobile ? 'about-icon-hover' : ''}`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mt-4 relative z-10">{item.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex items-center">
                  {item.description ? (
                    <p className="text-gray-700 leading-relaxed text-center">
                      {item.description}
                    </p>
                  ) : (
                    <ul className="space-y-3 w-full">
                      {item.values?.map((value, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-3 text-gray-700 font-semibold ${
                            !isMobile
                              ? `about-value-item ${cardsInView ? 'in-view' : ''}`
                              : ''
                          }`}
                          style={!isMobile ? { transitionDelay: `${0.6 + i * 0.1}s` } : undefined}
                        >
                          <div className={`w-2 h-2 rounded-full ${item.dotColor} flex-shrink-0`}></div>
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div
            ref={faqRef}
            className={`max-w-4xl mx-auto mb-16 ${!isMobile ? `footer-reveal ${faqInView ? 'in-view' : ''}` : ''}`}
          >
            <div className="text-center mb-10">
              <div
                className={`inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full mb-4 ${
                  !isMobile ? `about-badge-pop ${faqInView ? 'in-view' : ''}` : ''
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="font-semibold">Tire suas Dúvidas</span>
              </div>
              <h2 className="text-4xl font-black text-black mb-4">Perguntas Frequentes</h2>
              <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden ${
                    !isMobile
                      ? `faq-item ${faqInView ? 'in-view' : ''}`
                      : ''
                  }`}
                  style={!isMobile ? { transitionDelay: `${index * 0.1}s` } : undefined}
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-black text-lg text-gray-900 pr-4">{faq.question}</span>
                    <div
                      className="flex-shrink-0"
                      style={{
                        transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <ChevronDown className="w-6 h-6 text-red-600" />
                    </div>
                  </button>
                  {/* CSS grid accordion — no AnimatePresence needed */}
                  <div className={`faq-content ${openFaqIndex === index ? 'open' : ''}`}>
                    <div>
                      <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            ref={ctaRef}
            className={`text-center ${!isMobile ? `footer-reveal ${ctaInView ? 'in-view' : ''}` : ''}`}
          >
            <button
              onClick={() => window.open('https://api.whatsapp.com/send/?phone=%2B5544997260058&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es+sobre+os+produtos.+%28Maring%C3%A1%29&type=phone_number&app_absent=0', '_blank')}
              className={`bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-5 rounded-xl font-black text-lg shadow-xl flex items-center gap-3 mx-auto transition-colors ${!isMobile ? 'about-cta-hover' : ''}`}
            >
              <MapPin className="w-6 h-6" />
              Torne-se Nosso Parceiro Revendedor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
