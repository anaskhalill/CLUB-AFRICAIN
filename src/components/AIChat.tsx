'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Sorry, an error occurred.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="bg-red-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <span>AI Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-white">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2" data-lenis-prevent="true">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg ${
                  msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-500">Assistant is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-transparent text-white p-4 rounded-full shadow-lg hover:bg-white/10"
        >
          💬
        </button>
      )}
    </div>
  );
}