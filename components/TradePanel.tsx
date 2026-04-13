'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MarketGuidance } from '@/lib/tradeService';

export default function TradePanel() {
  const [guidanceList, setGuidanceList] = useState<MarketGuidance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const res = await fetch('/api/suggestions');
        const json = await res.json();
        if (json.success) {
          setGuidanceList(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch guidance:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuidance();
    const interval = setInterval(fetchGuidance, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStanceStyles = (stance: string) => {
    if (stance === 'BULLISH') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (stance === 'BEARISH') return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  };

  const getHorizonStyle = (horizon: string) => {
    return horizon === 'SHORT-TERM' ? 'text-purple-400 bg-purple-900/20' : 'text-blue-400 bg-blue-900/20';
  };

  return (
    <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-md h-full shadow-lg flex flex-col transition-all hover:border-amber-500/30">
      <h2 className="text-xl font-bold mb-5 flex items-center space-x-3 text-white border-b border-gray-700/50 pb-4">
        <span className="text-2xl drop-shadow-md">🧭</span> 
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-300">
          Market Direction Guide
        </span>
      </h2>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {guidanceList.map((item, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/60 flex flex-col space-y-3 hover:border-gray-500/50 transition-colors">
              <div className="flex flex-wrap justify-between items-center gap-y-2">
                 <Link href={`/coin/${item.asset}`} className="flex items-center space-x-2 pr-2 group transition-opacity">
                    {item.image && (
                      <img src={item.image} alt={item.asset} className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform" />
                    )}
                    <h4 className="font-bold text-white capitalize text-base tracking-wide group-hover:text-amber-400 transition-colors">{item.asset}</h4>
                 </Link>
                 <div className="flex space-x-2">
                   <div className={`whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold border ${getHorizonStyle(item.horizon)}`}>
                     {item.horizon}
                   </div>
                   <div className={`whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold border ${getStanceStyles(item.stance)} flex items-center shadow-inner`}>
                     {item.stance} <span className="ml-1 opacity-70">({item.confidence}%)</span>
                   </div>
                 </div>
              </div>
              <p className="text-sm text-gray-300 pt-2 border-t border-gray-800/50 leading-relaxed italic border-l-2 pl-3 border-l-amber-500/50">
                "{item.analysis}"
              </p>
            </div>
          ))}
          {guidanceList.length === 0 && (
            <div className="text-gray-400 italic text-sm text-center mt-10">Waiting for market analysis...</div>
          )}
        </div>
      )}
    </div>
  );
}
