// src/hooks/useCurrency.js
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

/**
 * Hook para acessar a moeda atual e a lógica de formatação de preço.
 * Deve ser usado em qualquer componente que precise exibir preços.
 */
export const useCurrency = () => {
  const { settings, currency, toggleCurrency } = useContext(SettingsContext);

  /**
   * Formata e converte o preço (EUR ↔ FCFA)
   * @param {number} price - O preço base em EUR.
   * @returns {string} O preço formatado (ex: "€ 49.99" ou "F CFA 32 797")
   */
  const formatPrice = (price) => {
    // 1. Obter a taxa de câmbio (fallback para o valor que você forneceu)
    const exchangeRate = settings?.exchangeRateFCFA || 655.957; 

    // 2. Calcular o preço final
    const finalPrice = price * (currency === "FCFA" ? exchangeRate : 1);
    
    // 3. Definir o símbolo e as casas decimais
    const symbol = currency === "FCFA" ? "F CFA" : "€";
    const decimals = currency === "FCFA" ? 0 : 2; 

    // 4. Formatar o número (adiciona separadores de milhares)
    // O toFixed arredonda o número. O replace adiciona os espaços como separador de milhares.
    const formattedPrice = finalPrice.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return `${symbol} ${formattedPrice}`;
  };

  return { 
    currency, 
    toggleCurrency, 
    formatPrice,
  };
};