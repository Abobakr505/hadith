import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { hadithService } from './services/hadithService';
import ChatBubble from './components/ChatBubble';
import { Sparkle } from 'lucide-react';

const App: React.FC = () => {
const [messages, setMessages] = useState<Message[]>(() => {
  const saved = localStorage.getItem('hadith-chat');

  if (!saved) {
    return [
      {
        id: 'welcome',
        role: 'assistant',
      content: 'السلام عليكم ورحمة الله وبركاته. أنا مساعدك المتخصص في التحقق من صحة الأحاديث النبوية.\nتفضل بكتابة نص الحديث المبحوث عنه، وسأوافيك بحكم المحدثين عليه.',
        timestamp: new Date()
      }
    ];
  }

  return JSON.parse(saved).map((msg: Message) => ({
    ...msg,
    timestamp: new Date(msg.timestamp), // 🔥 التحويل المهم
  }));
});

useEffect(() => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hadith-chat', JSON.stringify(messages));
}, [messages]);


  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
const [toast, setToast] = useState<string | null>(null);



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
  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'السلام عليكم ورحمة الله وبركاته. أنا مساعدك المتخصص في التحقق من صحة الأحاديث النبوية.\nتفضل بكتابة نص الحديث المبحوث عنه، وسأوافيك بحكم المحدثين عليه.',
        timestamp: new Date()
      }
    ]);
  };
  const handleClearConfirm = () => {
  clearChat();
  setShowClearConfirm(false);
  setToast('تم مسح المحادثة بنجاح');
};

