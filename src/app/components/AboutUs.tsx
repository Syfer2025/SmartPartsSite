import { Target, Eye, Award, Sparkles, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useInView } from '../hooks/useInView';
import { useTranslation } from '../i18n/LanguageContext';

export function AboutUs() {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  // IntersectionObserver refs (desktop only)
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>();
  const { ref: descRef, inView: descInView } = useInView<HTMLDivElement>();
  const { ref: cardsRef, inView: cardsInView } = useInView<HTMLDivElement>();
  const { ref: faqRef, inView: faqInView } = useInView<HTMLDivElement>();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    { question: t('about.faq1q'), answer: t('about.faq1a') },
    { question: t('about.faq2q'), answer: t('about.faq2a') },
    { question: t('about.faq3q'), answer: t('about.faq3a') },
    { question: t('about.faq4q'), answer: t('about.faq4a') },
    { question: t('about.faq5q'), answer: t('about.faq5a') },
    { question: t('about.faq6q'), answer: t('about.faq6a') },
  ];

  const missionCards = [
    {
      icon: Eye,
      title: t('about.visionTitle'),
      description: t('about.visionDesc'),
      color: 'bg-gradient-to-br from-gray-700 to-gray-900',
      dotColor: 'bg-gray-700',
      values: null,
    },
    {
      icon: Target,
      title: t('about.missionTitle'),
      description: t('about.missionDesc'),
      color: 'bg-gradient-to-br from-red-600 to-red-700',
      dotColor: 'bg-red-600',
      values: null,
    },
    {
      icon: Award,
      title: t('about.valuesTitle'),
      description: null,
      color: 'bg-gradient-to-br from-gray-700 to-gray-900',
      dotColor: 'bg-gray-700',
      values: [
        t('about.value1'),
        t('about.value2'),
        t('about.value3'),
        t('about.value4'),
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-24">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header e Texto Principal */}
        <div
          ref={descRef}
          className={`max-w-4xl mx-auto text-center mb-16 ${!isMobile ? `footer-reveal ${descInView ? 'in-view' : ''}` : ''}`}
        >
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold text-sm">{t('about.badge')}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-6 text-gray-900">
            {t('about.title')}
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed">
            {t('about.intro')}
          </p>
          
          <div className="h-1 w-24 bg-red-600 mx-auto mt-8 rounded-full" />
        </div>

        {/* Missão, Visão e Valores - Cards Originais */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
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
                <h3 className="text-2xl font-black text-white mt-4 relative z-10">
                  {item.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex items-center">
                {item.description ? (
                  <p className="text-gray-700 leading-relaxed text-center">{item.description}</p>
                ) : (
                  <ul className="space-y-3 w-full">
                    {item.values?.map((value, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-3 text-gray-700 font-semibold ${
                          !isMobile ? `about-value-item ${cardsInView ? 'in-view' : ''}` : ''
                        }`}
                        style={!isMobile ? { transitionDelay: `${0.6 + i * 0.1}s` } : undefined}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${item.dotColor} flex-shrink-0`}
                        ></div>
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
            className={`max-w-5xl mx-auto mb-16 ${!isMobile ? `footer-reveal ${faqInView ? 'in-view' : ''}` : ''}`}
          >
            <div className="text-center mb-10">
              <div
                className={`inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full mb-4 ${
                  !isMobile ? `about-badge-pop ${faqInView ? 'in-view' : ''}` : ''
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="font-semibold">{t('about.faqBadge')}</span>
              </div>
              <h2 className="text-4xl font-black text-black mb-4">{t('about.faqTitle')}</h2>
              <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden ${
                    !isMobile ? `faq-item ${faqInView ? 'in-view' : ''}` : ''
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
        </div>
    </section>
  );
}

export default AboutUs;
