'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking absolutely anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.coins || []);
          setShowDropdown(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms delay so typing feels insanely smooth

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (id: string) => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    router.push(`/coin/${id}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl z-50">
      <div className="relative group flex items-center">
        <div className="absolute left-4 z-10 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full bg-gray-900/60 border border-gray-700/50 text-white rounded-2xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-md placeholder-gray-500 font-medium relative z-0"
          placeholder="Search any token (e.g., Dogecoin, Shiba Inu, Pepe...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute mt-3 w-full bg-gray-800/95 border border-gray-700/50 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          <ul>
            {results.map((coin) => (
              <li 
                key={coin.id}
                onClick={() => handleSelect(coin.id)}
                className="flex items-center px-5 py-4 hover:bg-gray-700/60 cursor-pointer transition-colors border-b border-gray-700/30 last:border-b-0 group"
              >
                <img src={coin.thumb} alt={coin.name} className="w-10 h-10 rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-base tracking-wide group-hover:text-blue-400 transition-colors">{coin.name}</span>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{coin.symbol}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
