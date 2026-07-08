import React, { createContext, useState, useEffect, useContext } from "react";

export const CookieConsentContext = createContext();

export const CookieConsentProvider = ({ children }) => {
    const [cookieConsent, setCookieConsent] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Verifica se já existe consentimento armazenado
        const consent = localStorage.getItem("cookieConsent");
        if (consent) {
            setCookieConsent(JSON.parse(consent));
            setShowBanner(false);
        } else {
            // Mostra o banner após 1 segundo se não houver consentimento
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = (preferences) => {
        const consent = {
            necessary: true, // Sempre aceito
            analytics: preferences.analytics || false,
            marketing: preferences.marketing || false,
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem("cookieConsent", JSON.stringify(consent));
        setCookieConsent(consent);
        setShowBanner(false);
    };

    const acceptAllCookies = () => {
        acceptCookies({ analytics: true, marketing: true });
    };

    const acceptNecessaryOnly = () => {
        acceptCookies({ analytics: false, marketing: false });
    };

    const resetConsent = () => {
        localStorage.removeItem("cookieConsent");
        setCookieConsent(null);
        setShowBanner(true);
    };

    return (
        <CookieConsentContext.Provider
            value={{
                cookieConsent,
                showBanner,
                acceptCookies,
                acceptAllCookies,
                acceptNecessaryOnly,
                resetConsent,
            }}
        >
            {children}
        </CookieConsentContext.Provider>
    );
};

export const useCookieConsent = () => {
    const context = useContext(CookieConsentContext);
    if (!context) {
        throw new Error("useCookieConsent must be used within CookieConsentProvider");
    }
    return context;
};
