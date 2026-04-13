import OpenAI from 'openai';
import type { CryptoData } from './dataProvider';

export interface AIInsight {
  asset: string;
  insight?: string;
  headline?: string;
  summary?: string;
  time?: string;
}

export async function generateInsights(marketData: CryptoData[]): Promise<AIInsight[]> {
  // If no API key, return mock demo insights
  if (!process.env.GROQ_API_KEY) {
    console.log('No GROQ_API_KEY found, using mock insights for demo purposes.');
    return marketData.map((data) => {
      const trend = data.change24h >= 0 ? 'bullish' : 'bearish';
      const reason = data.change24h >= 5 ? 'surges rapidly' : data.change24h <= -5 ? 'drops heavily' : 'shows steady movement';
      return {
        asset: data.id,
        headline: `${data.symbol.toUpperCase()} ${reason.toUpperCase()} Amid Shift in Sentiment`,
        summary: `Market internal metrics suggest the token is adopting a ${trend} trajectory. Long-term fundamentals maintain strength as exchange volume shifts continuously throughout the session.`,
        time: '2m ago',
      };
    });
  }

  const openai = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  
  // Create a context string from the market data
  const dataContext = marketData.map(d => 
    `${d.id} (${d.symbol}): Price $${d.price}, 24h Vol $${d.volume24h}, 24h Change ${d.change24h}%`
  ).join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an AI financial news anchor reporting on the Top 100 Global Cryptocurrency Market. Generate 4 urgent, broader macroeconomic breaking news stories based on the live top-20 index data provided. You must output a JSON OBJECT strictly containing a 'news' array like this:\n{ "news": [ { "asset": "bitcoin", "headline": "Short snappy headline", "summary": "1-sentence news body detailing the broader market movement.", "time": "2m ago" } ] }\nFeel free to assign 'asset' to values like 'global', 'defi', 'solana', or 'bitcoin' depending on what sector the news covers.`
        },
        {
          role: 'user',
          content: `Here is the current market data:\n\n${dataContext}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        // Robust extraction: return the insights array regardless of how the root object is named
        if (Array.isArray(parsed.insights)) return parsed.insights;
        if (Array.isArray(parsed.data)) return parsed.data;
        if (Array.isArray(parsed)) return parsed;
        
        // Final fallback traversal
        const firstValue = Object.values(parsed)[0];
        if (Array.isArray(firstValue)) return firstValue;
      } catch (e) {
        console.error('Failed to parse AI JSON:', e);
      }
    }
  } catch (error) {
    console.error('AI Insight Error:', error);
  }
  return [];
}
