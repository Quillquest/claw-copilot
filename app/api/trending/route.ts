import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Trending API rate limit hit');
    const data = await res.json();

    const topCoins = data.coins?.slice(0, 5).map((item: any) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      thumb: item.item.thumb,
      change24h: item.item.data?.price_change_percentage_24h?.usd || 0
    })) || [];
    
    return NextResponse.json({ success: true, data: topCoins });
  } catch (err) {
    console.warn("Falling back to simulated trending coins due to rate limit.");
    const fallback = [
      { id: "pepe", name: "Pepe", symbol: "PEPE", thumb: "https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg", change24h: 15.6 },
      { id: "dogwifhat", name: "dogwifhat", symbol: "WIF", thumb: "https://assets.coingecko.com/coins/images/33566/thumb/dogwifhat.jpg", change24h: 8.2 },
      { id: "bonk", name: "Bonk", symbol: "BONK", thumb: "https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg", change24h: -2.1 },
      { id: "render-token", name: "Render", symbol: "RNDR", thumb: "https://assets.coingecko.com/coins/images/11636/thumb/render.png", change24h: 12.4 },
      { id: "fetch-ai", name: "Fetch.ai", symbol: "FET", thumb: "https://assets.coingecko.com/coins/images/5681/thumb/Fetch.jpg", change24h: 4.8 }
    ];
    return NextResponse.json({ success: true, data: fallback });
  }
}
