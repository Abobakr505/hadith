import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { hadithService } from './services/geminiService';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'السلام عليكم ورحمة الله وبركاته. أنا مساعدك المتخصص في التحقق من صحة الأحاديث النبوية.\nتفضل بكتابة نص الحديث المبحوث عنه، وسأوافيك بحكم المحدثين عليه.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'loading'
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await hadithService.verifyHadith(userMessage.content);
      
      setMessages(prev => prev.map(m => 
        m.id === loadingMessage.id 
          ? { 
              ...m, 
              content: response.text, 
              status: 'success', 
              groundingUrls: response.urls 
            } 
          : m
      ));
    } catch (error: any) {
      let errorMessage = 'عذراً، حدث خطأ في الاتصال بالمصادر. يرجى المحاولة لاحقاً.';
      if (error.message.includes('quota') || error.code === 429) {
        errorMessage = 'عذراً، تجاوزنا الحد المسموح للطلبات حاليًا (خطأ 429). يرجى الانتظار دقيقة أو التحقق من إعدادات حساب Google AI (تفعيل الفوترة لزيادة الحدود).';
      } else if (error.code === 404) {
        errorMessage = 'عذراً، النموذج غير متوفر (خطأ 404). يرجى التحقق من اسم النموذج في الكود أو تحديث الـ API.';
      }
      setMessages(prev => prev.map(m => 
        m.id === loadingMessage.id 
          ? { 
              ...m, 
              content: errorMessage, 
              status: 'error' 
            } 
          : m
      ));
    } finally {
      setIsTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const examples = [
    "من صام رمضان إيماناً واحتساباً",
    "حديث: من قرأ سورة يس في ليلة أصبح مغفوراً له",
    "لا تزال طائفة من أمتي على الحق ظاهرين" ,
    "الجنه تحت اقدام الامهات "
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-emerald-900 text-white px-6 py-3 shadow-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-800 p-2.5 rounded-2xl border border-emerald-700 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-50"><path d="m11 17 2 2 4-4"/><path d="m3 10 2.5-2.5L3 5"/><path d="m3 19 2.5-2.5L3 14"/><path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/></svg>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none mb-1">محقق الأحاديث</h1>
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">تحقيق معتمد من أمهات الكتب</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
         المصادر الموثوقه
        </div>
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:px-[15%] lg:px-[25%] space-y-4 pb-40"
      >
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-90 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 text-center max-w-sm mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">كيف أساعدك اليوم؟</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">اكتب الحديث أو جزءاً منه للتأكد من صحته:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {examples.map((ex, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-[11px] bg-slate-50 text-slate-700 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-slate-200 font-bold active:scale-95 shadow-sm"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto w-full">
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </div>
      </main>

      {/* Enhanced Sending Field */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 md:px-[15%] lg:px-[25%] z-40 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white p-2 rounded-[1.8rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200 flex items-end gap-2 focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500 transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب الحديث هنا للتحقق..."
              className="flex-1 bg-transparent border-none py-3 px-5 focus:outline-none resize-none text-sm md:text-base leading-relaxed text-slate-800 placeholder-slate-400 min-h-[48px] max-h-40"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                input.trim() && !isTyping 
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-800/20 hover:bg-emerald-800 hover:scale-[1.03] active:scale-95' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="إرسال"
            >
              {isTyping ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-[-15deg]"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              )}
            </button>
          </div>
        <p className="text-[12px] text-gray-400 text-center mt-3 font-tajawal">
         ( نَضَّرَ اللهُ امْرَأً سَمِعَ مَقَالَتِي فَوَعَاهَا ‌حَتَّى ‌يُؤَدِّيهَا ‌إِلَى ‌مَنْ ‌لَمْ ‌يَسْمَعْهَا )
        </p> 
        <a href="https://bakrhasan.netlify.app/" target="_blank" rel="noopener noreferrer">
<p className="flex justify-center gap-1 item-center flex-row text-xs md:text-sm text-gray-500 text-center mt-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 font-tajawal shadow-sm">
  صُمِّم وطُوِّر بكل  
  <span className="animate-pulse">💚</span>
  بواسطة  
  <span className="text-emerald-500 font-semibold"> أبوبكر حسن </span>
</p>
</a>
        </div>
      </footer>
    </div>
  );
};

export default App;