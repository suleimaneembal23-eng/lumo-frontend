import React, { createContext, useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { settings, loading, refreshSettings } = useSettings();

  // 🔥 Moeda global (EUR ↔ FCFA), guardada no localStorage
  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "EUR"
  );

  // Atualiza localStorage sempre que muda
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  // Função para alternar
  const toggleCurrency = () => {
    const newCurrency = currency === "EUR" ? "FCFA" : "EUR";
    setCurrency(newCurrency);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        currency,
        setCurrency,
        toggleCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
