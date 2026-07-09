�import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingBag, Minus, Plus, Shield } from 'lucide-react';

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/Authcontext";
import { useCurrency } from "../context/CurrencyContext";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, loading, updateQuantity, removeItem, clearCart, getTotal } = useContext(CartContext);
  const { formatPrice } = useCurrency();

  const handleCheckout = () => {
    if (!user) {
      // Opcional: Salvar intenção de checkout para redirecionar depois do login
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Carregando carrinho...</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-md">Parece que você ainda não adicionou nenhum item. Explore nossa coleção e encontre o produto ideal para você.</p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Voltar à Loja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="text-blue-600" />
            Seu Carrinho
            <span className="text-lg font-normal text-gray-400 ml-2">({cart.length} itens)</span>
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={18} /> Continuar Comprando
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-8">
            {Object.values(
              cart.reduce((acc, item) => {
                const sId = item.shopId || "default";
                if (!acc[sId]) {
                  acc[sId] = {
                    shopId: sId,
                    shopName: item.shopName || "Loja Principal",
                    items: []
                  };
                }
                acc[sId].items.push(item);
                return acc;
              }, {})
            ).map((group) => (
              <div key={group.shopId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-500" />
                  {group.shopName}
                </h2>
                <div className="space-y-4">
                  {group.items.map((item) => (
              <div key={item._id || item.productId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                {/* Imagem */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl flex-shrink-0 p-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Detalhes */}
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    Tamanho: <span className="font-medium text-gray-900">{item.selectedSize}</span>
                  </div>
                  {/* Visualização da Personalização */}
                  {(item.customization?.name || item.customization?.number || item.customization?.hasBadge) && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-2">
                      {(item.customization.name || item.customization.number) && (
                        <div className="font-bold text-gray-700">
                          {item.customization.name} {item.customization.number}
                        </div>
                      )}
                      {item.customization.hasBadge && (
                        <div className="text-blue-600 font-medium">+ Patch Champions/Badge</div>
                      )}
                    </div>
                  )}
                  <div className="font-bold text-blue-600 text-lg">
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Quantidade */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item._id || item.productId, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id || item.productId, Math.min(10, item.quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-black"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Remover */}
                <button
                  onClick={() => removeItem(item._id || item.productId)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Remover item"
                >
                  <Trash2 size={20} />
                  </button>
                </div>
              ))}
              </div>
            </div>
            ))}

            <div className="flex justify-end pt-4">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-2"
              >
                <Trash2 size={16} /> Esvaziar Carrinho
              </button>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span className="text-green-600 font-medium">Calculado no Checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-extrabold text-2xl text-blue-600">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                Finalizar Compra <ArrowLeft className="rotate-180" size={20} />
              </button>

              <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-2">
                <Shield size={12} /> Compra 100% Segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
