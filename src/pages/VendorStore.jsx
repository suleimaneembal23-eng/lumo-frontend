import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Empty, Avatar, Descriptions } from 'antd';
import { Store, MapPin, Info } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../api/api';
import { CartContext } from '../context/CartContext';
import { useCurrency } from "../context/CurrencyContext";
import { SettingsContext } from '../context/SettingsContext';

const VendorStore = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { formatPrice } = useCurrency();
    const { settings } = useContext(SettingsContext);

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStore = async () => {
            try {
                setLoading(true);
                const data = await api.fetchVendorStore(slug);
                setVendor(data.vendor);
                setProducts(data.products || []);
            } catch (err) {
                console.error("Failed to load vendor store:", err);
                setError("Loja não encontrada ou indisponível.");
            } finally {
                setLoading(false);
            }
        };

        if (slug) loadStore();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <Spin size="large" />
                <p className="text-gray-500 animate-pulse">Carregando a loja...</p>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl m-8">
                <div className="bg-white p-8 rounded-full mb-6 shadow-sm">
                    <Store size={64} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Loja não encontrada"}</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                >
                    Voltar para o Shopping Seguro
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header da Loja */}
            <div className="relative bg-white shadow-sm mb-8">
                {/* Banner - Gradiente se não tiver imagem */}
                <div
                    className="h-48 md:h-64 bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-900 bg-cover bg-center"
                    style={vendor.banner ? { backgroundImage: `url(${vendor.banner.startsWith('/uploads') ? `${vendor.banner}` : vendor.banner})` } : {}}
                >
                    <div className="absolute inset-0 bg-black/20" /> {/* Overlay escuro suave */}
                </div>

                <div className="container mx-auto px-4 -mt-16 relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Logo da Loja */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {vendor.logo ? (
                                <img src={vendor.logo.startsWith('/uploads') ? `${vendor.logo}` : vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                            ) : (
                                <Avatar size={160} icon={<Store size={64} className="text-gray-400" />} className="bg-gray-100" />
                            )}
                        </div>

                        {/* Info da Loja */}
                        <div className="text-center md:text-left flex-1 pt-2 md:pt-4">
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
                                <h1 className="text-3xl font-extrabold text-gray-900">{vendor.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                                    Vendedor Verificado
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg mb-4 max-w-2xl">{vendor.description || `Bem-vindo à nossa loja oficial na ${settings?.siteName || 'nossa plataforma'}. Encontre os melhores produtos com entrega garantida.`}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin size={16} /> Envio Nacional</span>

                                <span className="flex items-center gap-1"><Info size={16} /> Membro desde {new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Produtos */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Produtos da Loja</h2>
                    <span className="text-gray-500">{products.length} itens disponíveis</span>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                formatPrice={formatPrice}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Empty description="Esta loja ainda não tem produtos cadastrados." />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorStore;
