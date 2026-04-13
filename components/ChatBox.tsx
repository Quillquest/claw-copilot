'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Claw Copilot. How can I help you with your crypto trading today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Analyze the top gainer today",
    "What's the global market sentiment?",
    "Explain Bitcoin's movement",
    "Find a good short-term play"
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (submitText?: string | React.FormEvent) => {
    if (typeof submitText !== 'string' && submitText?.preventDefault) {
      submitText.preventDefault();
    }
    
    const textToSend = typeof submitText === 'string' ? submitText : input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    if (!submitText || typeof submitText !== 'string') {
       setInput('');
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      if (data.content) {
        setMessages([...newMessages, { role: data.role || 'assistant', content: data.content }]);
      } else {
         setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-md h-full shadow-lg flex flex-col transition-all hover:border-blue-500/30 overflow-hidden">
      <div className="bg-gray-900/60 p-4 border-b border-gray-700/50 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center space-x-2 text-white">
          <span className="text-xl">🤖</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Copilot Assistant
          </span>
        </h2>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-900/20' : 'bg-gray-700/80 text-gray-200 rounded-bl-none shadow-md shadow-gray-900/50 border border-gray-600/50'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 text-gray-400 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700/50 flex space-x-2 items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900/40 border-t border-gray-700/50 rounded-b-3xl">
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 mb-3 pb-1 -mx-2 px-2">
           {suggestedPrompts.map((prompt, i) => (
               <button 
                 key={i} 
                 onClick={() => handleSend(prompt)} 
                 className="whitespace-nowrap px-4 py-1.5 bg-gray-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-gray-700 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-sm"
               >
                  {prompt}
               </button>
           ))}
        </div>
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-gray-800 text-sm text-white rounded-full pl-5 pr-12 py-3 border border-gray-600/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-full w-9 flex items-center justify-center transition-colors shadow-lg"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
