// lib/dataProvider.ts

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  volume24h: number;
  change24h: number;
  image: string;
}

export async function fetchMarketData(ids: string[] = ['bitcoin', 'ethereum', 'solana']): Promise<CryptoData[]> {
  const dataSource = process.env.DATA_SOURCE || 'coingecko';

  if (dataSource === 'ave') {
    // TODO: Implement AVE API logic when available
    console.log('Using AVE API');
    return [];
  }

  // Default to CoinGecko
  console.log('Using CoinGecko API');
  const idsString = ids.join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsString}`;

  try {
    const res = await fetch(url, { next: { revalidate: 10 } }); // Cache revalidation every 10s
    if (!res.ok) throw new Error('CoinGecko fetch failed');
    const data = await res.json();

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name || coin.id,
      price: coin.current_price || 0,
      volume24h: coin.total_volume || 0,
      change24h: coin.price_change_percentage_24h || 0,
      image: coin.image || '',
    }));
  } catch (error) {
    console.warn('CoinGecko Rate Limit or Network Error. Using Hackathon Mock Data for Dashboard.');
    return ids.map((id) => ({
      id,
      symbol: id.substring(0, 3).toUpperCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      price: Math.random() * 5000 + 100,
      volume24h: Math.random() * 500000000,
      change24h: (Math.random() * 10) - 5,
      image: '',
    }));
  }
}

export async function fetchBroadMarket(): Promise<CryptoData[]> {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1';
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('CoinGecko fetch Broad Market failed');
    const data = await res.json();

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name || coin.id,
      price: coin.current_price || 0,
      volume24h: coin.total_volume || 0,
      change24h: coin.price_change_percentage_24h || 0,
      image: coin.image || '',
    }));
  } catch (error) {
    console.warn('Broad market rate limit hit. Falling back to simulated broad items.');
    return [{ id: 'global', symbol: 'GLBL', name: 'Global Market', price: 1000, volume24h: 10000000, change24h: 2.5, image: '' }];
  }
}

export interface DeepCoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  volume24h: number;
  change24h: number;
  description: string;
  marketCapRank: number;
  ath: number;
  athChange: number;
  circulatingSupply: number;
  maxSupply: number;
  twitterFollowers: number;
  sentimentUpvotes: number;
  priceChange7d: number;
  priceChange30d: number;
  aveRisk?: {
    isHoneypot: boolean;
    buyTax: number;
    sellTax: number;
    ownerAddress: string;
    riskScore: number;
    summary: string;
  };
}

export async function fetchCoinDetails(id: string): Promise<DeepCoinDetails | null> {
  const aveKey = process.env.AVE_API_KEY;
  
  try {
    // 1. Fetch core market data from CoinGecko (Free)
    const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false`, { next: { revalidate: 60 } });
    if (!cgRes.ok) throw new Error('CG Details Failed');
    const cgData = await cgRes.json();
    
    let aveRiskData = undefined;

    // 2. Fetch Deep Alpha from Ave.ai ONLY if we have a key (Preserves units)
    if (aveKey) {
      try {
        const riskRes = await fetch(`https://api.ave.ai/v2/token/risk_detection?id=${id}`, {
          headers: { 'X-API-KEY': aveKey },
          next: { revalidate: 3600 } // Cache risk for 1 hour to save units
        });
        if (riskRes.ok) {
          const risk = await riskRes.json();
          if (risk.data) {
             aveRiskData = {
               isHoneypot: risk.data.is_honeypot === 1,
               buyTax: risk.data.buy_tax || 0,
               sellTax: risk.data.sell_tax || 0,
               ownerAddress: risk.data.owner_address || 'Renounced',
               riskScore: risk.data.score || 0,
               summary: risk.data.summary || 'Security check completed.'
             };
          }
        }
      } catch (e) {
        console.warn('Ave API Risk Check skipped/failed:', e);
      }
    }

    return {
      id: cgData.id,
      symbol: cgData.symbol.toUpperCase(),
      name: cgData.name,
      image: cgData.image?.large || cgData.image?.small || '',
      price: cgData.market_data?.current_price?.usd || 0,
      volume24h: cgData.market_data?.total_volume?.usd || 0,
      change24h: cgData.market_data?.price_change_percentage_24h || 0,
      description: cgData.description?.en?.split('. ')[0] || '',
      marketCapRank: cgData.market_cap_rank || 0,
      ath: cgData.market_data?.ath?.usd || 0,
      athChange: cgData.market_data?.ath_change_percentage?.usd || 0,
      circulatingSupply: cgData.market_data?.circulating_supply || 0,
      maxSupply: cgData.market_data?.max_supply || 0,
      twitterFollowers: cgData.community_data?.twitter_followers || 0,
      sentimentUpvotes: cgData.sentiment_votes_up_percentage || 50,
      priceChange7d: cgData.market_data?.price_change_percentage_7d || 0,
      priceChange30d: cgData.market_data?.price_change_percentage_30d || 0,
      aveRisk: aveRiskData
    };
  } catch (e) {
    console.warn('Coin fetch fallback engaged:', e);
    return {
      id,
      symbol: id.substring(0, 4).toUpperCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1) + ' (Simulated)',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      price: 154.20,
      volume24h: 1250000000,
      change24h: 3.4,
      description: `This is a simulated context for ${id} because the CoinGecko rate limit was reached during the demo.`,
      marketCapRank: Math.floor(Math.random() * 100) + 1,
      ath: 500.5,
      athChange: -30.5,
      circulatingSupply: 100000000,
      maxSupply: 200000000,
      twitterFollowers: 450000,
      sentimentUpvotes: 78,
      priceChange7d: 5.6,
      priceChange30d: -12.4,
    };
  }
}
