import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySelector = ({ 
    selectedCurrency, 
    onCurrencyChange, 
    className = "",
    size = "default",
    showLabel = true 
}) => {
    const { getAvailableCurrencies, currencySymbols } = useCurrency();
    const currencies = getAvailableCurrencies();

    const sizeClasses = {
        small: "text-xs py-1 px-2",
        default: "text-sm py-2 px-3",
        large: "text-base py-3 px-4"
    };

    return (
        <div className="flex flex-col">
            {showLabel && (
                <label className="text-xs font-medium text-gray-600 mb-1">
                    Currency
                </label>
            )}
            <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className={`
                    border border-gray-300 rounded-lg bg-white focus:outline-none 
                    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
                    transition-all duration-200 ${sizeClasses[size]} ${className}
                `}
            >
                {currencies.map(currency => (
                    <option key={currency} value={currency}>
                        {currencySymbols[currency]} {currency}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelector;