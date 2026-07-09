�import { createContext, useState, useContext } from "react";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("XOF");

  const currencies = [
    { code: "XOF", symbol: "FCFA", name: "Franco CFA" }
  ];

  // Formatar Preço � FCFA não tem cêntimos
  // Formato: 43.500 FCFA / 90.000 FCFA (ponto como separador de milhar)
  const formatPrice = (value) => {
    if (value === undefined || value === null) return "";

    const rounded = Math.round(Number(value));
    const formatted = rounded.toLocaleString('de-DE'); // usa ponto: 43.500
    return `${formatted} FCFA`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency deve ser usado dentro de um CurrencyProvider");
  }
  return context;
};
