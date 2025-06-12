import { NextResponse } from 'next/server';

// Cache global pour stocker les taux de change
let exchangeRatesCache: {
  data: { [key: string]: number } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes

export async function GET() {
  try {
    const now = Date.now();
    
    // Vérifier si le cache est encore valide
    if (exchangeRatesCache.data && (now - exchangeRatesCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        rates: exchangeRatesCache.data,
        cached: true,
        cacheAge: Math.floor((now - exchangeRatesCache.timestamp) / 1000)
      });
    }

    // Récupérer les nouveaux taux de change
    console.log('Fetching fresh exchange rates from API...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR', {
      headers: {
        'User-Agent': 'MakeHub/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Mettre à jour le cache
    exchangeRatesCache = {
      data: data.rates,
      timestamp: now
    };

    return NextResponse.json({
      rates: data.rates,
      cached: false,
      lastUpdated: new Date(now).toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching exchange rates:', error);
    
    // Si on a des données en cache (même expirées), les utiliser comme fallback
    if (exchangeRatesCache.data) {
      return NextResponse.json({
        rates: exchangeRatesCache.data,
        cached: true,
        error: 'Using cached data due to API error',
        cacheAge: Math.floor((Date.now() - exchangeRatesCache.timestamp) / 1000)
      });
    }

    // Sinon, retourner des taux par défaut
    return NextResponse.json({
      rates: {
        USD: 1.05, // Taux approximatif EUR -> USD
        EUR: 1
      },
      cached: false,
      error: 'Using fallback rates',
      fallback: true
    }, { status: 200 });
  }
}
