import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, Sparkles, User, BadgeCheck } from 'lucide-react';

const ChatAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to SD Studios. I'm your design assistant. How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      text: input, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulated high-end bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "That sounds exciting! We specialize in custom 3D manufacturing. Would you like to see our latest catalog or request a custom quote?", 
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 md:bottom-32 md:right-10 w-[calc(100vw-48px)] md:w-[420px] h-[600px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6 flex items-center justify-between border-b border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-lg">SD Concierge</p>
                  <BadgeCheck size={16} className="text-blue-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Support</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
          >
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-2 px-1">{msg.time}</span>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-gray-100 p-4 rounded-[1.5rem] rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 pt-4">
            <form 
              onSubmit={handleSend} 
              className="relative flex items-center"
            >
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message concierge..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 pr-16 text-sm outline-none focus:bg-white focus:border-gray-900 focus:shadow-md transition-all placeholder:text-gray-400 font-medium"
              />
              <button className="absolute right-2 bg-gray-900 text-white w-11 h-11 rounded-xl flex items-center justify-center hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg">
                <Send size={18} />
              </button>
            </form>
            <p className="text-center text-[9px] text-gray-300 mt-4 uppercase font-bold tracking-[0.2em]">Secure Encryption Active</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistant;
