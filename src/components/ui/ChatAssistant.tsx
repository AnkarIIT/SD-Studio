import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, BadgeCheck, Loader2 } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getConciergeReply } from '../../lib/chatConcierge';

const QUICK = [
  'How do I place an order?',
  'Track my order',
  'Custom STL quote',
  'Payment & refunds',
];

type Msg = { id: number; text: string; sender: 'user' | 'bot'; time: string };

const ChatAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { settings } = useSettingsStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      text:
        "Hi — I'm SD Concierge. Ask about the shop, tracking your order, custom 3D prints, or how to reach us. Pick a quick topic below or type your question.",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const pushBot = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const runReply = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setIsTyping(true);
    try {
      const reply = await getConciergeReply(trimmed, {
        contactEmail: settings.contactEmail,
        instagramUrl: settings.instagramUrl,
        heroSubtitle: settings.heroSubtitle,
      });
      pushBot(reply);
    } catch {
      pushBot(
        `Something went wrong. Please email ${settings.contactEmail} or use the Say Hello form on the homepage.`
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    void runReply(input);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 md:bottom-32 md:right-10 w-[calc(100vw-48px)] md:w-[420px] h-[600px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 flex flex-col overflow-hidden"
        >
          <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-gray-100/80 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-lg truncate">SD Concierge</p>
                  <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {import.meta.env.VITE_GEMINI_API_KEY ? 'AI + local tips' : 'Instant answers'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all shrink-0"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 no-scrollbar min-h-0">
            <div className="flex flex-wrap gap-2 pb-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isTyping}
                  onClick={() => void runReply(q)}
                  className="text-left text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-[1.25rem] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gray-900 text-white rounded-tr-md'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-md'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1.5 px-1">
                  {msg.time}
                </span>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-gray-100 p-4 rounded-[1.25rem] rounded-tl-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-xs text-gray-400">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 pt-3 border-t border-gray-50 shrink-0 bg-white/80">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about shop, orders, custom prints…"
                disabled={isTyping}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-12 text-sm outline-none focus:bg-white focus:border-gray-900 focus:shadow-md transition-all placeholder:text-gray-400 font-medium min-w-0"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="absolute right-2 bg-gray-900 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-center text-[9px] text-gray-400 mt-3 uppercase font-bold tracking-[0.15em]">
              Not for sensitive data — use email for account-specific help
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistant;
