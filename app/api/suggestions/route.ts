import { NextResponse } from 'next/server';
import { fetchBroadMarket } from '@/lib/dataProvider';
import { generateTradeSuggestions } from '@/lib/tradeService';

export async function GET() {
  try {
    const marketData = await fetchBroadMarket();
    
    // Filter out obvious stablecoins so they don't clog up the predictive trading guidance
    const stablecoins = ['USDT', 'USDC', 'DAI', 'FDUSD', 'USDE'];
    const volatileTokens = marketData.filter(coin => !stablecoins.includes(coin.symbol));
    
    // Sort by largest absolute 24h market movement (most volatile/action of the day)
    const sortedByAction = volatileTokens.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    
    // Grab Top 5 purely based on price action volatility
    const top5OfTheDay = sortedByAction.slice(0, 5);

    // Run the guidance math engine on these top 5 movers
    const suggestions = generateTradeSuggestions(top5OfTheDay, []);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
