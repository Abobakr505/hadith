import React, { useState } from 'react';
import {
  BookCheck, BookOpenCheck, Check, ChevronDown, Copy, Library, Link2, NotebookPen,
  ScrollText, ShieldAlert, ShieldCheck, Share2, Sparkles, Star, UserRound,
} from 'lucide-react';
import { GradeLevel, HadithItem, Message } from '../types';

interface Props {
  message: Message;
  isFav: (id: string) => boolean;
  onToggleFav: (h: HadithItem) => void;
  onToast: (t: string) => void;
}

const LEVEL_LABEL: Record<GradeLevel, string> = {
  sahih: 'صحيح',
  hasan: 'حسن',
  daif: 'ضعيف',
  mawdu: 'موضوع / لا أصل له',
  unknown: 'غير محدد',
};

export const formatForShare = (h: HadithItem) =>
  `«${h.text}»\n\n` +
  [
    h.rawi && `الراوي: ${h.rawi}`,
    h.muhaddith && `المحدث: ${h.muhaddith}`,
    h.source && `المصدر: ${h.source}${h.page ? ' - ' + h.page : ''}`,
    h.grade && `الحكم: ${h.grade}`,
  ]
    .filter(Boolean)
    .join('\n') +
  '\n\n— محقّق الأحاديث';

const HadithCard: React.FC<{
  item: HadithItem;
  variant: 'main' | 'alt' | 'other';
  index?: number;
  fav: boolean;
  onFav: () => void;
  onToast: (t: string) => void;
}> = ({ item, variant, index = 0, fav, onFav, onToast }) => {
  const [copied, setCopied] = useState(false);
  const good = item.level === 'sahih' || item.level === 'hasan';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatForShare(item));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      onToast('تعذر النسخ');
    }
  };

  const share = async () => {
    if (navigator.share) {
      navigator.share({ title: 'حديث', text: formatForShare(item) }).catch(() => {});
    } else {
      await copy();
      onToast('تم نسخ الحديث للمشاركة');
    }
  };

  return (
    <div
      className={`hx-hcard hx-lv-${item.level} ${variant === 'alt' ? 'alt' : ''} hx-up`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <span className="hx-quote">”</span>
      <div style={{ padding: '1rem 1.2rem 0.6rem 1rem' }}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="hx-lvchip hx-pop">
            {good ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
            {LEVEL_LABEL[item.level]}
          </span>
          {variant === 'alt' && (
            <span className="hx-lvchip hx-lv-sahih">
              <Sparkles size={14} /> البديل الصحيح
            </span>
          )}
        </div>

        <p className="hx-t-hadith hadith-font" style={{ margin: 0 }}>«{item.text}»</p>

        <div className="hx-t-small mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {item.rawi && (
            <div className="hx-field"><UserRound size={15} className="mt-1 shrink-0" /><span><b>الراوي:</b> {item.rawi}</span></div>
          )}
          {item.muhaddith && (
            <div className="hx-field"><Library size={15} className="mt-1 shrink-0" /><span><b>المحدّث:</b> {item.muhaddith}</span></div>
          )}
          {item.source && (
            <div className="hx-field sm:col-span-2"><BookCheck size={15} className="mt-1 shrink-0" /><span><b>التخريج:</b> {item.source}{item.page ? ` — ${item.page}` : ''}</span></div>
          )}
          {item.grade && (
            <div className="hx-field sm:col-span-2"><ScrollText size={15} className="mt-1 shrink-0" /><span><b>الحكم:</b> {item.grade}</span></div>
          )}
        </div>

        <div className="mt-3 flex justify-end gap-1" style={{ borderTop: '1px solid var(--line)', paddingTop: '.4rem' }}>
          <button className={`hx-act ${fav ? 'fav' : ''}`} onClick={onFav} title="حفظ في المفضلة">
            <Star size={18} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button className={`hx-act ${copied ? 'ok' : ''}`} onClick={copy} title="نسخ">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button className="hx-act" onClick={share} title="مشاركة">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatBubble: React.FC<Props> = ({ message, isFav, onToggleFav, onToast }) => {
  const isUser = message.role === 'user';
  const [showMore, setShowMore] = useState(false);
  const r = message.result;

  const renderBody = () => {
    if (message.status === 'loading') {
      return (
        <div className="hx-fade">
          <div className="mb-4 flex items-center gap-3">
            <div className="hx-dotsload"><i /><i /><i /></div>
            <span className="hx-t-small" style={{ fontWeight: 800, color: 'var(--brand2)' }}>
              {message.content || 'جاري مراجعة المصادر الشرعية ...'}
            </span>
          </div>
          <div className="space-y-2">
            <div className="hx-skel" style={{ width: '92%' }} />
            <div className="hx-skel" style={{ width: '78%' }} />
            <div className="hx-skel" style={{ width: '60%' }} />
          </div>
        </div>
      );
    }

    if (!r) {
      return <div className="hx-t-body whitespace-pre-wrap">{message.content}</div>;
    }

    const [main, ...others] = r.hadiths;

    return (
      <div className="space-y-3">
        {r.summary && (
          <div className="hx-summary hx-up">
            <h4 className="hx-h" style={{ color: 'var(--brand2)' }}>
              <Sparkles size={15} />
              {r.hadiths.length === 0 ? 'ملاحظة' : 'الخلاصة'}
            </h4>
            <p className="hx-t-body whitespace-pre-wrap" style={{ margin: 0 }}>{r.summary}</p>
          </div>
        )}

        {main && (
          <HadithCard item={main} variant="main" index={1} fav={isFav(main.id)} onFav={() => onToggleFav(main)} onToast={onToast} />
        )}

        {r.alternative && (
          <HadithCard item={r.alternative} variant="alt" index={2} fav={isFav(r.alternative.id)} onFav={() => onToggleFav(r.alternative!)} onToast={onToast} />
        )}

        {others.length > 0 && (
          <div>
            <button className="hx-more" onClick={() => setShowMore((s) => !s)}>
              <span>نتائج أخرى مشابهة ({others.length})</span>
              <ChevronDown size={18} style={{ transition: 'transform .3s', transform: showMore ? 'rotate(180deg)' : 'none' }} />
            </button>
            {showMore && (
              <div className="mt-3 space-y-3">
                {others.map((h, i) => (
                  <HadithCard key={h.id} item={h} variant="other" index={i} fav={isFav(h.id)} onFav={() => onToggleFav(h)} onToast={onToast} />
                ))}
              </div>
            )}
          </div>
        )}

        {r.note && (
          <div className="hx-note hx-up" style={{ animationDelay: '.25s' }}>
            <h4 className="hx-h" style={{ color: 'var(--gold)' }}><NotebookPen size={15} /> فائدة توضيحية</h4>
            <p className="hx-t-small" style={{ margin: 0 }}>{r.note}</p>
          </div>
        )}

        {r.hadiths.length === 0 && !r.summary && (
          <p className="hx-t-body" style={{ color: 'var(--muted)' }}>
            لم أجد نتيجة دقيقة. جرّب كتابة جزء أطول من نص الحديث أو كلمات مفتاحية أوضح.
          </p>
        )}

        {r.hadiths.length > 0 && (
          <p className="hx-t-tiny" style={{ color: 'var(--muted)'}}>
            {r.mode === 'dorar+ai'
              ? 'المصدر: الدرر السنية + تحليل ذكي'
              : r.mode === 'dorar'
              ? 'المصدر: الدرر السنية'
              : 'نتيجة آلية بالبحث والذكاء الاصطناعي، راجع المصادر قبل النشر'}
            {' — '}يُرجى الرجوع لأهل العلم عند الحاجة.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`mb-6 flex w-full ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`hx-bubble hx-up ${isUser ? 'hx-bubble-user' : 'hx-bubble-bot'}`}>
        <div className="mb-3 flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
          <span className={`hx-avatar ${isUser ? 'user' : ''}`}>
            {isUser ? <UserRound size={15} /> : <BookOpenCheck size={15} />}
          </span>
          <span className="hx-t-small" style={{ fontWeight: 800, color: 'var(--brand2)' }}>
            {isUser ? 'سؤال السائل' : 'المحقق الشرعي'}
          </span>
          <div className="flex-1" />
          <span className="hx-t-tiny" style={{ color: 'var(--muted)' }}>
            {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {isUser ? (
          <div className="hx-t-body whitespace-pre-wrap" style={{ fontWeight: 500 }}>{message.content}</div>
        ) : (
          renderBody()
        )}

        {!isUser && r?.urls && r.urls.length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
            <p className="hx-t-tiny mb-2 flex items-center gap-1" style={{ fontWeight: 800, color: 'var(--muted)' }}>
              <Link2 size={13} /> روابط المراجعة
            </p>
            <div className="flex flex-wrap gap-2">
              {r.urls.map((u, i) => (
                <a key={i} href={u.uri} target="_blank" rel="noopener noreferrer" className="hx-link">
                  {u.title || 'المرجع'}
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