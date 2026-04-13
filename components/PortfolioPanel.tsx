import React from 'react';

// Mock data for the hackathon demo
const mockPortfolio = [
  { asset: 'bitcoin', symbol: 'BTC', balance: 0.45, value: 29500, change24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { asset: 'ethereum', symbol: 'ETH', balance: 8.2, value: 24600, change24h: -1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { asset: 'solana', symbol: 'SOL', balance: 140, value: 21000, change24h: 6.8, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { asset: 'usdc', symbol: 'USDC', balance: 15400, value: 15400, change24h: 0, image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' },
];

export default function PortfolioPanel() {
  const totalValue = mockPortfolio.reduce((sum, item) => sum + item.value, 0);
  const totalChange24h = mockPortfolio.reduce((sum, item) => sum + (item.value * (item.change24h / 100)), 0);
  const totalChangePercent = (totalChange24h / totalValue) * 100;

  const isPositive = totalChangePercent >= 0;

  return (
    <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-md h-full shadow-lg flex flex-col transition-all hover:border-purple-500/30">
      <h2 className="text-xl font-bold mb-5 flex items-center space-x-3 text-white border-b border-gray-700/50 pb-4">
        <span className="text-2xl drop-shadow-md">💼</span> 
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
          My Portfolio
        </span>
      </h2>
      
      <div className="mb-6 flex justify-between items-end">
        <div>
           <div className="text-sm text-gray-400 mb-1 font-medium">Total Balance</div>
           <div className="text-4xl font-extrabold text-white tracking-tight">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </div>
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-inner ${isPositive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30' : 'bg-red-900/30 text-red-400 border border-red-800/30'}`}>
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>${Math.abs(totalChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="opacity-75 hidden sm:inline-block">({Math.abs(totalChangePercent).toFixed(2)}%)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-3">
          {mockPortfolio.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors group">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.symbol} className="w-10 h-10 rounded-full bg-gray-800 shadow-md border border-gray-600/50 group-hover:border-purple-500/50 transition-colors p-0.5" />
                <div>
                  <div className="font-bold text-gray-200 capitalize tracking-wide">{item.asset}</div>
                  <div className="text-xs text-gray-500 font-medium">{item.balance} {item.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-200">${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`text-xs font-bold ${item.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change24h > 0 ? '+' : ''}{item.change24h}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
