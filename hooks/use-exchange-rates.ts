import { useState, useEffect } from 'react';

interface ExchangeRatesResponse {
  rates: { [key: string]: number };
  cached?: boolean;
  error?: string;
  fallback?: boolean;
  cacheAge?: number;
}

interface UseExchangeRatesReturn {
  rates: { [key: string]: number } | null;
  loading: boolean;
  error: string | null;
  convertCurrency: (amount: number, from: string, to: string) => number | null;
  isCached: boolean;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/exchange-rates');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch exchange rates: ${response.status}`);
        }

        const data: ExchangeRatesResponse = await response.json();
        
        setRates(data.rates);
        setIsCached(data.cached || false);
        
        if (data.error && !data.fallback) {
          setError(data.error);
        }

      } catch (err: any) {
        console.error('Error fetching exchange rates:', err);
        setError(err.message || 'Failed to fetch exchange rates');
        
        // Fallback rates en cas d'erreur
        setRates({
          USD: 1.05,
          EUR: 1
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertCurrency = (amount: number, from: string, to: string): number | null => {
    if (!rates || !amount) return null;
    
    // Si les devises sont identiques, retourner le montant tel quel
    if (from === to) return amount;
    
    const fromRate = rates[from];
    const toRate = rates[to];
    
    if (!fromRate || !toRate) return null;
    
    // Conversion via EUR (devise de base)
    // Si from = EUR, alors fromRate = 1
    // Si to = EUR, alors toRate = 1
    const eurAmount = amount / fromRate;
    const convertedAmount = eurAmount * toRate;
    
    return Math.round(convertedAmount * 100) / 100; // Arrondir à 2 décimales
  };

  return {
    rates,
    loading,
    error,
    convertCurrency,
    isCached
  };
}
