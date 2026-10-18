import { GradeLevel, GroundingUrl, HadithItem, VerifyResult } from '../types';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const COOLDOWN_MS = 60_000;

// الأول نماذج بها بحث ويب، والأخير بدون بحث (احتياط فقط، مع تحذير للمستخدم)
const CHAIN = [
  { model: 'groq/compound', search: true },
  { model: 'groq/compound-mini', search: true },
  { model: 'openai/gpt-oss-120b', search: false },
];

const KEY: string | undefined = (import.meta as any).env?.VITE_GROQ_API_KEY;

const SYSTEM = `أنت باحث متخصص في تخريج الأحاديث النبوية وبيان درجتها، على منهج أهل السنة والجماعة.

القواعد الصارمة:
1. ابحث في الويب وتحقق من المصادر الموثوقة: الدرر السنية (dorar.net)، الإسلام سؤال وجواب، إسلام ويب، الكتب الستة ومسند أحمد، وأحكام الألباني.
2. لا تؤلف حديثاً ولا حكماً ولا رقم حديث. إن لم تتأكد فاترك الحقل فارغاً أو اجعل الدرجة "unknown".
3. لا تنسب حكماً لمحدّث إلا إذا وجدته فعلاً في مصدر.
4. إن كان الحديث ضعيفاً أو موضوعاً فاذكر ذلك بوضوح مع السبب في summary، وأعطِ بديلاً صحيحاً في نفس الباب إن وجدته فعلاً.
5. إن كان السؤال حكماً شرعياً لا حديثاً بعينه، فأعطِ أصح ما ورد في الباب.
6. أجب بصيغة JSON فقط، بدون أي نص قبله أو بعده وبدون markdown.`;

const FORMAT = `
صيغة الرد (JSON فقط):
{
  "found": true,
  "summary": "خلاصة الحكم في 2 إلى 4 أسطر، مع سبب الضعف إن كان ضعيفاً، واختلاف المحدثين إن وُجد",
  "note": "فائدة توضيحية قصيرة (اختياري)",
  "hadiths": [
    {
      "text": "نص الحديث",
      "rawi": "الراوي (الصحابي)",
      "muhaddith": "المحدّث صاحب الحكم",
      "source": "الكتاب والباب",
      "page": "رقم الحديث أو الصفحة",
      "grade": "نص الحكم كما قاله المحدّث",
      "level": "sahih | hasan | daif | mawdu | unknown"
    }
  ],
  "alternative": null
}
- hadiths: أقرب حديث لسؤال المستخدم أولاً، ثم حتى حديثين آخرين إن وُجدوا.
- alternative: بنفس شكل عنصر hadiths، يُملأ فقط إذا كان الحديث المسؤول عنه ضعيفاً أو موضوعاً ووجدت بديلاً صحيحاً حقيقياً، وإلا null.
- إن لم تجد الحديث فاجعل found=false و hadiths=[] واشرح في summary.`;

const LEVELS: GradeLevel[] = ['sahih', 'hasan', 'daif', 'mawdu', 'unknown'];

const gradeLevel = (g: string): GradeLevel => {
  if (!g) return 'unknown';
  if (/موضوع|لا أصل له|لا اصل له|باطل|مكذوب/.test(g)) return 'mawdu';
  if (/ضعيف|منكر|لا يصح|ليس بصحيح|غير صحيح|واه|شاذ/.test(g)) return 'daif';
  if (/صحيح|ثابت/.test(g)) return 'sahih';
  if (/حسن/.test(g)) return 'hasan';
  return 'unknown';
};

const hashId = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'h' + Math.abs(h).toString(36);
};

const str = (v: any) => (typeof v === 'string' ? v.trim() : '');

const toItem = (raw: any): HadithItem | null => {
  const text = str(raw?.text);
  if (text.length < 5) return null;
  const grade = str(raw?.grade);
  let level = gradeLevel(grade);
  if (level === 'unknown' && LEVELS.includes(raw?.level)) level = raw.level;
  return {
    id: hashId(text.slice(0, 80)),
    text,
    rawi: str(raw?.rawi),
    muhaddith: str(raw?.muhaddith),
    source: str(raw?.source),
    page: str(raw?.page),
    grade,
    level,
  };
};

