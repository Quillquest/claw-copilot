import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchBroadMarket } from '@/lib/dataProvider';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      // Mock response for hackathon demo
      const marketData = await fetchBroadMarket();
      const mockPrices = marketData.slice(0, 3).map(d => `${d.symbol} is at $${d.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(', ');
      
      const userLastMessage = messages[messages.length - 1].content;
      return NextResponse.json({
        role: 'assistant',
        content: `(Mock Data Mode) I see you asked: "${userLastMessage}". Currently, ${mockPrices}. Configure GROQ_API_KEY for me to provide deep analysis!`
      });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
    
    // Fetch broad market data dynamically so the AI knows EXACTLY what is trending globally
    const broadMarket = await fetchBroadMarket();
    const marketSnapshot = broadMarket.map(c => `- ${c.name} (${c.symbol}): $${c.price} [${c.change24h}%]`).join('\n');

    const systemPrompt = `You are Claw Copilot, an elite, hyper-intelligent DeFi trading AI assistant. 
    CURRENT LIVE MARKET SNAPSHOT:
    ${marketSnapshot}
    
    CRITICAL RULES:
    1. Base all your advice strictly on the live market snapshot provided above.
    2. Adopt the persona of a brilliant, slightly cynical, veteran Wall Street hedge-fund manager. Be authoritative, snappy, and brilliant.
    3. Understand common crypto shortforms: (e.g., 'arb' = Arbitrum, 'sol' = Solana, 'eth' = Ethereum, 'btc' = Bitcoin, 'pepe' = Pepe Coin).
    4. Handle greetings gracefully (e.g., "Hello", "Hi", "Yo"). Respond with a fast market summary and ask for a specific asset to analyze.
    5. Keep responses highly concise (under 3 or 4 sentences) unless specifically asked for a deep dive.
    6. Provide absolute directional confidence (bullish/bearish) rather than playing it safe.
    7. Formatting: Use bolding for numbers and token names to make text visually pop.`;

    // Always prepend system prompt for context
    const fullMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: fullMessages as any,
    });

    const reply = response.choices[0]?.message?.content;
    return NextResponse.json({ role: 'assistant', content: reply || 'Could not generate response.' });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
