import React, { createContext, useContext, useState, useEffect } from 'react';

// Support multiple currencies
const DEFAULT_CURRENCY = 'INR';
const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    KES: 'KSh'
};

const CurrencyContext = createContext({});

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

    // No currency conversion needed in context level
    const convertAmount = (amount) => {
        return parseFloat(amount) || 0;
    };

    // Format amount with appropriate currency symbol
    const formatAmount = (amount, currencyCode = null, options = {}) => {
        const value = parseFloat(amount) || 0;
        const decimals = options.decimals !== undefined ? options.decimals : 2;
        const currToUse = currencyCode || currency;
        const symbol = CURRENCY_SYMBOLS[currToUse] || currToUse;
        
        // Show no decimals for whole numbers
        const displayDecimals = value % 1 === 0 ? 0 : decimals;
        
        return `${symbol}${value.toLocaleString('en-IN', {
            minimumFractionDigits: displayDecimals,
            maximumFractionDigits: displayDecimals
        })}`;
    };

    // Get currency symbol for specific currency
    const getCurrencySymbol = (currencyCode = null) => {
        return CURRENCY_SYMBOLS[currencyCode || currency] || (currencyCode || currency);
    };

    // Get available currencies
    const getAvailableCurrencies = () => Object.keys(CURRENCY_SYMBOLS);

    const value = {
        currency,
        setCurrency,
        convertAmount,
        formatAmount,
        getCurrencySymbol,
        getAvailableCurrencies,
        currencySymbols: CURRENCY_SYMBOLS,
        currencySymbol: CURRENCY_SYMBOLS[currency]
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext;