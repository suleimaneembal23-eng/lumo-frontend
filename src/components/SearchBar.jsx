import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useDebounce } from '../hooks/useDebounce'; // Criaremos este hook ou faremos in-line

const SearchBar = ({ className }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Busca debounceada
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Rota que busca por nome, categoria ou tags
                // Assumindo que o endpoint /api/products tem suporte a query string ?search=...
                // Se não tiver, chamamos getAll e filtramos (menos performático mas funciona pra MVP)
                // O ideal é implementar /api/products/search no backend
                const res = await fetch(`/api/products?search=${query}`);
                const data = await res.json();

                // Filtro Client-side se o backend retornar tudo (backup safety)
                const filtered = Array.isArray(data) ? data.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    (p.category && p.category.some(c => c.toLowerCase().includes(query.toLowerCase())))
                ).slice(0, 5) : []; // Top 5 resultados

                setResults(filtered);
                setIsOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/products?search=${query}`);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-full outline-none transition-all text-sm"
                />
                <Search className="absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />

                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); setResults([]); }}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </form>

            {/* Dropdown de Resultados */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {loading ? (
                        <div className="p-4 flex justify-center text-gray-500">
                            <Loader2 className="animate-spin" size={20} />
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="py-2">
                                <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Produtos Sugeridos</h3>
                                {results.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => {
                                            navigate(`/product/${product._id}`);
                                            setIsOpen(false);
                                            setQuery("");
                                        }}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-blue-600 font-bold">{Math.round(product.price).toLocaleString('de-DE')} FCFA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                onClick={handleSubmit}
                                className="bg-gray-50 px-4 py-3 text-center text-blue-600 text-sm font-bold cursor-pointer hover:bg-gray-100 transition-colors border-t border-gray-100"
                            >
                                Ver todos os resultados para "{query}"
                            </div>
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Nenhum produto encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
