import { Product, Category } from '../types';
import geladeiraImage from 'figma:asset/536007d509b846961fa170317460e39fc8161cda.png';
import arCondicionadoImage from 'figma:asset/063e4f5a7b392342abe80054cd82f3bc59c99d90.png';
import cuicaImage from 'figma:asset/e8d6f8720c59a3f49b37b9980a7f6edb0668e8c3.png';
import rodaFerroImage from 'figma:asset/c6cc582f8eccc3f8475a5bcd616dabf30c672346.png';
import rodaAluminioImage from 'figma:asset/9ec12e5b019f71af472941fcb20e2d2deb2018b3.png';

export const categories: Category[] = [
  {
    id: 1,
    name: 'Geladeiras Portáteis',
    slug: 'geladeiras-portateis',
    description: 'Geladeiras portáteis de alta eficiência para caminhões',
    image: geladeiraImage,
  },
  {
    id: 2,
    name: 'Ar Condicionado',
    slug: 'ar-condicionado',
    description: 'Sistemas de ar condicionado premium para cabines',
    image: arCondicionadoImage,
  },
  {
    id: 3,
    name: 'Catracas de Freio',
    slug: 'catracas-freio',
    description: 'Catracas de freio resistentes e duráveis',
    image:
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    name: 'Patim de Freio',
    slug: 'patim-freio',
    description: 'Patins de freio de alta performance',
    image:
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 5,
    name: 'Cuicas',
    slug: 'cuicas',
    description: 'Cuicas de suspensão importadas',
    image: cuicaImage,
  },
  {
    id: 6,
    name: 'Eixos',
    slug: 'eixos',
    description: 'Eixos reforçados para carga pesada',
    image:
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 7,
    name: 'Rodas de Ferro',
    slug: 'rodas-ferro',
    description: 'Rodas de ferro robustas e confiáveis',
    image: rodaFerroImage,
  },
  {
    id: 8,
    name: 'Rodas de Alumínio',
    slug: 'rodas-aluminio',
    description: 'Rodas de alumínio leves e resistentes',
    image: rodaAluminioImage,
  },
  {
    id: 9,
    name: 'Rolamentos',
    slug: 'rolamentos',
    description: 'Rolamentos de precisão e durabilidade',
    image:
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 10,
    name: 'Cinta com Catraca',
    slug: 'cinta-catraca',
    description: 'Cintas de amarração com catraca de segurança',
    image:
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 11,
    name: 'Pé de Carreta',
    slug: 'pe-carreta',
    description: 'Pés de apoio reforçados para carretas',
    image:
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 12,
    name: 'Mola de Cuica',
    slug: 'mola-cuica',
    description: 'Molas de suspensão de alta qualidade',
    image:
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 13,
    name: 'Gerador de Energia',
    slug: 'gerador-energia',
    description: 'Geradores de energia portáteis para caminhões e carretas',
    image:
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export const products: Product[] = [
  // Geladeiras Portáteis
  {
    id: 1,
    name: 'Geladeira Portátil 45L',
    category: 'Geladeiras Portáteis',
    categorySlug: 'geladeiras-portateis',
    sku: 'GP-45L-001',
    description:
      'Geladeira portátil com capacidade de 45 litros, ideal para longas viagens. Sistema de refrigeração eficiente que funciona em 12V/24V.',
    images: [geladeiraImage, geladeiraImage, geladeiraImage],
    specs: [
      { label: 'Capacidade', value: '45 Litros' },
      { label: 'Voltagem', value: '12V/24V DC' },
      { label: 'Temperatura', value: '-20°C a +20°C' },
      { label: 'Dimensões', value: '650 x 380 x 440 mm' },
      { label: 'Peso', value: '18 kg' },
      { label: 'Compressor', value: 'Danfoss' },
      { label: 'Garantia', value: '2 anos' },
    ],
  },
  {
    id: 2,
    name: 'Geladeira Portátil 60L',
    category: 'Geladeiras Portáteis',
    categorySlug: 'geladeiras-portateis',
    sku: 'GP-60L-002',
    description:
      'Modelo premium com 60 litros de capacidade, display digital e controle preciso de temperatura.',
    images: [geladeiraImage, geladeiraImage, geladeiraImage],
    specs: [
      { label: 'Capacidade', value: '60 Litros' },
      { label: 'Voltagem', value: '12V/24V DC' },
      { label: 'Temperatura', value: '-25°C a +20°C' },
      { label: 'Dimensões', value: '750 x 400 x 460 mm' },
      { label: 'Peso', value: '22 kg' },
      { label: 'Display', value: 'LED Digital' },
      { label: 'Garantia', value: '2 anos' },
    ],
  },
  // Ar Condicionado
  {
    id: 3,
    name: 'Ar Condicionado Teto 9000 BTUs',
    category: 'Ar Condicionado',
    categorySlug: 'ar-condicionado',
    sku: 'AC-9000-001',
    description:
      'Ar condicionado de teto potente com 9000 BTUs, baixo consumo de energia e operação silenciosa.',
    images: [arCondicionadoImage, arCondicionadoImage, arCondicionadoImage],
    specs: [
      { label: 'Potência', value: '9000 BTUs' },
      { label: 'Voltagem', value: '24V DC' },
      { label: 'Consumo', value: '45A' },
      { label: 'Tipo', value: 'Split Teto' },
      { label: 'Ruído', value: '55 dB' },
      { label: 'Gás', value: 'R134a' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  {
    id: 4,
    name: 'Ar Condicionado Teto 12000 BTUs',
    category: 'Ar Condicionado',
    categorySlug: 'ar-condicionado',
    sku: 'AC-12000-002',
    description: 'Modelo top de linha com 12000 BTUs, controle remoto e função sleep mode.',
    images: [arCondicionadoImage, arCondicionadoImage, arCondicionadoImage],
    specs: [
      { label: 'Potência', value: '12000 BTUs' },
      { label: 'Voltagem', value: '24V DC' },
      { label: 'Consumo', value: '55A' },
      { label: 'Tipo', value: 'Split Teto Premium' },
      { label: 'Ruído', value: '52 dB' },
      { label: 'Controle', value: 'Remoto Incluso' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  // Catracas de Freio
  {
    id: 5,
    name: 'Catraca Freio Automática S-Cam',
    category: 'Catracas de Freio',
    categorySlug: 'catracas-freio',
    sku: 'CF-SCAM-001',
    description:
      'Catraca de freio automática S-Cam de alta resistência, compatível com a maioria dos modelos de caminhões.',
    images: [
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Tipo', value: 'S-Cam Automática' },
      { label: 'Material', value: 'Aço Forjado' },
      { label: 'Aplicação', value: 'Universal' },
      { label: 'Curso', value: '5.5"' },
      { label: 'Certificação', value: 'INMETRO' },
      { label: 'Peso', value: '3.5 kg' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  {
    id: 6,
    name: 'Catraca Freio Manual Standard',
    category: 'Catracas de Freio',
    categorySlug: 'catracas-freio',
    sku: 'CF-MAN-002',
    description: 'Catraca manual standard com ajuste preciso e fácil instalação.',
    images: [
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Tipo', value: 'Manual Standard' },
      { label: 'Material', value: 'Aço Temperado' },
      { label: 'Aplicação', value: 'Universal' },
      { label: 'Curso', value: '5"' },
      { label: 'Dentes', value: '45' },
      { label: 'Peso', value: '2.8 kg' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  // Patim de Freio
  {
    id: 7,
    name: 'Patim de Freio Premium Heavy Duty',
    category: 'Patim de Freio',
    categorySlug: 'patim-freio',
    sku: 'PF-HD-001',
    description:
      'Patim de freio premium para aplicações pesadas, alta durabilidade e excelente coeficiente de atrito.',
    images: [
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1722086720227-bbd9c7869459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMGJyYWtlJTIwcGFydHN8ZW58MXx8fHwxNzY1NjI3NTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Material', value: 'Composto Semi-Metálico' },
      { label: 'Espessura', value: '19mm' },
      { label: 'Largura', value: '165mm' },
      { label: 'Comprimento', value: '350mm' },
      { label: 'Temperatura Máx', value: '600°C' },
      { label: 'Certificação', value: 'INMETRO' },
      { label: 'Garantia', value: '40.000 km' },
    ],
  },
  // Cuicas
  {
    id: 8,
    name: 'Cuica de Suspensão Reforçada',
    category: 'Cuicas',
    categorySlug: 'cuicas',
    sku: 'CU-REF-001',
    description:
      'Cuica de suspensão reforçada para carretas, alta capacidade de carga e resistência superior.',
    images: [cuicaImage, cuicaImage, cuicaImage],
    specs: [
      { label: 'Tipo', value: 'Pneumática Reforçada' },
      { label: 'Capacidade', value: '8.000 kg' },
      { label: 'Curso', value: '120mm' },
      { label: 'Pressão Máx', value: '10 bar' },
      { label: 'Material', value: 'Aço SAE 1045' },
      { label: 'Rosca', value: 'M16 x 1.5' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  // Eixos
  {
    id: 9,
    name: 'Eixo Carreta 3º Eixo Completo',
    category: 'Eixos',
    categorySlug: 'eixos',
    sku: 'EX-3EI-001',
    description:
      'Eixo completo para 3º eixo de carreta, fabricado em aço de alta resistência com todos os componentes.',
    images: [
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Capacidade', value: '10 toneladas' },
      { label: 'Bitola', value: '1.850mm' },
      { label: 'Sistema Freio', value: 'S-Cam' },
      { label: 'Material', value: 'Aço SAE 1045' },
      { label: 'Cubos', value: 'Inclusos' },
      { label: 'Freios', value: 'Inclusos' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  // Rodas de Ferro
  {
    id: 10,
    name: 'Roda de Ferro Aro 22.5 x 8.25',
    category: 'Rodas de Ferro',
    categorySlug: 'rodas-ferro',
    sku: 'RF-2285-001',
    description:
      'Roda de ferro robusta aro 22.5 x 8.25 para caminhões e carretas, tratamento anticorrosão.',
    images: [rodaFerroImage, rodaFerroImage, rodaFerroImage],
    specs: [
      { label: 'Aro', value: '22.5 x 8.25' },
      { label: 'Material', value: 'Aço Carbono' },
      { label: 'Furação', value: '10 furos' },
      { label: 'Centro', value: '285mm' },
      { label: 'Acabamento', value: 'Pintura Epóxi' },
      { label: 'Peso', value: '28 kg' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  // Rodas de Alumínio
  {
    id: 11,
    name: 'Roda Alumínio Aro 22.5 x 9.00 Polida',
    category: 'Rodas de Alumínio',
    categorySlug: 'rodas-aluminio',
    sku: 'RA-2290-001',
    description:
      'Roda de alumínio polida de alto brilho, leve e resistente, reduz peso e melhora estética do veículo.',
    images: [rodaAluminioImage, rodaAluminioImage, rodaAluminioImage],
    specs: [
      { label: 'Aro', value: '22.5 x 9.00' },
      { label: 'Material', value: 'Alumínio Liga 6061' },
      { label: 'Furação', value: '10 furos' },
      { label: 'Acabamento', value: 'Polido Alto Brilho' },
      { label: 'Peso', value: '16 kg' },
      { label: 'Certificação', value: 'ISO 9001' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  // Rolamentos
  {
    id: 12,
    name: 'Rolamento Roda Dianteira Cônico',
    category: 'Rolamentos',
    categorySlug: 'rolamentos',
    sku: 'RL-CON-001',
    description:
      'Rolamento cônico de precisão para roda dianteira de caminhão, alta durabilidade e resistência.',
    images: [
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Tipo', value: 'Cônico Simples' },
      { label: 'Diâmetro Interno', value: '50mm' },
      { label: 'Diâmetro Externo', value: '95mm' },
      { label: 'Largura', value: '24mm' },
      { label: 'Material', value: 'Aço Cromo' },
      { label: 'Lubrificação', value: 'Graxa Pré-aplicada' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  // Cinta com Catraca
  {
    id: 13,
    name: 'Cinta Catraca 9 Metros 5 Toneladas',
    category: 'Cinta com Catraca',
    categorySlug: 'cinta-catraca',
    sku: 'CC-9M5T-001',
    description:
      'Cinta de amarração com catraca de 9 metros, capacidade 5 toneladas, alta resistência e segurança.',
    images: [
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Comprimento', value: '9 metros' },
      { label: 'Largura', value: '50mm' },
      { label: 'Capacidade', value: '5.000 kg' },
      { label: 'Material', value: 'Poliéster de Alta Tenacidade' },
      { label: 'Catraca', value: 'Aço Galvanizado' },
      { label: 'Certificação', value: 'INMETRO' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  // Pé de Carreta
  {
    id: 14,
    name: 'Pé de Apoio Carreta 25 Toneladas',
    category: 'Pé de Carreta',
    categorySlug: 'pe-carreta',
    sku: 'PC-25T-001',
    description:
      'Pé de apoio reforçado para carretas, capacidade 25 toneladas, sistema de elevação manual com dupla velocidade.',
    images: [
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Capacidade', value: '25 toneladas' },
      { label: 'Curso', value: '450mm' },
      { label: 'Material', value: 'Aço SAE 1045' },
      { label: 'Rosca', value: '2"' },
      { label: 'Sapata', value: '200 x 200mm' },
      { label: 'Peso', value: '45 kg' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  // Mola de Cuica
  {
    id: 15,
    name: 'Mola Cuica Suspensão Traseira',
    category: 'Mola de Cuica',
    categorySlug: 'mola-cuica',
    sku: 'MC-TR-001',
    description:
      'Mola de suspensão para cuica traseira, alta resistência e durabilidade, tratamento térmico especial.',
    images: [
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1570463806618-258bad4cef03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVjayUyMHBhcnRzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2NTYyNzU0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Tipo', value: 'Helicoidal' },
      { label: 'Diâmetro Arame', value: '16mm' },
      { label: 'Diâmetro Externo', value: '120mm' },
      { label: 'Comprimento Livre', value: '380mm' },
      { label: 'Material', value: 'Aço Mola SAE 9254' },
      { label: 'Carga', value: '1.200 kg' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  // Geradores de Energia
  {
    id: 50,
    name: 'Gerador Diesel 5000W',
    category: 'Gerador de Energia',
    categorySlug: 'gerador-energia',
    sku: 'GE-5000D-001',
    description:
      'Gerador diesel profissional de 5000W, ideal para caminhões e aplicações industriais. Alta autonomia e baixo consumo.',
    images: [
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Potência', value: '5000W / 5.5 KVA' },
      { label: 'Combustível', value: 'Diesel' },
      { label: 'Autonomia', value: '8 horas' },
      { label: 'Voltagem', value: '110V/220V' },
      { label: 'Tanque', value: '15 litros' },
      { label: 'Partida', value: 'Elétrica/Manual' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
  {
    id: 51,
    name: 'Gerador Gasolina 3500W',
    category: 'Gerador de Energia',
    categorySlug: 'gerador-energia',
    sku: 'GE-3500G-002',
    description:
      'Gerador a gasolina compacto e silencioso de 3500W, perfeito para uso em veículos pesados.',
    images: [
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1650623193271-c951c7bb26ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGdlbmVyYXRvciUyMGVuZXJneXxlbnwxfHx8fDE3NjU2MzkyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    specs: [
      { label: 'Potência', value: '3500W / 3.8 KVA' },
      { label: 'Combustível', value: 'Gasolina' },
      { label: 'Autonomia', value: '6 horas' },
      { label: 'Voltagem', value: '110V/220V' },
      { label: 'Tanque', value: '12 litros' },
      { label: 'Ruído', value: '65 dB' },
      { label: 'Garantia', value: '1 ano' },
    ],
  },
];
