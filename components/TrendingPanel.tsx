'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  change24h: number;
}

export default function TrendingPanel() {
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const json = await res.json();
        
        if (json.success) {
          setTrending(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch trending coins:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrending();
    const interval = setInterval(fetchTrending, 60000); // 1-minute updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/40 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-md shadow-xl flex flex-col h-full hover:border-purple-500/30 transition-colors">
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-white border-b border-gray-700/50 pb-4">
        <span className="text-3xl drop-shadow-md">🔥</span> 
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
           Global Trending Searches
        </span>
      </h2>
      
      <div className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {trending.map((item, i) => {
              const isPositive = item.change24h >= 0;
              return (
                <Link key={i} href={`/coin/${item.id}`} className="block group">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-900/40 border border-gray-700/30 hover:bg-gray-800/60 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <img src={item.thumb} alt={item.symbol} className="w-10 h-10 rounded-full shadow-md group-hover:rotate-12 transition-transform" />
                      <div>
                        <div className="font-bold text-gray-200 capitalize tracking-wide group-hover:text-purple-400 transition-colors">{item.name}</div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{item.symbol}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-sm font-bold flex items-center space-x-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span>{isPositive ? '▲' : '▼'}</span>
                        <span>{Math.abs(item.change24h).toFixed(2)}%</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase mt-1 tracking-widest">24H Move</div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {trending.length === 0 && (
              <div className="text-center text-gray-500 italic mt-10">No trending data available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
