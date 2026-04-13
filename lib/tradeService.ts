import type { CryptoData } from './dataProvider';
import type { AIInsight } from './aiService';

export type Horizon = 'SHORT-TERM' | 'LONG-TERM';
export type Stance = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface MarketGuidance {
  asset: string;
  image: string;
  horizon: Horizon;
  stance: Stance;
  confidence: number;
  analysis: string;
}

export function generateTradeSuggestions(
  marketData: CryptoData[],
  insights: AIInsight[]
): MarketGuidance[] {
  return marketData.map(data => {
    const insightMatch = insights.find(i => i.asset === data.id)?.insight;
    
    let horizon: Horizon = 'LONG-TERM';
    let stance: Stance = 'NEUTRAL';
    let confidence = 50;
    let analysis = "Market is stabilizing. A good opportunity to hold and evaluate long-term fundamentals.";

    // Mathematical volatility checks to determine horizon
    if (Math.abs(data.change24h) > 5) {
      horizon = 'SHORT-TERM';
      if (data.change24h > 0) {
        stance = 'BULLISH';
        analysis = insightMatch ? insightMatch : "Riding high momentum. Ideal for short-term swing trading, but watch out for rapid corrections.";
      } else {
        stance = 'BEARISH';
        analysis = insightMatch ? insightMatch : "Sharp drop opens up short-term downside risks. Wait for the bleed to stop before considering entry.";
      }
      confidence = Math.min(60 + Math.abs(data.change24h) * 1.5, 95);
    } else {
      if (data.change24h > 1.5) {
        stance = 'BULLISH';
        analysis = insightMatch ? insightMatch : "Steady, healthy growth tracking well with a long-term accumulation strategy.";
        confidence = 70;
      } else if (data.change24h < -1.5) {
         stance = 'BEARISH';
         analysis = insightMatch ? insightMatch : "Gradual decline detected. Long-term accumulation could be risky right now; look for key support levels.";
         confidence = 65;
      }
    }

    return {
      asset: data.id,
      image: data.image,
      horizon,
      stance,
      confidence: parseFloat(confidence.toFixed(1)),
      analysis
    };
  });
}
