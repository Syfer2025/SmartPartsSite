import { motion } from 'motion/react';
import { X, FileText, MessageCircle, Download, ArrowRight } from 'lucide-react';

interface CustomerData {
  cnpj: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
}

interface PDFInstructionsProps {
  customer: CustomerData;
  onOpenWhatsApp: () => void;
  onClose: () => void;
}

export function PDFInstructions({ customer, onOpenWhatsApp, onClose }: PDFInstructionsProps) {
  const fileName = `Pedido_SmartParts_${customer.nomeCompleto.split(' ')[0]}_${new Date().getTime()}.pdf`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 relative">
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-black text-2xl">PDF Gerado!</h2>
              <p className="text-sm text-green-100">Pronto para enviar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 p-2 rounded-lg mt-0.5">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1">Download Concluído</h3>
                <p className="text-sm text-green-700">
                  O arquivo <span className="font-semibold">{fileName}</span> foi baixado para seu
                  computador.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Como enviar pelo WhatsApp
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white font-black text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  Clique no botão <span className="font-bold text-green-600">"Abrir WhatsApp"</span>{' '}
                  abaixo
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white font-black text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  No WhatsApp, clique no <span className="font-bold">ícone de anexo (📎)</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white font-black text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  Selecione <span className="font-bold">"Documento"</span> e escolha o arquivo PDF
                  baixado
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-600 text-white font-black text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-sm text-gray-700">
                  Adicione uma mensagem (opcional) e clique em{' '}
                  <span className="font-bold">enviar ✓</span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Pedido de:</p>
            <p className="font-bold text-gray-900">{customer.nomeCompleto}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Fechar
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenWhatsApp}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-black hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Abrir WhatsApp
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
