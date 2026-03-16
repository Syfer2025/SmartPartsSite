import { ShoppingCart, X, Minus, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { OrderForm } from './OrderForm';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface OrderFormData {
  cnpj: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
}

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();

  const handleAddItem = (productId: string, currentQty: number) => {
    updateQuantity(productId, currentQty + 1);
  };

  const handleRemoveItem = (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Carrinho limpo', {
      description: 'Todos os itens foram removidos do carrinho.',
    });
  };

  const handleOrderFormSubmit = async (formData: OrderFormData) => {
    if (items.length === 0) return;

    try {
      const orderData = {
        customer: formData,
        items: items.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
        })),
      };

      // Salvar pedido no backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d06f92b7/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          },
          body: JSON.stringify(orderData),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Não foi possível parsear erro
        }
        throw new Error(errorMsg);
      }

      const data = JSON.parse(responseText);
      const orderId = data.orderId;

      // Gerar link do pedido
      const orderLink = `${window.location.origin}/pedido/${orderId}`;

      // Enviar link via WhatsApp
      let message = `*NOVO PEDIDO - SMART PARTS IMPORT*\n\n`;
      message += `*DADOS DO SOLICITANTE*\n`;
      message += `CNPJ: ${formData.cnpj}\n`;
      message += `Nome: ${formData.nomeCompleto}\n`;
      message += `Telefone: ${formData.telefone}\n`;
      message += `Email: ${formData.email}\n\n`;
      message += `*Acesse o pedido completo:*\n`;
      message += `${orderLink}\n\n`;
      message += `Neste link você pode visualizar todos os detalhes e baixar o PDF do pedido.\n\n`;
      message += `Aguardo retorno com o orçamento. Obrigado!`;

      const phone = '+5544997260058';
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      toast.success('Pedido enviado com sucesso!', {
        description: 'Link do pedido foi enviado via WhatsApp.',
        duration: 4000,
      });

      // Limpar carrinho após enviar
      clearCart();
      setIsOpen(false);
      setShowOrderForm(false);
    } catch (error: any) {
      toast.error('Erro ao enviar pedido', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    }
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black hover:bg-gray-900 text-white p-4 rounded-full shadow-2xl border-2 border-red-600 transition-all z-[9999] cart-btn-hover"
        aria-label="Abrir carrinho de pedidos"
      >
        <ShoppingCart className="w-7 h-7" />
        {getTotalItems() > 0 && (
          <div
            className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg cart-badge-pop"
            aria-label={`${getTotalItems()} itens no carrinho`}
          >
            {getTotalItems()}
          </div>
        )}
      </button>

      {/* Cart Sidebar — CSS transitions (always rendered) */}
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] cart-sidebar-backdrop ${isOpen ? 'open' : ''}`}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col cart-sidebar-panel ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl">Seu Pedido</h2>
              <p className="text-sm text-gray-300">{getTotalItems()} itens</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-2 rounded-lg transition cart-close-hover"
            tabIndex={isOpen ? 0 : -1}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-24 h-24 mb-4 opacity-20" />
              <p className="text-lg font-semibold">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para fazer seu pedido</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-red-600 transition cart-item-enter"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-black text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">SKU: {item.sku}</p>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveItem(item.productId, item.quantity)}
                            className="bg-gray-200 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition cart-qty-hover"
                            tabIndex={isOpen ? 0 : -1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-black text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleAddItem(item.productId, item.quantity)}
                            className="bg-gray-200 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition cart-qty-hover"
                            tabIndex={isOpen ? 0 : -1}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition cart-remove-hover"
                          tabIndex={isOpen ? 0 : -1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total de itens:</span>
                <span className="font-black text-lg">{getTotalItems()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowOrderForm(true);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 shadow-lg mb-3 cart-cta-hover"
              tabIndex={isOpen ? 0 : -1}
            >
              <Send className="w-5 h-5" />
              Enviar Pedido via WhatsApp
            </button>

            <button
              onClick={handleClearCart}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 order-form-btn"
              tabIndex={isOpen ? 0 : -1}
            >
              <Trash2 className="w-4 h-4" />
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>

      {/* Order Form */}
      {showOrderForm && (
        <OrderForm
          onSubmit={handleOrderFormSubmit}
          onCancel={() => setShowOrderForm(false)}
        />
      )}
    </>
  );
}
