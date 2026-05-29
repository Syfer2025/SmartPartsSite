import { User, Building2, Phone, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface OrderFormData {
  cnpj: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
}

export function OrderForm({ onSubmit, onCancel }: OrderFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<OrderFormData>({
    cnpj: '',
    nomeCompleto: '',
    telefone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(numbers[12])) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(numbers[13])) return false;

    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    // Telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular)
    if (numbers.length !== 10 && numbers.length !== 11) return false;
    // Verifica se o DDD é válido (11 a 99)
    const ddd = parseInt(numbers.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    return true;
  };

  const validateForm = () => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.cnpj) {
      newErrors.cnpj = t('orderForm.cnpjRequired');
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = t('orderForm.cnpjInvalid');
    }

    if (!formData.nomeCompleto || formData.nomeCompleto.trim().length < 3) {
      newErrors.nomeCompleto = t('orderForm.nameInvalid');
    }

    if (!formData.telefone) {
      newErrors.telefone = t('orderForm.phoneRequired');
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = t('orderForm.phoneInvalid');
    }

    if (!formData.email) {
      newErrors.email = t('orderForm.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('orderForm.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 order-form-backdrop"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden order-form-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 hover:bg-white/10 p-2 rounded-lg transition cart-close-hover"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-black text-2xl mb-2">{t('orderForm.title')}</h2>
          <p className="text-sm text-gray-300">{t('orderForm.subtitle')}</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* CNPJ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              {t('orderForm.cnpjLabel')} *
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.cnpj
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-black focus:ring-gray-200'
              }`}
            />
            {errors.cnpj && <p className="text-red-600 text-xs mt-1 ml-1">{errors.cnpj}</p>}
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {t('orderForm.nameLabel')} *
            </label>
            <input
              type="text"
              value={formData.nomeCompleto}
              onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              placeholder={t('orderForm.namePlaceholder')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.nomeCompleto
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-black focus:ring-gray-200'
              }`}
            />
            {errors.nomeCompleto && (
              <p className="text-red-600 text-xs mt-1 ml-1">{errors.nomeCompleto}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              {t('orderForm.phoneLabel')} *
            </label>
            <input
              type="text"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.telefone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-black focus:ring-gray-200'
              }`}
            />
            {errors.telefone && <p className="text-red-600 text-xs mt-1 ml-1">{errors.telefone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              {t('orderForm.emailLabel')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-black focus:ring-gray-200'
              }`}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition order-form-btn"
            >
              {t('orderForm.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-black to-gray-900 text-white rounded-xl font-black hover:shadow-xl transition order-form-btn order-form-submit"
            >
              {t('orderForm.continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
