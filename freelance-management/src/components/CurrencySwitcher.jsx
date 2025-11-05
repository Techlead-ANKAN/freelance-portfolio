import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { ChevronDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const CurrencySwitcher = () => {
    const { currency, changeCurrency, getAvailableCurrencies, currencySymbols } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const availableCurrencies = getAvailableCurrencies();

    const handleCurrencyChange = (newCurrency) => {
        changeCurrency(newCurrency);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                    {currency} ({currencySymbols[currency]})
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="py-2">
                            {availableCurrencies.map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => handleCurrencyChange(curr)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                        curr === currency ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{curr}</span>
                                        <span className="text-gray-500">{currencySymbols[curr]}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {curr === 'USD' && 'US Dollar'}
                                        {curr === 'INR' && 'Indian Rupee'}
                                        {curr === 'EUR' && 'Euro'}
                                        {curr === 'GBP' && 'British Pound'}
                                        {curr === 'JPY' && 'Japanese Yen'}
                                        {curr === 'CAD' && 'Canadian Dollar'}
                                        {curr === 'AUD' && 'Australian Dollar'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrencySwitcher;