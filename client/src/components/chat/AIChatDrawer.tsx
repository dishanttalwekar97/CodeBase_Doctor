import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, Code2 } from 'lucide-react';
import { api } from '../../services/api';
import { useScan } from '../../context/ScanContext';

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
  time: string;
}

export const AIChatDrawer: React.FC = () => {
  const { currentScan, selectedRepo } = useScan();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'AI',
      text: `Hello! I am your **Codebase Doctor AI Architect**. Ask me anything about refactoring, fixing vulnerabilities, or optimizing performance for **${selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : 'your repository'}**.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!currentScan) return null;

  const quickPrompts = [
    'How do I fix N+1 loop query issues?',
    'What security flaws should I prioritize first?',
    'Give me a step-by-step refactoring plan'
  ];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'USER',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/scans/chat', {
        scanId: currentScan.id,
        message: messageText
      });

      const aiMsg: ChatMessage = {
        sender: 'AI',
        text: res.data.reply || 'Analysis complete.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: `Sorry, I encountered an error answering your question: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-mono text-xs font-bold shadow-glow flex items-center gap-2.5 transition active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-cyan-200" />
        <span>Chat with AI Architect</span>
      </button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg h-full bg-[#0D1117] border-l border-white/10 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      Codebase Doctor AI <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Grounded in {selectedRepo?.owner}/{selectedRepo?.name} findings
                    </p>
                  </div>
                </div>

                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0E14]">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2.5 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'AI' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-300">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'USER'
                          ? 'bg-indigo-600 text-white font-sans'
                          : 'glass-panel border border-white/10 text-gray-200 font-sans'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[9px] font-mono text-gray-400 mt-1.5 text-right">{msg.time}</div>
                    </div>

                    {msg.sender === 'USER' && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-300">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5 items-center text-xs text-indigo-400 font-mono">
                    <Bot className="w-4 h-4 animate-spin" />
                    <span>AI Architect analyzing repository code context...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompts Chips */}
              <div className="p-3 bg-[#161B26] border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Suggested Prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      disabled={loading}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-300 transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0D1117] border-t border-white/10">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask Codebase Doctor AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-[#0A0E14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`p-2.5 rounded-xl text-white shadow-glow transition ${
                      loading || !input.trim() ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
