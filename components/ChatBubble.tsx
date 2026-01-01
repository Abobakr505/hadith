import React, { useState } from 'react';
import { Message } from '../types';
import { Share2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const extractSections = (content: string) => {
    return {
      text: content.match(/\[TEXT\]:(.*?)(?=\[STATUS\]|\[SOURCE\]|\[GRADE\]|\[WEAKNESS_REASON\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      status: content.match(/\[STATUS\]:(.*?)(?=\[TEXT\]|\[SOURCE\]|\[GRADE\]|\[WEAKNESS_REASON\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      source: content.match(/\[SOURCE\]:(.*?)(?=\[TEXT\]|\[STATUS\]|\[GRADE\]|\[WEAKNESS_REASON\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      grade: content.match(/\[GRADE\]:(.*?)(?=\[TEXT\]|\[STATUS\]|\[SOURCE\]|\[WEAKNESS_REASON\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      reason: content.match(/\[WEAKNESS_REASON\]:(.*?)(?=\[TEXT\]|\[STATUS\]|\[SOURCE\]|\[GRADE\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      alternative: content.match(/\[ALTERNATIVE\]:(.*?)(?=\[TEXT\]|\[STATUS\]|\[SOURCE\]|\[GRADE\]|\[WEAKNESS_REASON\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
      note: content.match(/\[NOTE\]:(.*?)(?=\[TEXT\]|\[STATUS\]|\[SOURCE\]|\[GRADE\]|\[WEAKNESS_REASON\]|\[ALTERNATIVE\]|\[LINKS\]|\[NOTE\]|\[HADITH_END\]|$)/s)?.[1]?.trim(),
    };
  };

  const renderStructuredContent = (content: string) => {
    const sections = extractSections(content);

    if (!sections.text && !sections.status) {
      return <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{content}</div>;
    }

    const isNonAuthentic = sections.status?.includes('ضعيف') || sections.status?.includes('موضوع') || sections.status?.includes('لا أصل');
    const authenticHadith = sections.alternative || (!isNonAuthentic ? sections.text : null);

    const handleCopy = (textToCopy: string) => {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (textToShare: string) => {
      if (navigator.share) {
        navigator.share({
          title: 'حديث صحيح',
          text: textToShare,
        }).catch(console.error);
      } else {
        // Fallback: copy to clipboard if share not supported
        handleCopy(textToShare);
        alert('تم نسخ الحديث إلى الحافظة للمشاركة');
      }
    };

    const renderActionButtons = (hadithText: string) => (
      <div className="flex justify-end gap-3 mt-3">
        <button
          onClick={() => handleCopy(hadithText)}
          className="group relative px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'تم النسخ!' : 'نسخ'}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            نسخ النص
          </span>
        </button>
        <button
          onClick={() => handleShare(hadithText)}
          className="group relative px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
        >
<Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
          مشاركة
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            مشاركة الحديث
          </span>
        </button>
      </div>
    );

    return (
      <div className="space-y-4 py-1">
        {sections.status && (
          <div className={`text-center py-2 px-6 rounded-full font-bold text-sm border shadow-sm ${
            isNonAuthentic ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
             الدرجة: {sections.status}
          </div>
        )}

        {sections.text && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-widest">🔹 نص الحديث المبحوث:</h4>
            <p className="hadith-font text-xl leading-relaxed text-slate-800 tracking-wide">«{sections.text}»</p>
            {!sections.alternative && !isNonAuthentic && authenticHadith && renderActionButtons(authenticHadith)}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.source && (
            <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
              <h4 className="text-blue-800 text-[10px] font-bold mb-1 flex items-center gap-1">📘 التخريج:</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{sections.source}</p>
            </div>
          )}
          
          {sections.grade && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h4 className="text-slate-700 text-[10px] font-bold mb-1 flex items-center gap-1">✅ حكم المحدثين:</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{sections.grade}</p>
            </div>
          )}
        </div>

        {sections.reason && (
          <div className="bg-red-50/40 p-3 rounded-xl border border-red-100">
            <h4 className="text-red-800 text-[10px] font-bold mb-1">⚠️ علة الحديث:</h4>
            <p className="text-xs text-slate-700 italic leading-relaxed">{sections.reason}</p>
          </div>
        )}

        {sections.alternative && (
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 border-dashed">
            <h4 className="text-emerald-800 text-[10px] font-bold mb-1 flex items-center gap-1">✨ البديل الصحيح المعتمد:</h4>
            <p className="hadith-font text-lg leading-relaxed text-emerald-900 tracking-wide">«{sections.alternative}»</p>
            {authenticHadith && renderActionButtons(authenticHadith)}
          </div>
        )}

        {sections.note && (
          <div className="bg-amber-50/30 p-3 rounded-xl border border-amber-100">
            <h4 className="text-amber-800 text-[10px] font-bold mb-1">📝 فائدة توضيحية:</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{sections.note}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div 
        className={`max-w-[95%] md:max-w-[85%] p-4 rounded-2xl shadow-sm border transition-all relative ${
          isUser 
            ? 'bg-emerald-800 text-white border-emerald-900 rounded-br-none' 
            : 'bg-white border-slate-200 text-slate-800 rounded-bl-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1">
          <span className={`text-[13px] font-bold uppercase tracking-widest ${isUser ? 'text-emerald-100' : 'text-emerald-700'}`}>
            {isUser ? 'السائل' : 'المحقق الشرعي'}
          </span>
          <div className="flex-1"></div>
          

          <span className={`text-[12px] opacity-60 ${isUser ? 'text-white' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="leading-relaxed">
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm md:text-base font-medium">{message.content}</div>
          ) : (
            renderStructuredContent(message.content)
          )}
          
          {message.status === 'loading' && (
            <div className="flex items-center gap-3 mt-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold">جاري مراجعة المصادر...</span>
            </div>
          )}
        </div>

        {!isUser && message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">روابط المراجعة:</p>
            <div className="flex flex-wrap gap-2">
              {message.groundingUrls.map((url, idx) => (
                <a 
                  key={idx}
                  href={url.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] bg-slate-50 text-slate-600 px-3 py-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-200 hover:border-emerald-200 flex items-center gap-1 font-bold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  {url.title || 'المرجع'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;