import React, { useState, useEffect, useContext } from 'react';
import { Slider, Checkbox, Select, Empty, Spin, Input } from 'antd';
import { Filter, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SettingsContext } from '../context/SettingsContext';
import { CartContext } from '../context/CartContext';
import { usePromotions } from "../hooks/usePromotions";
import { useCurrency } from "../context/CurrencyContext";

const { Option } = Select;

const ProductsList = () => {
    const { addToCart } = useContext(CartContext);
    const { formatPrice } = useCurrency();
    const { calculateDiscountedPrice, loading: loadingPromos } = usePromotions(); // Import hook

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [sortOption, setSortOption] = useState("newest");
    const [maxPrice, setMaxPrice] = useState(500);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/products/categories');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCategories(data.filter(c => c !== "Todas as Categorias"));
                }
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();

                if (Array.isArray(data)) {
                    setProducts(data);
                    setFilteredProducts(data);

                    // Calcular preÃ§o mÃ¡ximo para o slider
                    const max = Math.max(...data.map(p => p.price), 500);
                    setMaxPrice(Math.ceil(max));
                    setPriceRange([0, Math.ceil(max)]);
                }
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // LÃ³gica de Filtragem e OrdenaÃ§Ã£o
    useEffect(() => {
        // ðŸš€ Aplica descontos globais antes de filtrar
        let result = products.map(p => {
            const discounted = calculateDiscountedPrice(p);
            return {
                ...discounted,
                price: discounted.finalPrice, // Atualiza preÃ§o principal para o Card
                originalPrice: discounted.originalPrice
            };
        });


        // 1. Busca
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerTerm));
        }

        // 2. Categorias
        if (selectedCategories.length > 0) {
            result = result.filter(p =>
                // Se o produto tem array de categorias ou string Ãºnica
                Array.isArray(p.category)
                    ? p.category.some(c => selectedCategories.includes(c))
                    : selectedCategories.includes(p.category)
            );
        }

        // 3. PreÃ§o
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // 4. OrdenaÃ§Ã£o
        switch (sortOption) {
            case "priceAsc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "nameAsc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "newest":
            default:
                if (result[0]?.createdAt) {
                    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
                break;
        }

        setFilteredProducts(result);
    }, [products, searchTerm, selectedCategories, priceRange, sortOption]);

    const handleCategoryChange = (checkedValues) => {
        setSelectedCategories(checkedValues);
    };

    // ðŸš€ Infinite Scroll Logic
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 200
            ) {
                setVisibleCount((prev) => prev + 12);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(12);
    }, [searchTerm, selectedCategories, priceRange, sortOption]);

    const displayedProducts = filteredProducts.slice(0, visibleCount);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Spin size="large" tip="Carregando catÃ¡logo..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header com Busca */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">CatÃ¡logo Completo</h1>
                    <p className="text-gray-500 mt-1">Explore nossa coleÃ§Ã£o de produtos exclusivos.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Filtros */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Filtro Mobile (Toggle) - Para simplificar, mostra sempre por enquanto, responsivo natural */}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Filtros
                        </h3>

                        {/* Categorias */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Categorias</h4>
                            <Checkbox.Group
                                className="flex flex-col gap-2"
                                options={categories}
                                onChange={handleCategoryChange}
                            />
                        </div>

                        {/* PreÃ§o */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">PreÃ§o</h4>
                            <Slider
                                range
                                min={0}
                                max={maxPrice}
                                defaultValue={[0, maxPrice]}
                                onChange={(value) => setPriceRange(value)} // Slider updates only on release for better performnce usually, but onChange is realtime
                                onAfterChange={(value) => setPriceRange(value)}
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-2 font-mono">
                                <span>{formatPrice(priceRange[0])}</span>
                                <span>{formatPrice(priceRange[1])}</span>
                            </div>
                        </div>

                        {/* OrdenaÃ§Ã£o (Sidebar Mobile ou Desktop) */}
                        <div className="mb-2">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Ordenar por</h4>
                            <Select
                                defaultValue="newest"
                                style={{ width: '100%' }}
                                onChange={setSortOption}
                                className="rounded-md"
                            >
                                <Option value="newest">Mais Recentes</Option>
                                <Option value="priceAsc">Menor PreÃ§o</Option>
                                <Option value="priceDesc">Maior PreÃ§o</Option>
                                <Option value="nameAsc">Nome (A-Z)</Option>
                            </Select>
                        </div>
                    </div>
                </aside>

                {/* Grid de Produtos */}
                <main className="flex-1">
                    <div className="mb-4 text-sm text-gray-500">
                        Mostrando <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> de <strong>{filteredProducts.length}</strong> produtos
                    </div>

                    {displayedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {displayedProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        formatPrice={formatPrice}
                                        onAddToCart={addToCart}
                                    // user={user} // Se precisar passar usuario
                                    />
                                ))}
                            </div>

                            {/* Loading Indicator for Infinite Scroll */}
                            {visibleCount < filteredProducts.length && (
                                <div className="text-center py-8">
                                    <Spin tip="Carregando mais produtos..." />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Empty description="Nenhum produto encontrado com estes filtros." />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductsList;
