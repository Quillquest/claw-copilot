import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpenAI from 'openai';
import { fetchCoinDetails } from '@/lib/dataProvider';
import { generateTradeSuggestions } from '@/lib/tradeService';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoinPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Reliably fetch the master data for this specific token instead of hitting /markets
  const coin = await fetchCoinDetails(id);
  
  if (!coin) {
    notFound();
  }
  
  // Format as generic array so our trade/math service algorithm works flawlessly
  const marketData = [{
    id: coin.id,
    symbol: coin.symbol,
    price: coin.price,
    volume24h: coin.volume24h,
    change24h: coin.change24h,
    image: coin.image,
  }];
  
  const suggestions = generateTradeSuggestions(marketData, []); // Pass empty insights to trigger base math guidelines
  const guidance = suggestions[0];
  
  let deepAnalysis = "";
  if (process.env.GROQ_API_KEY) {
    const openai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
    
    try {
      const response = await openai.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are Claw Copilot, an expert DeFi macro-analyst. Provide an extended, 3-paragraph deep-dive macro analysis on ${coin.name} (${coin.symbol}). Ground your analysis STRICTLY in the following real metrics:\n- Price: $${coin.price}\n- 24h Change: ${coin.change24h}%\n- 7-Day Trend: ${coin.priceChange7d?.toFixed(2)}%\n- 30-Day Trend: ${coin.priceChange30d?.toFixed(2)}%\n- Drawdown from All-Time-High: ${coin.athChange?.toFixed(2)}%\n- Community Sentiment: ${coin.sentimentUpvotes}% Bullish\n- Market Cap Rank: #${coin.marketCapRank}\n\nJustify exactly why it mathematically classifies as a ${guidance.horizon} hold or ${guidance.stance} trade right now. Format nicely with short paragraphs.`
          }
        ]
      });
      deepAnalysis = response.choices[0]?.message?.content || "Analysis unavailable.";
    } catch (e) {
      deepAnalysis = "Deep analysis currently unavailable due to an AI generation error.";
    }
  } else {
    deepAnalysis = `(Mock Deep Dive Base Context)\n\n${coin.name} (${coin.symbol}) is currently showing a ${coin.change24h}% moving 24h average. This mathematically reflects a ${guidance.stance} stance in the short-to-medium term. Investors and institutional bots are evaluating whether its $${(coin.volume24h / 1000000).toFixed(2)}M daily trading volume sustains these current price corridors.\n\nThe long-term horizon is classified internally as ${guidance.horizon}, suggesting calculated portfolio risk assessment is necessary before establishing positions or deploying vast liquidity capital.`;
  }

  const isPositive = coin.change24h >= 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium mb-8 transition-colors group">
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
          Back to Dashboard
        </Link>
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 bg-gray-900/40 p-8 rounded-3xl border border-gray-800/60 shadow-2xl backdrop-blur-md">
           <div className="flex items-center space-x-6 mb-6 md:mb-0">
             <img src={coin.image} alt={coin.name} className="w-20 h-20 rounded-full shadow-lg bg-gray-800 p-1 border border-gray-700/50" />
             <div>
               <h1 className="text-5xl font-extrabold text-white capitalize tracking-tight mb-2 flex items-center space-x-4">
                 <span>{coin.name}</span>
                 <span className="text-xl font-bold px-3 py-1 bg-gray-800 rounded-lg text-gray-300 tracking-wider uppercase border border-gray-700/50">{coin.symbol}</span>
               </h1>
               <div className="text-3xl font-light text-gray-300 tracking-wide">
                 ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
               </div>
             </div>
           </div>
           
           <div className="flex flex-col items-end justify-center space-y-3">
             <div className={`px-5 py-2 rounded-xl text-xl font-bold flex items-center space-x-2 shadow-inner border ${isPositive ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/40' : 'bg-red-900/20 text-red-400 border-red-800/40'}`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
             </div>
             <div className="text-gray-400 font-medium tracking-wide">
                24h Vol: <span className="text-white">${(coin.volume24h / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</span>
             </div>
           </div>
        </header>

        <section className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-md mb-8 relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
           
           <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-white border-b border-gray-700/50 pb-4 relative z-10">
             <span className="text-3xl drop-shadow-md">🧠</span> 
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
               Claw AI Deep Analysis
             </span>
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
              <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-700/60 flex flex-col justify-center shadow-inner">
                 <div className="text-sm text-gray-400 font-semibold uppercase tracking-widest mb-2">Market Action Stance</div>
                 <div className={`text-2xl font-black ${guidance.stance === 'BULLISH' ? 'text-emerald-400' : guidance.stance === 'BEARISH' ? 'text-red-400' : 'text-amber-400'}`}>
                   {guidance.stance}
                 </div>
              </div>
              <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-700/60 flex flex-col justify-center shadow-inner">
                 <div className="text-sm text-gray-400 font-semibold uppercase tracking-widest mb-2">Investment Horizon</div>
                 <div className="text-2xl font-black text-purple-400">
                   {guidance.horizon}
                 </div>
              </div>
           </div>

           <div className="prose prose-invert prose-lg max-w-none relative z-10">
             {deepAnalysis.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed tracking-wide mb-6">
                   {paragraph}
                </p>
             ))}
           </div>
        </section>
      </div>
    </div>
  );
}
