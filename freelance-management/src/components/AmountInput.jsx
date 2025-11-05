import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencySelector from './CurrencySelector';

const AmountInput = ({ 
    label,
    value,
    onChange,
    placeholder = "0.00",
    currency: initialCurrency,
    onCurrencyChange,
    showCurrencySelector = true,
    required = false,
    className = "",
    ...props
}) => {
    const { currency: globalCurrency, currencySymbols, convertAmount } = useCurrency();
    const [localCurrency, setLocalCurrency] = useState(initialCurrency || globalCurrency);
    
    useEffect(() => {
        if (initialCurrency) {
            setLocalCurrency(initialCurrency);
        }
    }, [initialCurrency]);

    const handleCurrencyChange = (newCurrency) => {
        setLocalCurrency(newCurrency);
        if (onCurrencyChange) {
            onCurrencyChange(newCurrency);
        }
    };

    const symbol = currencySymbols[localCurrency] || currencySymbols[globalCurrency];

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {symbol}
                    </div>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-lg 
                                 text-gray-900 placeholder-gray-400 focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
                                 transition-all duration-200"
                        {...props}
                    />
                </div>
                
                {showCurrencySelector && (
                    <div className="w-24">
                        <CurrencySelector
                            selectedCurrency={localCurrency}
                            onCurrencyChange={handleCurrencyChange}
                            showLabel={false}
                            size="default"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmountInput;