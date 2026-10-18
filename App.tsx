import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown, BookOpenCheck, Copy, Minus, Moon, Plus, Search, Send, Star, Sun, Trash2, X,
} from 'lucide-react';
import { HadithItem, Message } from './types';
import { hadithService } from './services/hadithService';
import ChatBubble, { formatForShare } from './components/ChatBubble';
import { CSS } from './styles';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'السلام عليكم ورحمة الله وبركاته. أنا مساعدك للتحقق من صحة الأحاديث النبوية.\nاكتب نص الحديث أو جزءاً منه، وسأوافيك بحكم المحدثين عليه مع التخريج.',
  timestamp: new Date(),
};

const EXAMPLES = [
  'إنما الأعمال بالنيات',
  'من صام رمضان إيماناً واحتساباً',
  'الجنة تحت أقدام الأمهات',
  'اطلبوا العلم ولو في الصين',
];

const SCALES = [0.88, 1, 1.18, 1.4];
const SCALE_LABELS = ['صغير', 'متوسط', 'كبير', 'كبير جداً'];

const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = load<Message[] | null>('hadith-chat', null);
    if (!saved || !saved.length) return [WELCOME];
    return saved
      .filter((m) => m.status !== 'loading')
      .map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  });
  const [favs, setFavs] = useState<HadithItem[]>(() => load('hadith-favs', []));
  const [dark, setDark] = useState<boolean>(() => load('hadith-dark', false));
  const [fontLevel, setFontLevel] = useState<number>(() =>
    Math.min(SCALES.length - 1, Math.max(0, Number(load('hadith-font', 1)) || 0))
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [showDown, setShowDown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { localStorage.setItem('hadith-chat', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('hadith-favs', JSON.stringify(favs)); }, [favs]);

  // تكبير الخط: يضبط متغير --fs على الصفحة كلها
  useEffect(() => {
    localStorage.setItem('hadith-font', JSON.stringify(fontLevel));
    document.documentElement.style.setProperty('--fs', String(SCALES[fontLevel]));
  }, [fontLevel]);

  useEffect(() => {
    localStorage.setItem('hadith-dark', JSON.stringify(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const isFav = (id: string) => favs.some((f) => f.id === id);
  const toggleFav = (h: HadithItem) => {
    const exists = favs.some((f) => f.id === h.id);
    setFavs((prev) => (exists ? prev.filter((f) => f.id !== h.id) : [h, ...prev]));
    setToast(exists ? 'أُزيل من المفضلة' : 'حُفظ في المفضلة ⭐');
  };

  const changeFont = (delta: number) => {
    const next = Math.min(SCALES.length - 1, Math.max(0, fontLevel + delta));
    if (next === fontLevel) return;
    setFontLevel(next);
    setToast(`حجم الخط: ${SCALE_LABELS[next]}`);
  };

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId, role: 'assistant', content: 'جاري البحث ...', timestamp: new Date(), status: 'loading',
    };

    setMessages((p) => [...p, userMsg, loadingMsg]);
    setInput('');
    setIsTyping(true);

    const setProgress = (s: string) =>
      setMessages((p) => p.map((m) => (m.id === loadingId ? { ...m, content: s } : m)));

    try {
      const result = await hadithService.verify(text, setProgress);
      setMessages((p) =>
        p.map((m) =>
          m.id === loadingId ? { ...m, content: result.summary || '', status: 'success', result } : m
        )
      );
    } catch {
      setMessages((p) =>
        p.map((m) =>
          m.id === loadingId
            ? { ...m, content: 'عذراً، حدث خطأ في الاتصال بالمصادر. تحقق من الإنترنت وحاول مرة أخرى.', status: 'error' }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
    setShowClear(false);
    setToast('تم مسح المحادثة');
  };

  const canClear = messages.length > 1;

  return (
    <div dir="rtl" className="hx-root flex h-screen flex-col overflow-hidden">
      <style>{CSS}</style>

      {/* Header */}
{/* Header */}
<header className="hx-header">
  <div className="hx-hrow">
    <div className="hx-brand">
      <div className="hx-logo">
        <BookOpenCheck size={22} color="#fde68a" />
      </div>
      <div className="hx-titles">
        <h1 className="hx-title">محقّق الأحاديث</h1>
        <p className="hx-sub">تخريج وبيان درجة الحديث من المصادر الموثوقة</p>
      </div>
    </div>

    <div className="hx-tools">
      <div className="hx-fontbox" title="حجم الخط">
        <button className="hx-hbtn" onClick={() => changeFont(-1)} disabled={fontLevel === 0} aria-label="تصغير الخط">
          <Minus size={15} />
        </button>
        <div className="hx-fontlvl">
          <b>أ</b>
          <div className="hx-dots">
            {SCALES.map((_, i) => <i key={i} className={i <= fontLevel ? 'on' : ''} />)}
          </div>
        </div>
        <button className="hx-hbtn" onClick={() => changeFont(1)} disabled={fontLevel === SCALES.length - 1} aria-label="تكبير الخط">
          <Plus size={15} />
        </button>
      </div>

      <button className="hx-hbtn" onClick={() => setDark((d) => !d)} title="الوضع الليلي" aria-label="الوضع الليلي">
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <button className="hx-hbtn relative" style={{ color: '#fcd34d' }} onClick={() => setShowFavs(true)} title="المفضلة" aria-label="المفضلة">
        <Star size={17} />
        {favs.length > 0 && <span className="hx-badge">{favs.length}</span>}
      </button>
      <button className="hx-hbtn danger" onClick={() => canClear && setShowClear(true)} disabled={!canClear} title="مسح المحادثة" aria-label="مسح المحادثة">
        <Trash2 size={17} />
      </button>
    </div>
  </div>
</header>

      {/* Chat */}
      <main
        ref={scrollRef}
        className="hx-main flex-1 overflow-y-auto px-3 pt-5 md:px-6"
        style={{ paddingBottom: '13rem' }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setShowDown(el.scrollHeight - el.scrollTop - el.clientHeight > 220);
        }}
      >
        <div className="mx-auto w-full max-w-3xl">
          {messages.length === 1 && (
            <div className="mb-8 hx-up">
              <div className="hx-hero mx-auto max-w-md p-8 text-center">
                <div className="hx-hero-icon hx-float mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full">
                  <Search size={36} color="#059669" />
                </div>
                <h3 className="hx-gradtext mb-2 text-2xl font-extrabold" style={{ margin: '0 0 .5rem' }}>
                  كيف يمكنني مساعدتك؟
                </h3>
                <p className="mb-5 text-sm font-medium leading-relaxed" style={{ color: 'var(--muted)', margin: '0 0 1.2rem' }}>
                  اكتب نص الحديث أو جزءاً منه، وسأعرض لك درجته وتخريجه وأقوال المحدثين.
                </p>
                <div className="grid gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button key={ex} className="hx-chipbtn hx-up" style={{ animationDelay: `${0.15 + i * 0.1}s` }} onClick={() => handleSend(ex)}>
                      <span>✦</span>{ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} isFav={isFav} onToggleFav={toggleFav} onToast={setToast} />
          ))}
        </div>
      </main>

      {showDown && (
        <button
          className="hx-scrollbtn"
          onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
          aria-label="للأسفل"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* Footer */}
      <footer className="hx-footer">
        <div className="mx-auto max-w-3xl">
          <div className="hx-input">
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="اكتب نص الحديث للتحقق منه..."
            />
            <button className="hx-send" onClick={() => handleSend()} disabled={!input.trim() || isTyping} title="إرسال">
              {isTyping ? <div className="hx-spin" /> : <Send size={20} style={{ transform: 'scaleX(-1) rotate(15deg)' }} />}
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: 'var(--muted)', margin: '.7rem 0 0' }}>
            ( نضّر الله امرأً سمع مقالتي فوعاها حتى يؤديها إلى من لم يسمعها )
          </p>
<a className="hx-credit" href="https://bakrhasan.vercel.app/" target="_blank" rel="noopener noreferrer">
  صُمِّم وطُوِّر بكل
  <span className="hx-heartwrap">
    <span className="hx-heart">💚</span>
    <i>♥</i><i>♥</i><i>♥</i>
  </span>
  بواسطة
  <b className="hx-name">أبوبكر حسن</b>
</a>
        </div>
      </footer>

      {/* Favorites drawer */}
      {showFavs && (
        <div className="hx-backdrop" onClick={() => setShowFavs(false)}>
          <aside className="hx-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <h3 className="flex items-center gap-2 font-extrabold" style={{ margin: 0 }}>
                <Star size={20} color="#f59e0b" fill="#f59e0b" /> أحاديثي المفضلة
              </h3>
              <button className="hx-act" onClick={() => setShowFavs(false)}><X size={18} /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {favs.length === 0 && (
                <p className="mt-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  لم تحفظ أي حديث بعد. اضغط ⭐ على أي حديث لحفظه.
                </p>
              )}
              {favs.map((h, i) => (
                <div key={h.id} className={`hx-card hx-up hx-lv-${h.level} p-4`} style={{ animationDelay: `${i * 0.06}s` }}>
                  <span className="hx-lvchip">{h.grade ? h.grade.slice(0, 40) : 'غير محدد'}</span>
                  <p className="hx-t-hadith hadith-font" style={{ margin: '.6rem 0 0' }}>«{h.text}»</p>
                  <p className="hx-t-small" style={{ color: 'var(--muted)', margin: '.5rem 0 0' }}>
                    {h.source} {h.page && `— ${h.page}`}
                  </p>
                  <div className="mt-2 flex justify-end gap-1">
                    <button className="hx-act" onClick={() => { navigator.clipboard.writeText(formatForShare(h)); setToast('تم النسخ'); }}>
                      <Copy size={17} />
                    </button>
                    <button className="hx-act" style={{ color: '#fb7185' }} onClick={() => toggleFav(h)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Clear confirm */}
      {showClear && (
        <div className="hx-backdrop flex items-center justify-center">
          <div className="hx-modal">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ margin: '0 0 .4rem', fontSize: '1rem' }}>تأكيد مسح المحادثة</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)', margin: '0 0 1.2rem' }}>
              هل أنت متأكد؟ لن تتأثر أحاديثك المفضلة.
            </p>
            <div className="flex justify-center gap-3">
              <button className="hx-btn soft" onClick={() => setShowClear(false)}>إلغاء</button>
              <button className="hx-btn red" onClick={clearChat}>نعم، مسح</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div key={toast} className="hx-toast">{toast}</div>}
    </div>
  );
};

export default App;