useEffect(() => {
  if (!toast) return;
  const t = setTimeout(() => setToast(null), 2500);
  return () => clearTimeout(t);
}, [toast]);


  const examples = [
    "هل هناك حديث يحرم الكذب ؟",
    "من صام رمضان إيماناً واحتساباً",
    "صلاة قيام الليل  سريه أم جهريه ؟" ,
    "الجنه تحت اقدام الامهات "
  ];

  return (
  <>
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
{/* Header */}
<header className="
  sticky top-0 z-30
  bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900
  backdrop-blur-md
  text-white
  px-6 py-3
  shadow-[0_10px_10px_-10px_rgba(0,0,0,0.6)]
  border-b border-emerald-700/50
">
  <div className="flex items-center justify-between">

    {/* Left */}
    <div className="flex items-center gap-4">
      <div className="
        bg-gradient-to-br from-emerald-700 to-emerald-900
        p-3 rounded-2xl
        border border-emerald-600/40
        shadow-inner
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-emerald-100">
          <path d="m11 17 2 2 4-4"/>
          <path d="m3 10 2.5-2.5L3 5"/>
          <path d="m3 19 2.5-2.5L3 14"/>
          <path d="M10 6h11"/>
          <path d="M10 12h11"/>
          <path d="M10 18h11"/>
        </svg>
      </div>

      <div>
        <h1 className="font-extrabold text-xl tracking-tight leading-none">
          محقّق الأحاديث
        </h1>
        <p className="text-[11px] text-emerald-300 font-medium tracking-wide mt-1">
         تحقيق علمي من مصادر الحديث الموثوقة
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3"> 
<button 
  onClick={() => {
  if (messages.length > 1) {
    setShowClearConfirm(true);
  }
}}

className={`sm:flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl transition
  ${messages.length > 1
    ? 'bg-emerald-950/50 text-emerald-200 hover:text-rose-500 hover:bg-rose-50'
    : 'bg-slate-800/30 text-slate-500 cursor-not-allowed'
  }`}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
</button>

    {/* Right */}
    <div className="
      hidden sm:flex items-center gap-2
      text-[11px]
      bg-emerald-950/50
      px-3 py-1.5
      rounded-full
      border border-emerald-700/60
      backdrop-blur
    ">
      
      <span className="
        w-2 h-2
        bg-green-400
        rounded-full
        animate-pulse
        shadow-[0_0_10px_rgba(74,222,128,0.6)]
      "></span>
      <span className="text-emerald-200 font-medium">
        مصادر موثوقة
      </span>
    </div>

  </div>
  </div>
</header>


      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:px-[20%] lg:px-[28%] space-y-6 pb-44"
      >
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-100 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="bg-white/60 backdrop-blur-sm p-10 rounded-[3rem] shadow-[0_8px_30px_#05966933] border border-slate-100 text-center max-w-md mb-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
<h3 className="font-extrabold text-lg sm:text-xl text-slate-800 mb-2 text-center">
  كيف يمكنني مساعدتك؟
</h3>

<p className="text-slate-500 text-sm leading-relaxed font-medium mb-3 text-center px-3 sm:px-4">
  أدخل نص الحديث أو جزءًا منه للتأكد من درجته العلمية وتخريجه المعتمد.
</p>

<p className="text-emerald-500 text-sm leading-relaxed font-medium flex items-start justify-center gap-2 px-4 text-center bg-emerald-50/40 rounded-xl py-3 mt-4 mb-4">
   <Sparkle className="w-3 h-3 shrink-0 mt-[3px] text-teal-500" />
  <span>
    من الممكن لك أيضًا السؤال عن حديث أو حكم شرعي
  </span>
</p>

             
              <div className="grid grid-cols-1 gap-2">
                {examples.map((ex, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-[12px] bg-white text-slate-600 px-5 py-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100 hover:border-emerald-200 font-bold active:scale-[0.98] shadow-sm text-right flex items-center gap-3"
                  >
                    <span className="text-emerald-300">✦</span>
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
<div
  className="
    relative bg-white
    p-2 sm:p-3
    rounded-[1.8rem] sm:rounded-[2.5rem]
    shadow-[0_10px_35px_-10px_rgba(0,0,0,0.06)]
    border border-slate-100
    flex items-end gap-2 sm:gap-3
    focus-within:ring-4 focus-within:ring-emerald-500/5
    focus-within:border-emerald-200
    transition-all duration-500
  "
>
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
    placeholder="اكتب نص الحديث للتحقق منه..."
    className="
      flex-1 bg-transparent border-none
      py-3 sm:py-4
      px-4 sm:px-6
      focus:outline-none resize-none
      text-sm sm:text-base
      leading-relaxed
      text-black
      placeholder-slate-300
      min-h-[48px] sm:min-h-[56px]
      max-h-40 sm:max-h-48
    "
    rows={1}
  />

  <button
    onClick={handleSend}
    disabled={!input.trim() || isTyping}
    className={`
      w-12 h-12 sm:w-14 sm:h-14
      rounded-[1.2rem] sm:rounded-[1.8rem]
      transition-all duration-300
      flex items-center justify-center
      shadow-md
      ${
        input.trim() && !isTyping
          ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 active:scale-95'
          : 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none border border-slate-100'
      }
    `}
    title="إرسال"
  >
    {isTyping ? (
      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transform rotate-[-15deg]"
      >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )}
  </button>
</div>

        <p className="text-[12px] text-gray-500 text-center mt-3 font-tajawal">
         ( نضر الله امرأ سمع مقالتي فوعاها حتى يؤديها إلى من لم يسمعها )
        </p> 
        <a href="https://bakrhasan.vercel.app/" target="_blank" rel="noopener noreferrer">
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
    {showClearConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-fadeIn">
      
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
      </div>

      <h3 className="text-sm font-bold text-slate-700 mb-2">
        تأكيد مسح المحادثة
      </h3>

      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        هل أنت متأكد من رغبتك في مسح المحادثة؟  
        لا يمكن التراجع عن هذا الإجراء.
      </p>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setShowClearConfirm(false)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
        >
          إلغاء
        </button>

        <button
onClick={handleClearConfirm}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition"
        >
          نعم، مسح
        </button>
      </div>
    </div>
  </div>
)}
{toast && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
    bg-emerald-600 text-white text-xs px-5 py-3 rounded-full shadow-lg
    animate-in fade-in slide-in-from-bottom-4 duration-300">
    {toast}
  </div>
)}

</>
  );
};

export default App;