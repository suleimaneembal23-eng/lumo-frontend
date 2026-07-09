�import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, RefreshCw, Truck, Shield, Flame, Star, ShoppingBag, ArrowRight, Zap } from 'lucide-react';

import { SettingsContext } from "../context/SettingsContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/Authcontext";
import { useCurrency } from "../context/CurrencyContext";
import { usePromotions } from "../hooks/usePromotions";

import CountdownTimer from './CountdownTimer';
import ProductCard from '../components/ProductCard';

import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const MAX_PRICE = 200000; // 200.000 FCFA

const Home = () => {
    const { settings } = useContext(SettingsContext);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const { currency, toggleCurrency, formatPrice } = useCurrency();
    const { activePromotions } = usePromotions();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        selectedCategory: "Todas as Categorias", priceRange: [0, MAX_PRICE], searchQuery: "", promoFilterId: null,
    });

    const { selectedCategory, priceRange, searchQuery, promoFilterId } = filters;
    const isSearching = searchQuery.trim().length > 0;

    const updateFilters = useCallback((key, value) => setFilters(prev => ({ ...prev, [key]: value })), []);
    const navigate = useNavigate();
    const location = useLocation();

    const [catalogs, setCatalogs] = useState([]);

    const categories = [
        { key: "Todas as Categorias", label: "Todos os Produtos" },
        ...catalogs.filter(c => c !== "Todas as Categorias").map(c => ({ key: c, label: c }))
    ];

    useEffect(() => {
        fetchProducts();
        fetchCatalogs();
    }, [location.search]);

    const fetchCatalogs = async () => {
        try {
            const res = await fetch("/api/products/categories");
            const data = await res.json();
            if (res.ok) setCatalogs(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(location.search);
            const promoId = params.get('promotion');
            if (promoId) updateFilters('promoFilterId', promoId);

            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart({
            id: product._id,
            name: product.name,
            price: product.onSale ? (product.price * (1 - (product.discountPercent || 0) / 100)) : product.price,
            image: product.image,
            selectedSize: product.size[0] || "M",
            quantity: 1,
            shopId: product.shopId,
            shopName: product.shopId?.vendorInfo?.storeName || product.shopId?.name || product.shopName
        });
    };

    // Filtrar promoções de "novos usuários" para NÒO exibir no preço de vitrine
    const eligiblePromotions = activePromotions.filter(p => {
        // Palavras-chave para identificar promoções de novos usuários
        const keywords = ["novo", "mimo", "boas-vindas", "bem-vindo", "welcome", "primeira compra"];
        const title = p.title?.toLowerCase() || "";
        const desc = p.description?.toLowerCase() || "";

        // Sempre excluir cupons de boas-vindas do cálculo de preço automático
        if (keywords.some(k => title.includes(k) || desc.includes(k))) {
            return false;
        }
        return true;
    });

    // �xa� APLICA�!ÒO GLOBAL DE DESCONTOS
    // Processa todos os produtos para encontrar o melhor desconto aplicável
    const processedProducts = products.map(product => {
        let bestDiscount = 0;
        let appliedPromo = null;

        // Verifica todas as promoções elegíveis (excluindo cupons de novo usuário se já logado, etc)
        eligiblePromotions.forEach(promo => {
            if (promo.isNewUserCoupon) return; // Ignora cupons de boas-vindas no cálculo automático de preço

            const appliesToProduct =
                promo.products.includes(product._id) ||
                (promo.categories && promo.categories.some(c => product.category.includes(c))) ||
                (promo.categories && promo.categories.includes("Todas as Categorias"));

            const isVendorMatch = !promo.vendorId || promo.vendorId === product.vendor;

            if (appliesToProduct && isVendorMatch && promo.discount > bestDiscount) {
                bestDiscount = promo.discount;
                appliedPromo = promo;
            }
        });

        // Se encontrou desconto, modifica o produto
        if (bestDiscount > 0) {
            return {
                ...product,
                onSale: true,
                originalPrice: product.price,
                price: Number((product.price * (1 - bestDiscount / 100)).toFixed(2)),
                discountPercent: bestDiscount,
                promotionTag: appliedPromo?.isDailyDeal ? "OFERTA DO DIA" : null
            };
        }

        return product;
    });

    const filteredProducts = processedProducts.filter((p) => {
        if (selectedCategory !== "Todas as Categorias" && !p.category.includes(selectedCategory)) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (promoFilterId) return true;
        return true;
    });



    const mainPromoForBanner = eligiblePromotions.find(p => !p.isDailyDeal && p.active);

    const dailyDealPromotion = activePromotions.find(p => p.isDailyDeal && p.active);

    // Produtos em destaque e filtrados para seções (Baseado nos produtos já processados com desconto)
    const featuredProducts = processedProducts.filter(p => p.featured).slice(0, 4);

    const promoProducts = dailyDealPromotion
        ? products.filter(p => {
            const applies = dailyDealPromotion.products.includes(p._id) || (dailyDealPromotion.categories && dailyDealPromotion.categories.some(c => p.category.includes(c))) || (dailyDealPromotion.categories && dailyDealPromotion.categories.includes("Todas as Categorias"));
            const isVendorMatch = !dailyDealPromotion.vendorId || dailyDealPromotion.vendorId === p.vendor;
            return applies && isVendorMatch;
        })
        : [];

    const filterAndScrollToDailyDeal = () => {
        const element = document.getElementById('daily-deal-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToProducts = () => {
        const element = document.getElementById('products-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    const HeroSection = () => (
        <div className="relative w-full h-[500px] md:h-[600px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
                <span className="inline-block px-4 py-1.5 bg-yellow-400 text-black font-bold text-sm uppercase tracking-wider rounded-full mb-6 w-fit animate-slideDown">
                    {mainPromoForBanner?.title ? "Destaque da Semana" : `Bem-vindo à ${settings?.siteName || "Lumo"}`}
                </span>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                    {mainPromoForBanner?.description || settings?.bannerTitle || "Sua Nova Experiência de Compras"}
                </h1>

                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                    {settings?.bannerSubtitle || "Encontre os melhores produtos das melhores lojas. Qualidade premium e entrega rápida para todo o país."}
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={scrollToProducts}
                        className="px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        Ver Coleção
                        <ArrowRight size={20} />
                    </button>

                </div>

                {mainPromoForBanner?.validUntil && (
                    <div className="absolute bottom-8 right-8 hidden md:block">
                        <CountdownTimer targetDate={mainPromoForBanner.validUntil} textColor="#fff" />
                    </div>
                )}
            </div>
        </div >
    );

    const BenefitsBar = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 px-4">
            {[
                { icon: <Flame className="text-red-500" size={32} />, title: "Qualidade Premium", desc: "Produtos oficiais" },
                { icon: <RefreshCw className="text-green-500" size={32} />, title: "Troca Grátis", desc: "Até 30 dias" },
                { icon: <Truck className="text-blue-500" size={32} />, title: "Envio Rápido", desc: "Entrega expressa" },
                { icon: <Shield className="text-yellow-500" size={32} />, title: "Pagamento Seguro", desc: "100% Protegido" },
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 p-3 rounded-full">{item.icon}</div>
                    <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            <div className="mb-12">


                {!isSearching && <HeroSection />}
                {!isSearching && <BenefitsBar />}
            </div>

            <div className="space-y-16">

                {dailyDealPromotion && !isSearching && promoProducts.length > 0 && (
                    <section id="daily-deal-section">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Zap className="text-yellow-500 fill-yellow-500" />
                                Oferta do Dia
                            </h2>
                            <button onClick={filterAndScrollToDailyDeal} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                                Ver tudo <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {promoProducts.map(product => {
                                const discount = dailyDealPromotion?.discount || 0;
                                const enrichedProduct = {
                                    ...product,
                                    onSale: true,
                                    originalPrice: product.price,
                                    price: Number((product.price * (1 - discount / 100)).toFixed(2))
                                };
                                return <ProductCard key={product._id} product={enrichedProduct} formatPrice={formatPrice} onAddToCart={handleAddToCart} user={user} />;
                            })}
                        </div>
                    </section>
                )}

                {!isSearching && featuredProducts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Star className="text-purple-500 fill-purple-500" />
                                Destaques
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} formatPrice={formatPrice} onAddToCart={handleAddToCart} user={user} />
                            ))}
                        </div>
                    </section>
                )}

                <section id="products-section">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <ShoppingBag className="text-blue-600" />
                            Catálogo
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => updateFilters("selectedCategory", cat.key)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.key
                                    ? 'bg-black text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-[400px] animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} formatPrice={formatPrice} onAddToCart={handleAddToCart} user={user} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <Search className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-xl font-medium text-gray-900">Nenhum produto encontrado</h3>
                            <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou busca.</p>
                            <button onClick={() => {
                                updateFilters("selectedCategory", "Todas as Categorias");
                                updateFilters("searchQuery", "");
                            }} className="mt-6 text-blue-600 font-medium hover:underline">
                                Limpar Filtros
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;
