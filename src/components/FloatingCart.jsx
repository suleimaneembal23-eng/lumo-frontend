import React, { useContext, useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const FloatingCart = () => {
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAnimating, setIsAnimating] = useState(false);

    // Páginas onde o carrinho flutuante NÃO deve aparecer
    const hiddenRoutes = ['/cart', '/checkout', '/login', '/register'];
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

    // Despoleta animação sempre que o cartCount muda
    useEffect(() => {
        if (cartCount > 0) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 400); // tempo idêntico à duração da animação
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    if (shouldHide) return null;

    return (
        <button
            onClick={() => navigate('/cart')}
            className={`
                fixed z-[100] bottom-6 right-4 md:bottom-10 md:right-10 
                flex items-center justify-center 
                w-14 h-14 md:w-16 md:h-16 
                bg-gray-900 text-white rounded-full 
                shadow-2xl hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] 
                hover:scale-105 transition-all duration-300
                ${isAnimating ? 'animate-cartPop' : ''}
            `}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <ShoppingCart size={24} className="md:w-7 md:h-7" />
            
            <div className={`
                absolute -top-2 -right-2 
                w-6 h-6 md:w-7 md:h-7
                flex items-center justify-center 
                bg-red-500 text-white 
                text-xs md:text-sm font-bold rounded-full 
                shadow-lg border-2 border-white
                ${isAnimating ? 'animate-badgeBounce' : ''}
            `}>
                {cartCount}
            </div>
        </button>
    );
};

export default FloatingCart;
