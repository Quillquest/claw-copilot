import React from 'react';
import Link from 'next/link';
import type { CryptoData } from '@/lib/dataProvider';

interface PriceCardProps {
  data: CryptoData;
}

export default function PriceCard({ data }: PriceCardProps) {
  const isPositive = data.change24h >= 0;

  return (
    <Link href={`/coin/${data.id}`} className="block border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 group">
      <div className="bg-gray-800 text-white rounded-2xl p-6 shadow-xl border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm bg-opacity-80">
        {/* Decorative gradient blob */}
        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            {data.image && (
              <img src={data.image} alt={data.id} className="w-8 h-8 rounded-full shadow-sm bg-gray-900/50 p-0.5 group-hover:rotate-12 transition-transform duration-300" />
            )}
            <h3 className="text-xl font-bold capitalize tracking-wide">{data.id}</h3>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-gray-700/80 rounded-md text-gray-300 tracking-wider uppercase backdrop-blur-sm">
            {data.symbol}
          </span>
        </div>
        
        <div className="text-4xl font-extrabold mb-3 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">
          ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex justify-between text-sm font-medium relative z-10">
          <span className="text-gray-400">Vol 24h: ${(data.volume24h / 1000000).toFixed(2)}M</span>
          <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(data.change24h).toFixed(2)}%</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
