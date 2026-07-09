import { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Load from localStorage or default to false
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        // Apply dark mode class to html element
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save to localStorage
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};