const parseJson = (t: string) => {
  const clean = t.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json|```/g, '').trim();
  const m = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? m[0] : clean);
};

class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

async function callGroq(model: string, query: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `السؤال أو نص الحديث: "${query}"\n${FORMAT}` },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HttpError(res.status, body.slice(0, 300));
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const cleanUrl = (u: string) => u.replace(/[)\]}>.,;"']+$/, '');

/** روابط البحث التي استخدمها نظام compound (إن وُجدت) */
const extractUrls = (msg: any): GroundingUrl[] => {
  const map = new Map<string, GroundingUrl>();
  const add = (uri?: string, title?: string) => {
    const u = cleanUrl(String(uri || '').trim());
    if (/^https?:\/\//.test(u) && !map.has(u)) {
      let host = '';
      try {
        host = new URL(u).hostname.replace(/^www\./, '');
      } catch {}
      map.set(u, { uri: u, title: (title || '').trim() || host || 'مصدر خارجي' });
    }
  };

  for (const tool of msg?.executed_tools || []) {
    const sr = tool?.search_results;
    const results = Array.isArray(sr) ? sr : sr?.results || [];
    for (const r of results) add(r?.url || r?.link, r?.title);

    // احتياط: أي رابط ظاهر في مخرجات الأداة نفسها
    const out = typeof tool?.output === 'string' ? tool.output : '';
    for (const m of out.match(/https?:\/\/[^\s"'<>)\]]+/g) || []) add(m);
  }
  return Array.from(map.values()).slice(0, 8);
};

/** روابط بحث ثابتة تظهر دائماً للمراجعة اليدوية */
const withSearchLinks = (urls: GroundingUrl[], text: string): GroundingUrl[] => {
  const q = text.replace(/\s+/g, ' ').trim().slice(0, 80);
  const extra: GroundingUrl[] = [
    { uri: `https://dorar.net/hadith/search?q=${encodeURIComponent(q)}`, title: '🔎 ابحث في الدرر السنية' },
    { uri: `https://www.google.com/search?q=${encodeURIComponent('حكم حديث ' + q)}`, title: '🔎 ابحث في Google' },
  ];
  return [...urls, ...extra];
};

export class HadithService {
  private blockedUntil = 0;

  get aiEnabled() {
    return !!KEY && Date.now() > this.blockedUntil;
  }

  async verify(rawQuery: string, onProgress?: (s: string) => void): Promise<VerifyResult> {
    const base: VerifyResult = { query: rawQuery, hadiths: [], mode: 'ai', urls: [] };
    const say = (summary: string): VerifyResult => ({ ...base, summary });

    if (!KEY) {
      return say('مفتاح Groq غير موجود. ضعه في ملف .env باسم VITE_GROQ_API_KEY ثم أعد تشغيل المشروع.');
    }
    if (Date.now() < this.blockedUntil) {
      const s = Math.ceil((this.blockedUntil - Date.now()) / 1000);
      return say(`وصلنا لحد الطلبات المجاني. جرّب بعد ${s} ثانية.`);
    }

    onProgress?.('جاري البحث في المصادر الشرعية ...');

    let res: any = null;
    let usedSearch = false;
    let lastErr: any;

    for (const step of CHAIN) {
      try {
        res = await callGroq(step.model, rawQuery);
        usedSearch = step.search;
        break;
      } catch (e: any) {
        lastErr = e;
        if (e?.status === 401) {
          return say('مفتاح Groq غير صحيح. تأكد منه في ملف .env وأعد تشغيل المشروع.');
        }
        // 429 أو غيره: جرّب النموذج التالي
      }
    }

    if (!res) {
      console.warn('Groq failed:', lastErr);
      if (lastErr?.status === 429) {
        this.blockedUntil = Date.now() + COOLDOWN_MS;
        return say('وصلنا لحد الطلبات المجاني على Groq. جرّب بعد دقيقة.');
      }
      return say('تعذر الاتصال بالمصادر الآن. تحقق من الإنترنت والمفتاح وحاول مرة أخرى.');
    }

    onProgress?.('جاري تنسيق النتيجة ...');
    const msg = res?.choices?.[0]?.message;
    const urls = extractUrls(msg);

    let data: any;
    try {
      data = parseJson(msg?.content || '');
    } catch {
      const t = str(msg?.content);
      return t
        ? { ...base, summary: t, urls: withSearchLinks(urls, rawQuery) }
        : say('لم أتمكن من الحصول على نتيجة دقيقة. جرّب صياغة أخرى.');
    }

    const hadiths = ((data.hadiths as any[]) || []).map(toItem).filter(Boolean) as HadithItem[];
    let alternative = data.alternative ? toItem(data.alternative) : null;
    if (alternative && alternative.level !== 'sahih' && alternative.level !== 'hasan') alternative = null;
    const lvl = hadiths[0]?.level;
    if (lvl === 'sahih' || lvl === 'hasan') alternative = null;

    const summary = str(data.summary);
    if (!hadiths.length && !summary) return say('لم أجد نتيجة دقيقة. جرّب كتابة جزء أطول من نص الحديث.');

    const warn = usedSearch
      ? ''
      : '⚠️ هذه الإجابة من النموذج بدون بحث على الويب، فقد تكون غير دقيقة. تحقق منها من الدرر السنية قبل الاعتماد عليها.';

    return {
      ...base,
      hadiths,
      alternative,
      summary: [warn, summary].filter(Boolean).join('\n\n') || undefined,
      note: str(data.note) || undefined,
      urls: withSearchLinks(urls, hadiths[0]?.text || rawQuery),
    };
  }
}

export const hadithService = new HadithService();