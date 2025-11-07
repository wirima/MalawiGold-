import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export const supportedCurrencies: Currency[] = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
];

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currencyCode: string) => void;
    formatCurrency: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(supportedCurrencies[0]);

    useEffect(() => {
        try {
            const savedCurrencyCode = window.localStorage.getItem('gemini-pos-currency');
            const savedCurrency = supportedCurrencies.find(c => c.code === savedCurrencyCode);
            if (savedCurrency) {
                setCurrencyState(savedCurrency);
            }
        } catch (error) {
            console.error('Failed to load currency from local storage:', error);
        }
    }, []);

    const setCurrency = (currencyCode: string) => {
        const newCurrency = supportedCurrencies.find(c => c.code === currencyCode);
        if (newCurrency) {
            setCurrencyState(newCurrency);
            try {
                window.localStorage.setItem('gemini-pos-currency', currencyCode);
            } catch (error) {
                console.error('Failed to save currency to local storage:', error);
            }
        }
    };
    
    const formatCurrency = useCallback((value: number): string => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency.code,
        }).format(value);
    }, [currency]);

    const value = useMemo(() => ({ currency, setCurrency, formatCurrency }), [currency, formatCurrency]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
