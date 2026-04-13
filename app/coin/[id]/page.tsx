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
  
  const coin = await fetchCoinDetails(id);
  
  if (!coin) {
    notFound();
  }
  
  const marketData = [{
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    price: coin.price,
    volume24h: coin.volume24h,
    change24h: coin.change24h,
    image: coin.image,
  }];
  
  const suggestions = generateTradeSuggestions(marketData, []); 
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
            content: `You are Claw Copilot, an expert DeFi analyst. Analyze ${coin.name}. 
            Ave.ai Security: Honeypot=${coin.aveRisk?.isHoneypot ? 'Yes' : 'No'}, Score=${coin.aveRisk?.riskScore}/100, Tax=${coin.aveRisk?.buyTax}%/ ${coin.aveRisk?.sellTax}%.
            Metrics: Price $${coin.price}, Change ${coin.change24h}%. 
            Provide 3 paragraphs of deep analysis. Summarize risk first if high.`
          }
        ]
      });
      deepAnalysis = response.choices[0]?.message?.content || "Analysis unavailable.";
    } catch (e) {
      deepAnalysis = "AI Analysis Error.";
    }
  }

  const isPositive = coin.change24h >= 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium mb-8 inline-block">
          ← Back to Dashboard
        </Link>
        
        <header className="bg-gray-900/40 p-8 rounded-3xl border border-gray-800/60 mb-8 flex justify-between items-center">
           <div className="flex items-center space-x-6">
             <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full shadow-lg" />
             <div>
               <h1 className="text-4xl font-extrabold text-white flex items-center space-x-3">
                 <span>{coin.name}</span>
                 <span className="text-sm px-2 py-1 bg-gray-800 rounded uppercase">{coin.symbol}</span>
               </h1>
               <div className="text-2xl text-gray-300">${coin.price.toLocaleString()}</div>
             </div>
           </div>
           
           <div className="text-right">
             <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'}{Math.abs(coin.change24h).toFixed(2)}%
             </div>
             <div className="text-gray-500 text-sm">24h Vol: ${(coin.volume24h / 1000000).toFixed(1)}M</div>
           </div>
        </header>

        <section className="bg-gray-800/30 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-md mb-8">
           <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-white">
             <span>🧠</span> 
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Claw AI Deep Analysis</span>
           </h2>
           
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-700/60 text-center">
                 <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Market Stance</div>
                 <div className={`text-xl font-bold ${guidance.stance === 'BULLISH' ? 'text-emerald-400' : 'text-red-400'}`}>{guidance.stance}</div>
              </div>
              <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-700/60 text-center">
                 <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Horizon</div>
                 <div className="text-xl font-bold text-purple-400">{guidance.horizon}</div>
              </div>
           </div>

           {coin.aveRisk && (
             <div className="mb-8 p-6 bg-red-900/10 border border-red-500/20 rounded-2xl">
                <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center space-x-2">
                   <span>🛡️ Security Report (Ave.ai)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Honeypot</div>
                      <div className={`text-sm font-bold ${coin.aveRisk.isHoneypot ? 'text-red-500' : 'text-emerald-400'}`}>{coin.aveRisk.isHoneypot ? 'YES' : 'No'}</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Taxes</div>
                      <div className="text-sm font-bold text-white">{coin.aveRisk.buyTax}% / {coin.aveRisk.sellTax}%</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Risk Score</div>
                      <div className="text-sm font-bold text-amber-400">{coin.aveRisk.riskScore}/100</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Owner</div>
                      <div className="text-sm font-bold text-blue-400 truncate">{coin.aveRisk.ownerAddress.substring(0,6)}...</div>
                   </div>
                </div>
                <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-700/50">{coin.aveRisk.summary}</p>
             </div>
           )}

           <div className="text-gray-300 leading-relaxed space-y-4">
              {deepAnalysis.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
           </div>
        </section>
      </div>
    </div>
  );
}
