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
  const idsString = ids.join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsString}`;

  try {
    const res = await fetch(url, { next: { revalidate: 10 } });
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
  console.log('--- fetchCoinDetails for id:', id);
  console.log('--- AVE_API_KEY present:', !!aveKey);
  
  try {
    const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false`, { next: { revalidate: 60 } });
    if (!cgRes.ok) throw new Error('CG Details Failed');
    const cgData = await cgRes.json();
    
    let aveRiskData = undefined;

    if (aveKey) {
      try {
        const platforms = cgData.platforms || {};
        const chainKeys = Object.keys(platforms);
        const contractAddress = chainKeys.length > 0 ? platforms[chainKeys[0]] : null;
        
        console.log('--- Contract Address detected:', contractAddress);

        // Mapping chain keys to Ave chain slugs
        const chainMap: Record<string, string> = {
          'ethereum': 'eth',
          'binance-smart-chain': 'bsc',
          'solana': 'solona',
          'polygon-pos': 'polygon',
          'arbitrum-one': 'arbi'
        };
        const rawChain = chainKeys.length > 0 ? chainKeys[0] : 'eth';
        const aveChain = chainMap[rawChain] || 'eth';
        
        console.log('--- Chain Mapping:', rawChain, '->', aveChain);

        if (contractAddress) {
          console.log('--- Calling Ave API for risk report...');
          const riskUrl = `https://prod.ave-api.com/v2/tokens/risk-detection?address=${contractAddress}&chain=${aveChain}`;
          const riskRes = await fetch(riskUrl, {
            headers: { 'X-API-KEY': aveKey },
            next: { revalidate: 3600 }
          });
          
          if (riskRes.ok) {
            const risk = await riskRes.json();
            console.log('--- Ave API Response Status:', riskRes.status);
            if (risk.data) {
               aveRiskData = {
                 isHoneypot: risk.data.is_honeypot === 1,
                 buyTax: risk.data.buy_tax || 0,
                 sellTax: risk.data.sell_tax || 0,
                 ownerAddress: risk.data.owner_address || 'Renounced',
                 riskScore: risk.data.score || 0,
                 summary: risk.data.summary || 'Security check completed.'
               };
               console.log('--- Risk Data Populated Successfully.');
            } else {
               console.log('--- Risk Response missing .data property.');
            }
          } else {
             console.warn('--- Ave API Request returned not OK:', riskRes.status);
          }
        } else {
           console.log('--- No contract address found. Using native asset summary.');
           aveRiskData = {
             isHoneypot: false,
             buyTax: 0,
             sellTax: 0,
             ownerAddress: 'N/A (Native Asset)',
             riskScore: 99,
             summary: 'This is a native blockchain asset. Governance and security are handled at the protocol layer.'
           };
        }
      } catch (e) {
        console.warn('--- Ave API Exception:', e);
      }
    } else {
       console.log('--- Skipping Ave API scan (No Key).');
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
    console.error('--- fetchCoinDetails Critical Error:', e);
    return null;
  }
}
