import React, { createContext, useContext, useState, useEffect } from 'react';

// Using only INR currency throughout the website
const CURRENCY = 'INR';
const CURRENCY_SYMBOL = '₹';

const CurrencyContext = createContext({});

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }) => {
    const currency = CURRENCY;

    // No currency conversion needed - everything is in INR
    const convertAmount = (amount) => {
        return parseFloat(amount) || 0;
    };

    // Format amount with INR symbol
    const formatAmount = (amount, options = {}) => {
        const value = parseFloat(amount) || 0;
        const decimals = options.decimals !== undefined ? options.decimals : 2;
        
        // For INR, show no decimals for whole numbers
        const displayDecimals = value % 1 === 0 ? 0 : decimals;
        
        return `₹${value.toLocaleString('en-IN', {
            minimumFractionDigits: displayDecimals,
            maximumFractionDigits: displayDecimals
        })}`;
    };

    // Get currency symbol - always INR
    const getCurrencySymbol = () => CURRENCY_SYMBOL;

    // Get available currencies - only INR
    const getAvailableCurrencies = () => [CURRENCY];

    const value = {
        currency,
        convertAmount,
        formatAmount,
        getCurrencySymbol,
        getAvailableCurrencies,
        currencySymbol: CURRENCY_SYMBOL
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext;