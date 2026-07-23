import React, { useContext } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react'; // Adicionado Eye
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';

const ProductCard = ({ product, formatPrice, onAddToCart, user }) => {
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const discountPercent = product.onSale && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col border border-gray-100 overflow-hidden"
    >
      {/* Imagem Container */}
      <div className="relative aspect-[1/1] overflow-hidden bg-gray-50/50">
        <img
          src={product.image?.startsWith('/uploads') ? `${product.image}` : product.image}
          alt={product.name}
          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges Flutuantes */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.onSale && (
            <span
              className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg backdrop-blur-md"
              style={{ backgroundColor: settings?.discountColor || '#ff4d4f' }}
            >
              -{discountPercent}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-3 py-1 text-xs font-bold bg-gray-900 text-white rounded-full shadow-lg">
              ESGOTADO
            </span>
          )}
          {product.isNew && (
            <span className="px-3 py-1 text-xs font-bold bg-emerald-500 text-white rounded-full shadow-lg">
              NOVO
            </span>
          )}
          {product.inStock && product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 5) && (
            <span className="px-3 py-1 text-xs font-bold bg-orange-500 text-white rounded-full shadow-lg animate-pulse">
              �aLTIMAS {product.stockQuantity}
            </span>
          )}
        </div>

        {/* Ações Rápidas (Overlay no Hover) */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20 px-4">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${product.inStock
              ? 'bg-gray-900 text-white hover:bg-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <ShoppingCart size={16} />
            {product.inStock ? 'Comprar' : 'Indis.'}
          </button>
          <button className="p-2.5 bg-white text-gray-700 rounded-full shadow-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="mb-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            {product.category?.[0] || 'Futebol'}
          </p>
        </div>
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            {product.onSale && (
              <span className="text-xs text-gray-400 line-through decoration-gray-300 mb-0.5">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ color: product.onSale ? (settings?.discountColor || '#ff4d4f') : '#111827' }}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Seta discreta */}
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Eye size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
