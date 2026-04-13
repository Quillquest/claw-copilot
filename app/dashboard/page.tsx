'use client';

import { useEffect, useState } from 'react';
import PriceCard from '@/components/PriceCard';
import InsightPanel from '@/components/InsightPanel';
import TradePanel from '@/components/TradePanel';
import TrendingPanel from '@/components/TrendingPanel';
import ChatBox from '@/components/ChatBox';
import SearchBar from '@/components/SearchBar';
import type { CryptoData } from '@/lib/dataProvider';

export default function Dashboard() {
  const [prices, setPrices] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for prices every 10 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const json = await res.json();
        if (json.success) {
          setPrices(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch prices', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-200 mb-3 tracking-tight">
              Claw Copilot
            </h1>
            <p className="text-gray-400 text-lg tracking-wide">AI-Powered DeFi Trading Assistant</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">Live Sync</span>
          </div>
        </header>

        <section className="mb-14">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-amber-400 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                <span className="text-2xl drop-shadow-md">📈</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-200">Market Overview</h2>
                <p className="text-gray-400 text-sm font-medium">Real-time metrics and deep analysis</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex-1 max-w-xl">
              <SearchBar />
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800/50 animate-pulse h-40 rounded-2xl border border-gray-700/30"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prices.map((crypto) => (
                <PriceCard key={crypto.id} data={crypto} />
              ))}
            </div>
          )}
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column: Trending Panel */}
            <div className="lg:col-span-2">
              <TrendingPanel />
            </div>
          
          {/* Trade Suggestions & Execution occupying 1/3 width */}
          <div className="lg:col-span-1 h-[420px]">
            <TradePanel />
          </div>
        </div>

        {/* Bottom Row: AI Insights & Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* AI Insight Engine occupying 2/3 width */}
          <div className="lg:col-span-2 h-[400px]">
            <InsightPanel />
          </div>

          {/* Interactive Chat Assistant occupying 1/3 width */}
          <div className="lg:col-span-1 h-[400px]">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
}
