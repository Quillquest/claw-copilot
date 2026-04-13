'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  asset: string;
  headline: string;
  summary: string;
  time: string;
}

export default function InsightPanel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/insights');
        const json = await res.json();
        if (json.success) {
          setNews(json.data.slice(0, 4));
        }
      } catch (e) {
        console.error('Failed to fetch news:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 min updates for news
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-md h-full shadow-lg flex flex-col hover:border-blue-500/30 transition-all">
      <h2 className="text-xl font-bold mb-5 flex items-center justify-between text-white border-b border-gray-700/50 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl drop-shadow-md animate-pulse">📰</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
            Latest Market News
          </span>
        </div>
        <div className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      </h2>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {news.map((item, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/60 hover:border-gray-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 group-hover:bg-blue-400 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                 <Link href={`/coin/${item.asset.toLowerCase()}`} className="font-bold text-blue-400 capitalize text-xs tracking-wider hover:underline flex items-center">
                   {item.asset}
                 </Link>
                 <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{item.time || 'Just now'}</span>
              </div>
              
              <h3 className="text-gray-100 font-bold leading-snug mb-2 pl-2 text-sm group-hover:text-white transition-colors">
                 {item.headline}
              </h3>
              
              <p className="text-sm text-gray-400 leading-relaxed pl-2">
                {item.summary}
              </p>
            </div>
          ))}
          {news.length === 0 && (
             <div className="text-gray-400 italic text-sm text-center mt-10">Waiting for breaking news...</div>
          )}
        </div>
      )}
    </div>
  );
}
