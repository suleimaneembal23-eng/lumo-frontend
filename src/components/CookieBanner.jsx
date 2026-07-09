�import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur-md text-white border-t border-gray-800 z-[9999] p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-slide-up">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm md:text-base text-gray-300 text-center md:text-left">
                    <p>
                        �x�� <strong>Este site utiliza cookies</strong> para melhorar a sua experiência e personalizar conteúdo.
                        Ao continuar navegando, você concorda com a nossa <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline font-medium">Política de Privacidade</Link>.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleAccept}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 whitespace-nowrap"
                    >
                        Aceitar Tudo
                    </button>
                    {/* Botão opcional de recusar/configurar pode ser adicionado depois */}
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
