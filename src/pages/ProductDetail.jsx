import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, Heart, Star, Truck, RefreshCw, Shield, Check, Minus, Plus, Tag, Share2, ChevronRight } from 'lucide-react';

import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { usePromotions } from "../hooks/usePromotions";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const { addToCart } = useContext(CartContext);
  const loggedUserId = user?.id;

  const { formatPrice } = useCurrency();
  const { calculateDiscountedPrice } = usePromotions();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedAttributes, setSelectedAttributes] = useState({}); // ðŸŽ¨ {Sabor: "Menta", Cor: "Azul"}
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [feedbacks, setFeedbacks] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [manualCoupon, setManualCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const customizationPrice = settings?.customizationPrice || 3;
  const badgePrice = settings?.badgePrice || 5;

  // --- Derived State ---
  const effectiveProduct = useMemo(() => {
    if (!product) return null;
    const autoPromoProduct = calculateDiscountedPrice(product);

    if (manualCoupon) {
      if (manualCoupon.finalPrice < autoPromoProduct.finalPrice) {
        return {
          ...autoPromoProduct,
          finalPrice: manualCoupon.finalPrice,
          discountPercent: manualCoupon.discountPercent,
          onSale: true,
          isCouponApplied: true,
          originalPrice: autoPromoProduct.originalPrice || autoPromoProduct.price,
          promoTitle: manualCoupon.title
        };
      }
    }
    return autoPromoProduct;
  }, [product, manualCoupon, calculateDiscountedPrice]);

  const baseFinalPrice = effectiveProduct ? effectiveProduct.finalPrice : 0;
  const finalPrice = baseFinalPrice;

  // --- Actions ---
  const applyCoupon = async () => {
    if (!couponCode) return alert("Digite o cÃ³digo do cupom");
    try {
      const validateRes = await fetch("/api/marketing/promotions/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, productId: product._id, userId: user?.id })
      });

      if (!validateRes.ok) {
        const err = await validateRes.json();
        setManualCoupon(null);
        return alert(err.message || "Cupom invÃ¡lido");
      }

      const couponData = await validateRes.json();
      const manualDiscountAmount = (product.price * couponData.discount) / 100;
      const manualFinalPrice = product.price - manualDiscountAmount;
      const autoPromo = calculateDiscountedPrice(product);

      if (manualFinalPrice < autoPromo.finalPrice) {
        setManualCoupon({
          finalPrice: manualFinalPrice,
          discountPercent: couponData.discount,
          code: couponData.code,
          title: couponData.isNewUserCoupon ? "Boas-Vindas" : `Cupom ${couponData.code}`,
        });
        alert(`Cupom "${couponData.code}" aplicado! (${couponData.discount}% OFF)`);
      } else {
        alert("A promoÃ§Ã£o automÃ¡tica atual oferece um desconto maior!");
        setManualCoupon(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao validar cupom");
    }
  };

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        setSelectedSize((data.size && data.size.length > 0) ? data.size[0] : null);

        // ðŸŽ¨ Inicializar atributos com a primeira opÃ§Ã£o de cada um
        if (data.attributes && data.attributes.length > 0) {
          const initialAttrs = {};
          data.attributes.forEach(attr => {
            if (attr.options && attr.options.length > 0) {
              initialAttrs[attr.name] = attr.options[0];
            }
          });
          setSelectedAttributes(initialAttrs);
        }
      } else {
        navigate('/');
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [id, navigate]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`/api/feedback/product/${id}`);
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) { console.error(err); }
  }, [id]);

  const checkFavorite = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/favorites", { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) setIsFavorite((await res.json()).some((p) => p._id === id));
    } catch (err) { console.error(err); }
  }, [id, user]);

  useEffect(() => {
    fetchProductData();
    fetchFeedbacks();
    checkFavorite();
  }, [fetchProductData, fetchFeedbacks, checkFavorite]);

  const handleAddToCart = async () => {
    if (!product.inStock) return;
    await addToCart({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      selectedSize,
      selectedAttributes, // ðŸŽ¨ Atributos selecionados
      quantity,
      shopId: product.shopId,
      shopName: product.shopId?.vendorInfo?.storeName || product.shopId?.name
    });
  };

  const buyNow = async () => {
    if (!product.inStock) return;
    const success = await addToCart({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      selectedSize,
      selectedAttributes, // ðŸŽ¨ Atributos selecionados
      quantity,
      shopId: product.shopId,
      shopName: product.shopId?.vendorInfo?.storeName || product.shopId?.name
    });
    if (success) navigate("/checkout");
    else navigate("/cart");
  };

  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    setIsFavorite((prev) => !prev);
    const method = isFavorite ? "DELETE" : "POST";
    const res = await fetch(`/api/favorites/${id}`, { method, headers: { Authorization: `Bearer ${user.token}` } });
    if (!res.ok) setIsFavorite((prev) => !prev);
  };

  const submitFeedback = async () => {
    if (!user) return;
    if (!newComment.trim()) return alert("Escreva um comentÃ¡rio");

    const url = editingFeedbackId
      ? `/api/feedback/${editingFeedbackId}`
      : `/api/feedback`;

    const method = editingFeedbackId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ product: id, rating: newRating, comment: newComment })
      });
      setNewComment("");
      setNewRating(5);
      setEditingFeedbackId(null);
      fetchFeedbacks();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : 0;

  const siteName = settings?.siteName || 'nossa loja';

  return (
    <div className="min-h-screen pb-20 bg-white">
      <Helmet>
        <title>{`${product.name} | ${siteName}`}</title>
        <meta name="description" content={`Compre a ${product.name} na ${siteName}. ${product.description ? product.description.substring(0, 150) : ""}...`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image} />
        <meta property="og:price:amount" content={finalPrice} />
        <meta property="og:price:currency" content="EUR" />
      </Helmet>

      {/* Breadcrumb simples */}
      <div className="container mx-auto px-4 py-4 text-sm text-gray-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={14} className="inline mx-2" />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/products')}>Produtos</span>
        <ChevronRight size={14} className="inline mx-2" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna da Imagem */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 relative group">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
              {effectiveProduct.onSale && (
                <span className="absolute top-6 left-6 bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md">
                  -{effectiveProduct.discountPercent.toFixed(0)}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Coluna de Detalhes */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>

            {/* ðŸª VENDOR INFO */}
            {product.shopId && product.shopId.vendorInfo?.slug && (
              <div className="mb-4">
                <span className="text-gray-500">Vendido por: </span>
                <Link
                  to={`/store/${product.shopId.vendorInfo.slug}`}
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {product.shopId.vendorInfo.storeName || product.shopId.name}
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <Star className="fill-current" size={20} />
                <span className="ml-1 text-gray-700 font-bold">{avgRating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{feedbacks.length} avaliaÃ§Ãµes</span>
              <span className="text-gray-400">|</span>
              {product.inStock ? (
                product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 5) ? (
                  <span className="text-red-500 font-bold animate-pulse">
                    ðŸ”¥ Ãšltimas {product.stockQuantity} unidades!
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">Em Stock</span>
                )
              ) : (
                <span className="text-red-600 font-medium">Esgotado</span>
              )}
            </div>

            {/* PREÃ‡O */}
            <div className="mb-8">
              {effectiveProduct.onSale && (
                <span className="text-gray-400 text-lg line-through block">
                  {formatPrice(effectiveProduct.originalPrice * quantity)}
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-blue-600">
                  {formatPrice(finalPrice * quantity)}
                </span>
                {effectiveProduct.isCouponApplied && (
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Cupom Ativo
                  </span>
                )}
              </div>
            </div>

            {/* SELETORES */}
            <div className="space-y-6 mb-8 border-t border-b border-gray-100 py-6">
              {/* Tamanho */}
              {product.size && product.size.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-3">Tamanho Selecionado: <span className="text-gray-900 font-bold">{selectedSize}</span></span>
                  <div className="flex flex-wrap gap-3">
                    {product.size.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${selectedSize === s
                          ? "bg-black text-white shadow-lg scale-110"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ðŸŽ¨ ATRIBUTOS DINÃ‚MICOS (Sabor, Cor, etc.) */}
              {product.attributes && product.attributes.length > 0 && product.attributes.map((attr, index) => (
                <div key={index}>
                  <span className="block text-sm font-medium text-gray-700 mb-3">
                    {attr.name}: <span className="text-gray-900 font-bold">{selectedAttributes[attr.name]}</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {attr.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.name]: option }))}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center justify-center transition-all ${selectedAttributes[attr.name] === option
                          ? "bg-black text-white shadow-lg scale-110"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantidade */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-3">Quantidade</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-black disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-black"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTÃ•ES DE AÃ‡ÃƒO */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} /> Adicionar
                </button>
                <button
                  onClick={buyNow}
                  disabled={!product.inStock}
                  className="py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Comprar Agora
                </button>
              </div>

              {/* Cupom Input */}
              <div className="flex gap-2 mt-2">
                <div className="relative flex-grow">
                  <Tag className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors uppercase font-medium placeholder-normal"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  className="px-6 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* INFO EXTRA */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-500" size={20} />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">DisponÃ­vel para Entrega</span>
                  <span className="text-xs text-gray-500">
                    {product.shopId?.vendorInfo?.shippingSettings?.deliveryTime || product.deliveryTime || "Envio calculado no checkout"}
                  </span>
                  {settings?.freeShippingThreshold > 0 && (
                    <span className="text-xs font-bold text-green-600 mt-0.5">
                      {finalPrice * quantity >= settings.freeShippingThreshold
                        ? "Frete GrÃ¡tis disponÃ­vel!"
                        : `Frete GrÃ¡tis acima de ${formatPrice(settings.freeShippingThreshold)}`
                      }
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="text-green-500" size={20} />
                <span>{product.shopId?.vendorInfo?.shippingSettings?.returnPolicy || product.returnTime || settings?.returnTime || "14 dias para devoluÃ§Ã£o"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-yellow-500" size={20} />
                <span>Garantia de Qualidade</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer hover:text-red-500" onClick={toggleFavorite}>
                <Heart className={isFavorite ? "fill-red-500 text-red-500" : ""} size={20} />
                <span>{isFavorite ? "Favoritado" : "Adicionar aos Favoritos"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS TABS SECTION */}
        <div className="mt-20">
          <div className="border-b border-gray-200 flex gap-8 mb-8">
            {["description", "specs", "reviews"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg font-medium transition-all relative ${activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {tab === "description" && "DescriÃ§Ã£o"}
                {tab === "specs" && "Detalhes TÃ©cnicos"}
                {tab === "reviews" && `AvaliaÃ§Ãµes (${feedbacks.length})`}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === "description" && (
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {product.description || "Sem descriÃ§Ã£o disponÃ­vel."}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {product.material && (
                    <div className="border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-500">Material</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.material}</dd>
                    </div>
                  )}
                  {product.size && product.size.length > 0 && (
                    <div className="border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-500">Tamanhos</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.size.join(", ")}</dd>
                    </div>
                  )}
                  {product.technicalDetails && (
                    <div className="col-span-2 border-b border-gray-200 pb-2">
                      <dt className="text-sm font-medium text-gray-500">Detalhes TÃ©cnicos</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{product.technicalDetails}</dd>
                    </div>
                  )}

                  {/* ðŸŽ¨ ATRIBUTOS DINÃ‚MICOS */}
                  {product.attributes && product.attributes.length > 0 && (
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-3">OpÃ§Ãµes DisponÃ­veis</dt>
                      <dd className="space-y-3">
                        {product.attributes.map((attr, index) => (
                          <div key={index} className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-700">{attr.name}:</span>
                            <div className="flex gap-2 flex-wrap">
                              {attr.options.map((opt, i) => (
                                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-3xl">
                {user && (
                  <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                    <h3 className="font-bold mb-4">Deixe sua avaliaÃ§Ã£o</h3>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none">
                          <Star size={24} className={star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-blue-500 mb-4"
                      rows="3"
                      placeholder="O que vocÃª achou do produto?"
                    ></textarea>
                    <button onClick={submitFeedback} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                      Enviar AvaliaÃ§Ã£o
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {feedbacks.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhuma avaliaÃ§Ã£o ainda.</p>
                  ) : (
                    feedbacks.map(fb => (
                      <div key={fb._id} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            {fb.client?.name ? fb.client.name.charAt(0) : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{fb.client?.name || "AnÃ´nimo"}</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={12} className={star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{fb.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Produtos Relacionados</h2>
          <RelatedProducts productId={id} />
        </div>
      </div>
    </div>
  );
};

// Componente RelatedProducts separado
const RelatedProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}/related`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, [productId]);

  if (!products || !Array.isArray(products) || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <ProductCard
          key={p._id}
          product={p}
          formatPrice={formatPrice}
          user={user}
          onAddToCart={(prod) => {
            addToCart({
              id: prod._id,
              name: prod.name,
              price: prod.price, // Basic price, could be improved
              image: prod.image,
              selectedSize: prod.size && prod.size.length > 0 ? prod.size[0] : "M",
              quantity: 1,
              shopId: prod.shopId,
              shopName: prod.shopId?.vendorInfo?.storeName || prod.shopId?.name || prod.shopName
            });
          }}
        />
      ))}
    </div>
  );
}

export default ProductDetail;
