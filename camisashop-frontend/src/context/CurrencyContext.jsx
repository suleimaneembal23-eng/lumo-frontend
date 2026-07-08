import { createContext, useState, useContext, useEffect } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "EUR"
  );

  const toggleCurrency = () => {
    const newCurrency = currency === "EUR" ? "FCFA" : "EUR";
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
