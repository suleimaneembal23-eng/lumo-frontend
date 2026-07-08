import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Home, LogIn, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/Authcontext';
import { CartContext } from '../context/CartContext';
import { SettingsContext } from '../context/SettingsContext';
import SearchBar from './SearchBar';
import { useCurrency } from '../context/CurrencyContext';

const ModernHeader = () => {
    const { user, admin, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const { settings } = useContext(SettingsContext);
    const { currency, setCurrency, currencies } = useCurrency();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentUser = user || admin;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

                {/* LOGO area */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                >
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
                    ) : (
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {settings?.siteName || 'Loja Online'}
                        </h1>
                    )}
                </div>

                {/* DESKTOP NAVIGATION */}
                <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                    >
                        <Home size={18} />
                        Home
                    </button>

                    <button
                        onClick={() => navigate('/products')}
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        Produtos
                    </button>
                </nav>

                {/* SEARCH BAR - Flex grow to fill space */}
                <div className="hidden md:block flex-grow max-w-md mx-4">
                    <SearchBar />
                </div>

                {/* ðŸŒ Currency Selector (Desktop) */}
                <div className="hidden lg:flex items-center">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 border-none outline-none cursor-pointer hover:text-blue-600 focus:ring-0"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.code} ({c.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3 flex-shrink-0">

                    {/* CART BUTTON */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover:bg-gray-100 rounded-full"
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* USER MENU */}
                    {currentUser ? (
                        <div className="relative group">
                            <button
                                className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all"
                                onClick={() => navigate(admin ? '/admin/dashboard' : '/client/dashboard')}
                            >
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                                    {currentUser.name}
                                </span>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                <div className="px-4 py-3 border-b border-gray-50">
                                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                </div>

                                <button
                                    onClick={() => navigate(admin ? '/admin/dashboard' : '/client/dashboard')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <User size={16} />
                                    Minha Conta
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Sair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                <LogIn size={18} />
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform active:scale-95"
                            >
                                <UserPlus size={18} />
                                Registrar
                            </button>
                        </div>
                    )}

                    {/* MOBILE MENU TOGGLE */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 absolute w-full shadow-lg animate-slideDown left-0">
                    <div className="mb-4">
                        <SearchBar />
                    </div>

                    {/* Currency Selector Mobile */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Moeda</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                            <Home size={20} className="text-blue-600" />
                            <span className="font-medium text-gray-900">Home</span>
                        </button>
                        <button onClick={() => { navigate('/products'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                            <ShoppingCart size={20} className="text-blue-600" />
                            <span className="font-medium text-gray-900">Produtos</span>
                        </button>
                        {!user && !admin && (
                            <>
                                <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                    <LogIn size={20} className="text-blue-600" />
                                    <span className="font-medium text-gray-900">Login</span>
                                </button>
                                <button onClick={() => { navigate('/register'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                    <UserPlus size={20} className="text-blue-600" />
                                    <span className="font-medium text-gray-900">Registrar</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default ModernHeader;
